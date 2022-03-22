/*Implements access to the BLE configuration service of the FlowIO.
The configuration is retrieved upon connecting to the FlowIO and selectedIndex
is changed to reflect the current configuration. The FLowIO encodes the
5 configurations simply as numbers between 0 and 4, and it is in this JS
code that we give names to those numbers. We are simply receing a single-byte
number from the FlowIO when we read the configuration.
*/

//NOTE: The getConfiguration returns a promise not a value that you can assign to a variable.

'use strict'
const configServiceUUID = '0b0b0b0b-0b0b-0b0b-0b0b-00000000aa03';
const chrConfigUUID     = '0b0b0b0b-0b0b-0b0b-0b0b-c1000000aa03';

listOfServices.push(configServiceUUID); //appends this service to the array (defined in main.js).

async function initConfigService(oi){
  try {
    //NOTE: If we make these immutable, we can't have the reconnect feature because we must reinvoke this function on reconnect.
    oi.configService = await oi.bleServer.getPrimaryService(configServiceUUID);
    oi.configService.chrConfig = await oi.configService.getCharacteristic(chrConfigUUID);

    oi.log("Config Service Initialized");

    //########################--- Define API Methods ---######################
    oi.getConfiguration = async function(){
      try{
        let config = await oi.configService.chrConfig.readValue(); //this returns a DataView
        let configNumber = config.getUint8(0);
        try{ //We put this in its own try block because it depends on non-method functions
          showConfiguration(configNumber, this);
        }catch(error){
          oi.log("FlowIO failed to showConfiguration()" + error);
        }
        return configNumber;
      }
      catch(error){
        oi.log("FlowIO failed to getConfiguration() :<");
        throw "FlowIO failed to getConfiguration() :<";
      }
    }
    oi.setConfiguration = async function(configNumber){
      try{
        let valArray = new Uint8Array([configNumber]);
        await oi.configService.chrConfig.writeValue(valArray);
        //If someone invokes this function externally, we want to change the display in the GUI too:
        showConfiguration(configNumber, this);
      }
      catch(error){
        oi.log("FlowIO failed to setConfiguration() :<");
        // throw "FlowIO failed to setConfiguration() :<";
      }
    }
    //########################--- END: Define API Methods ---######################

    oi.getConfiguration(); //invoke the function to display the current config.
  }
  catch (error){
    oi.log("FlowIO initConfigService() error :( " + error);
    throw "FlowIO initConfigService() error :( ";
  }
}
//###########################--- BEGIN Standalone Functions ---####################
//none of our methods above must ever depend on the existance of functions below.
//These functions can depend on our methods, but not the other way around.
//Unfortunately, for now we have a dependence on the showConfiguration() function.


//This function gets called when we select a new configuration from the list
async function applySelectedConfiguration(oi){
  let val=-1;
  if(document.getElementById(`general${oi.instanceNumber}`).checked) val=0;
  else if(document.getElementById(`inf_series${oi.instanceNumber}`).checked) val=1;
  else if(document.getElementById(`inf_parallel${oi.instanceNumber}`).checked) val=2;
  else if(document.getElementById(`vac_series${oi.instanceNumber}`).checked) val=3;
  else if(document.getElementById(`vac_parallel${oi.instanceNumber}`).checked) val=4;
  await oi.setConfiguration(val);
  setSvgConfigTo(val,oi.instanceNumber);
}
function showConfiguration(configNumber, oi){
  if(configNumber==0) document.querySelector(`#general${oi.instanceNumber}`).checked = true;
  else if(configNumber==1) document.querySelector(`#inf_series${oi.instanceNumber}`).checked = true;
  else if(configNumber==2) document.querySelector(`#inf_parallel${oi.instanceNumber}`).checked = true;
  else if(configNumber==3) document.querySelector(`#vac_series${oi.instanceNumber}`).checked = true;
  else if(configNumber==4) document.querySelector(`#vac_parallel${oi.instanceNumber}`).checked = true;
  oi.configuration = convertConfigNumToString(configNumber);
  oi.log("Configuration is: " + oi.configuration);
  setSvgConfigTo(configNumber,oi.instanceNumber);
}
function convertConfigNumToString(configNumber){ //converts the configNumber to string
  let configString;
  if(configNumber==0)       configString = 'GENERAL';
  else if(configNumber==1)  configString = 'INFLATION_SERIES';
  else if(configNumber==2)  configString = 'INFLATION_PARALLEL';
  else if(configNumber==3)  configString = 'VACUUM_SERIES';
  else if(configNumber==4)  configString = 'VACUUM_PARALLEL';
  return configString;
}

//This function controls which parts of the graphic are being displayed
function setSvgConfigTo(conf,i){ //argument is the configuration number.
  document.getElementById(`svg_tubeInlet${i}`).style.visibility = (conf==0 || conf==1 || conf==2)? "visible" : "hidden";
  document.getElementById(`svg_tubeOutlet${i}`).style.visibility = (conf==0 || conf==3 || conf==4)? "visible" : "hidden";
  document.getElementById(`svg_tubeSeries${i}`).style.visibility = (conf==1 || conf==3)? "visible" : "hidden";
  document.getElementById(`svg_tubeParallelInf${i}`).style.visibility = (conf==2)? "visible" : "hidden";
  document.getElementById(`svg_tubeParallelVac${i}`).style.visibility = (conf==4)? "visible" : "hidden";
}
//This function controls the air color
function setSvgAirColor(pressure){ //Sets the air color based on pressure input. Gradient scale b/n Low=green and High=blue.
  //This is best achieved with HSL; only H value needs to vary! https://www.w3schools.com/colors/colors_hsl.asp
  //Mas pressure will be hsl(300, 90%, 90%); while min pressure hsl(100, 90%, 90%).
  //Hence want a linear map of the pressure reange [0,30] to the color range [100,300].
  //The linear map formulat is derived in the "Linear Range Mapping" doc in my google drive.
  //y(x) = x*slope + yMin
  //y(x) = x*(yMax-yMin)/(xMax-xMin) + yMin
  let valH = pressure*(300-100)/(30-0) + 100;
  valH = Math.round(valH);
  let elements = document.getElementsByClassName("svg_air");
  for(let i=0; i<elements.length; i++){
    elements[i].style.fill=`hsl(${valH}, 90%, 90%)`;
  }
  //return `hsl(${valH}, 90%, 90%)`;
}
