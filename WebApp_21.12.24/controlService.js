/* The ascii character hex equivalencies are:
  ! = 0x21 -- stop
  + = 0x2b -- inflation
  - = 0x2d -- vacuum
  ^ = 0x5e -- release
  ? = 0x3f -- pressure
  p = 0x70
  n = 0x6e

  This API has the following methods and constants:

  ois[0].controlService
  ois[0].controlService.chrCommand
  ois[0].controlService.chrHardwareStatus

  ois[0].status
  ois[0].status.active
  ois[0].status.hardwareStatus
  ois[0].status.pump1
  ois[0].status.pump2
  ois[0].status.inlet
  ois[0].status.outlet
  ois[0].status.port1
  ois[0].status.port2
  ois[0].status.port3
  ois[0].status.port4
  ois[0].status.port5

  ois[0].getHardwareStatus()
  ois[0].writeCommand(what,where,how=MAXPWM)
  ois[0].commandArray[what,where,how]
  ois[0].startInflation(where,how=oi.pump1PWM)
  ois[0].startVacuum (where,how=oi.pump2PWM)
  ois[0].startRelease(where)
  ois[0].stopAction(where)
  ois[0].stopAllActions()
  ois[0].setPump1PWM(pwmValue)
  ois[0].setPump2PWM(pwmValue)
*/
const STOP = 0x21;
const INFLATION = 0x2b;
const VACUUM = 0x2d;
const RELEASE = 0x5e;
const INFLATION_HALF = 0x70;
const VACUUM_HALF = 0x6e;
//------------
const ALLPORTS = 0xff;
const MAXPWM = 0xff;
//-----------------------------------------------------
'use strict'
const controlServiceUUID    = '0b0b0b0b-0b0b-0b0b-0b0b-00000000aa04';
const chrCommandUUID        = '0b0b0b0b-0b0b-0b0b-0b0b-c1000000aa04';
const chrHardwareStatusUUID = '0b0b0b0b-0b0b-0b0b-0b0b-c2000000aa04';

listOfServices.push(controlServiceUUID); //appends this service to the array (defined in main.js).

async function initControlService(oi){
  try{
    //NOTE: If we make these immutable, we can't have the reconnect feature becase we must reinvoke this function on reconnect.
    oi.controlService = await oi.bleServer.getPrimaryService(controlServiceUUID);
    oi.controlService.chrCommand = await oi.controlService.getCharacteristic(chrCommandUUID);
    oi.controlService.chrHardwareStatus = await oi.controlService.getCharacteristic(chrHardwareStatusUUID);
    //subscribe to receive characteristic notification events:
    await oi.controlService.chrHardwareStatus.startNotifications();
    oi.controlService.chrHardwareStatus.addEventListener('characteristicvaluechanged', event => { //an event is returned
      //We want all status object-variables to be changed in the event listener, as soon as they
      //change in the hardware. Not inside the getHardwareStatus() function because there may be
      //a chagne in the hardware status even if we don't invoke this function.
      oi.status = new Object(); //we must define this as an object in order to be able to have children to it.
      oi.status.hardwareStatus = event.target.value.getUint16(0,true).toBinaryString(16); //true causes the endicanness to be correct.
      let byte0 = event.target.value.getUint8(0);
      let byte1 = event.target.value.getUint8(1);
      oi.status.pump1 = (byte0>>7 & 0x01);
      oi.status.pump2 = (byte1 & 0x01);
      oi.status.inlet = (byte0>>5 & 0x01);
      oi.status.outlet = (byte0>>6 & 0x01);
      oi.status.port1 = (byte0>>0 & 0x01);
      oi.status.port2 = (byte0>>1 & 0x01);
      oi.status.port3 = (byte0>>2 & 0x01);
      oi.status.port4 = (byte0>>3 & 0x01);
      oi.status.port5 = (byte0>>4 & 0x01);

      //Create a status active / inactive flag that we can later use in our pressure service when choosing if a pressure value should be assigned to a port.
      if(byte0==0) oi.status.active=false;
      else oi.status.active=true;

      setSvgStatus(oi);
    });

    //########################--- Define API Methods ---######################
    oi.getHardwareStatus = async function(){
      await oi.controlService.chrHardwareStatus.readValue(); //this returns a DataView
      //we don't need to store or process this, because it causes our event litener to be fired.
    }
    //Most important method in the entire API
    oi.writeCommand = async function(what,where,how=MAXPWM){
      //TODO: Make the commandArray 4-bytes after you change the communication protocol to be 4-bytes.
      oi.commandArray = new Uint8Array([what,where,how]); //Always holds the last command written.
      //All action methods are in terms of the writeCommand() method so this is updated automatically.
      //if the third byte is 255, then we are going to send only the first 2bytes to the FlowIO to save time and bandwidth.
      if(oi.commandArray[2]==255){ //in this case only send an array of 2-bytes.
        let array2byte = new Uint8Array([what, where]);
        await oi.controlService.chrCommand.writeValue(array2byte);
      }
      else{
        await oi.controlService.chrCommand.writeValue(oi.commandArray);
      }
    }

    //TODO: After I start using the 4-byte protocol, I should add a 4th optional argument to the action methods.
    //TODO: Add the halfcapacity functions to the API.
    oi.startInflation = async function(where,how=oi.pump1PWM){ //set default value to the pump1pwm flag.
      await oi.writeCommand(INFLATION,where,how);
    }
    oi.startVacuum = async function(where,how=oi.pump2PWM){
      await oi.writeCommand(VACUUM,where,how);
    }
    oi.startRelease = async function(where){
      await oi.writeCommand(RELEASE,where);
    }
    oi.stopAction = async function(where){
      await oi.writeCommand(STOP,where);
    }
    oi.stopAllActions = async function(){
      await oi.writeCommand(STOP,ALLPORTS);
    }

    oi.setPump1PWM = async function(pwmValue){       //we will invoke this function every time the pump1 slider changes.
      oi.pump1PWM = pwmValue; //a flag that can be read at any time if we need to know the PWM value being used.
      //send the same command as the previous one, but only change the pwmValue. Only send command if pump1 is ON.
      if(oi.status.pump1==1){
        try{
          await oi.writeCommand(oi.commandArray[0],oi.commandArray[1],pwmValue);
        }
        catch(error){
          if(error.message!="GATT operation already in progress.") oi.log(error);
          //Display error only if different from this one. Is there a more elegant way
          //to check id device is bysy and then simplu not send the write request, rather
          //than waiting for an error to tell me this?
        }
      }
    }
    oi.setPump2PWM = async function(pwmValue){       //we will invoke this function every time the pump1 slider changes.
      oi.pump2PWM = pwmValue;
      //send the same command as the previous one, but only change the pwmValue. Only send command if pump1 is ON.
      if(oi.status.pump2==1){
        try{
          await oi.writeCommand(oi.commandArray[0],oi.commandArray[1],pwmValue);
        }
        catch(error){
          if(error.message!="GATT operation already in progress.") oi.log(error);
          //Display error only if different from this one.
        }
      }
    }
    //######################################################################
    oi.log("Control Service Initialized");
    //To get initial values for our status table, we must read the hardware status characteristic.
    oi.getHardwareStatus(); //invoke this function to trigger our event listener.
  }
  catch(error){
    oi.log("FlowIO initControlService() error :( " + error);
    throw "FlowIO initControlService() error :(.  ";
  }
}

