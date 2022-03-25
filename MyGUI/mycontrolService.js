/* The ascii character hex equivalencies are:
  + = 0x21 -- power circuit on 
  - = 0x2b -- power circuit off 
  n = 0x2d -- piezzo on 
  f = 0x5e -- piezzo off
  ! = 0x3f -- stop everything
*/
const POWERON = 0x21;
const POWEROFF = 0x2b;
const PIEZZOON = 0x2d;
const PIEZZOOFF = 0x5e;
const STOP = 0x3f;
/*
  This API has the following methods and constants:

  ois[0].controlService
  ois[0].controlService.chrCommand
  ois[0].controlService.chrHardwareStatus

  ois[0].status
  ois[0].status.active
  ois[0].status.hardwareStatus
  ois[0].status.piezzo1
  ois[0].status.piezzo2
  ois[0].status.piezzo3
  ois[0].status.piezzo4
  ois[0].status.piezzo5
  ois[0].status.piezzo6
  ois[0].status.piezzo7
  ois[0].status.piezzo8
  ois[0].status.circuit


  ois[0].setPiezzo(piezzo,Value)
  ois[0].setCircuit(Value)
*/

//-----------------------------------------------------
'use strict'
const controlServiceUUID    = '0b0b0b0b-0b0b-0b0b-0b0b-00000000aa04';
const chrCommandUUID        = '0b0b0b0b-0b0b-0b0b-0b0b-c1000000aa04';
const chrHardwareStatusUUID = '0b0b0b0b-0b0b-0b0b-0b0b-c2000000aa04';

//listOfServices.push(controlServiceUUID); //appends this service to the array (defined in conditions.js).

async function initControlService(oi){
  

    try {
    //########################--- Define API Methods ---######################
    oi.getHardwareStatus = async function(){
      await oi.controlService.chrHardwareStatus.readValue(); //this returns a DataView
      //we don't need to store or process this, because it causes our event litener to be fired.
    }
    //Most important method in the entire API
    oi.writeCommand = async function(what,where){
      oi.commandArray = new Uint8Array([what,where]); //Always holds the last command written.
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

    oi.piezzoOn = async function(where,how){ //set default value to the pump1pwm flag.
      await oi.writeCommand(INFLATION,where);
    }
    oi.piezzoOff = async function(where,how=oi.pump2PWM){
      await oi.writeCommand(VACUUM,where,how);
    }
    oi.startRelease = async function(where){
      await oi.writeCommand(RELEASE,where);
    }
    oi.powerOff = async function(){
      await oi.writeCommand(STOP,where);
    }
    oi.powerOn = async function(){
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
    oi.log("OI initControlService() error :( " + error);
    throw "OI initControlService() error :(.  ";
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
