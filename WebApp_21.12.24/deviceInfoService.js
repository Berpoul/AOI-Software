/*
  This module reports the firmware version and serial number.
  Whenever the device connects to the GUI, the 2 characteristics from the deviceInfoService
  are read. Then the information is printed to the console.
  The list of predefined service and characteristic names is available from:
  https://googlechrome.github.io/samples/web-bluetooth/device-information-characteristics.html

  NOTE: The Serial Number string is blocklisted and forbidden from being accessed. Thus, I am
  providing the serial number in the 'system_id' instead.
*/

'use strict'
let latestFirmwareRev = "21.12.24.0";

listOfServices.push('device_information'); //appends this service to the array (defined in main.js).

async function initDeviceInfoService(oi){
  try{
    //NOTE: If we make these immutable, we can't have the reconnect feature becase we must reinvoke this function on reconnect.
    oi.deviceInfoService = await oi.bleServer.getPrimaryService('device_information');
    oi.deviceInfoService.chrFirmwareRev = await oi.deviceInfoService.getCharacteristic('firmware_revision_string');
    oi.deviceInfoService.chrSystemID = await oi.deviceInfoService.getCharacteristic('system_id');

    oi.log("DeviceInfo Service Initialized");

    //########################--- Define API Methods ---######################
    oi.getFirmwareRev = async function(){
      let firmwareRevDataView = await oi.deviceInfoService.chrFirmwareRev.readValue(); //returns 10-byte DataView
      //A dataview is also called an ArrayBuffer. To see its internal structure, simply type into the console
      //the following: "await ois[0].deviceInfoService.chrFirmwareRev.readValue();"
      let encoder = new TextDecoder("ascii");
      return encoder.decode(firmwareRevDataView);
    }

    oi.getSystemID = async function(){
      let systemIDDataView = await oi.deviceInfoService.chrSystemID.readValue(); //returns a DataView, 16 byte.
      let encoder = new TextDecoder("ascii");
      return encoder.decode(systemIDDataView);
    }
    //########################--- END: Define API Methods ---######################
    //Print the firmware version to the log and the System ID:
    let firmwareRev = await oi.getFirmwareRev(); //We must do the await outside the .log function.
    let systemID = await oi.getSystemID(); //We must do the await outside the .log function.
    oi.log("System ID: " + systemID);
    if(firmwareRev!=latestFirmwareRev){
      oi.log("######################");
      oi.log("New Firmware Version available: " + latestFirmwareRev);
      oi.log("Your device Fimware Version is: " + firmwareRev);
      oi.log("######################");
    }
    else{
      oi.log("Firmware is up to date! Ver: " + firmwareRev);
    }
  }
  catch(error){
    oi.log("FlowIO initDeviceInfoService() error :( " + error); //NOTE: When we catch the error, execution will
    //continue and this error will not be visible by anyone who called initDeviceInfoService().
    //Thus, to make the caller aware that initDeviceInfoService() gave an arror, we must
    ///raise owr own error here.
    throw "FlowIO initDeviceInfoService() error :(.";
    //Anything we put here after "throw" line will not get executed.
  }
}