//###########################--- GUI Specific Functions ---#############################
function getSelectedPorts(oi){ //we invoke this function as an argument to the action methods, IN THE HTML!
  let portsByte = 0x00;
  if(document.querySelector(`#port1_chk${oi.instanceNumber}`).checked) portsByte ^= 0x01; //0 0001
  if(document.querySelector(`#port2_chk${oi.instanceNumber}`).checked) portsByte ^= 0x02; //0 0010
  if(document.querySelector(`#port3_chk${oi.instanceNumber}`).checked) portsByte ^= 0x04; //0 0100
  if(document.querySelector(`#port4_chk${oi.instanceNumber}`).checked) portsByte ^= 0x08; //0 1000
  if(document.querySelector(`#port5_chk${oi.instanceNumber}`).checked) portsByte ^= 0x10; //1 0000
  return portsByte;
}

async function setPump1PWM(oi){
  let pwmInSlider = document.getElementById(`pwm_i${oi.instanceNumber}`);
  let pwmInLabel = document.getElementById(`pwm_i_label${oi.instanceNumber}`);
  pwmInLabel.innerHTML = pwmInSlider.value;
  try{await oi.setPump1PWM(pwmInSlider.value);}
  catch(error){oi.log(error + "(>:<)");}
}
async function setPump2PWM(oi){
  let pwmOutSlider = document.getElementById(`pwm_o${oi.instanceNumber}`);
  let pwmOutLabel = document.getElementById(`pwm_o_label${oi.instanceNumber}`);
  pwmOutLabel.innerHTML = pwmOutSlider.value;
  try{await oi.setPump2PWM(pwmOutSlider.value);}
  catch(error){oi.log(error + " (>:<)");}
}
function setSvgStatus(oi){
  let n = oi.instanceNumber
  document.getElementById(`svg_on_1${n}`).style.visibility = (oi.status.port1==1)? "visible" : "hidden";
  document.getElementById(`svg_on_2${n}`).style.visibility = (oi.status.port2==1)? "visible" : "hidden";
  document.getElementById(`svg_on_3${n}`).style.visibility = (oi.status.port3==1)? "visible" : "hidden";
  document.getElementById(`svg_on_4${n}`).style.visibility = (oi.status.port4==1)? "visible" : "hidden";
  document.getElementById(`svg_on_5${n}`).style.visibility = (oi.status.port5==1)? "visible" : "hidden";
  document.getElementById(`svg_on_inlet${n}`).style.visibility = (oi.status.inlet==1)? "visible" : "hidden";
  document.getElementById(`svg_on_outlet${n}`).style.visibility = (oi.status.outlet==1)? "visible" : "hidden";
  document.getElementById(`svg_off_1${n}`).style.visibility = (oi.status.port1==0)? "visible" : "hidden";
  document.getElementById(`svg_off_2${n}`).style.visibility = (oi.status.port2==0)? "visible" : "hidden";
  document.getElementById(`svg_off_3${n}`).style.visibility = (oi.status.port3==0)? "visible" : "hidden";
  document.getElementById(`svg_off_4${n}`).style.visibility = (oi.status.port4==0)? "visible" : "hidden";
  document.getElementById(`svg_off_5${n}`).style.visibility = (oi.status.port5==0)? "visible" : "hidden";
  document.getElementById(`svg_off_inlet${n}`).style.visibility = (oi.status.inlet==0)? "visible" : "hidden";
  document.getElementById(`svg_off_outlet${n}`).style.visibility = (oi.status.outlet==0)? "visible" : "hidden";

  document.getElementById(`svg_pump1_on${n}`).style.visibility = (oi.status.pump1==1)? "visible" : "hidden";
  document.getElementById(`svg_pump2_on${n}`).style.visibility = (oi.status.pump2==1)? "visible" : "hidden";
  document.getElementById(`svg_pump1_off${n}`).style.visibility = (oi.status.pump1==0)? "visible" : "hidden";
  document.getElementById(`svg_pump2_off${n}`).style.visibility = (oi.status.pump2==0)? "visible" : "hidden";
}
