

////You can find the names of service names defined in the Web Bluetooth API at
//https://googlechrome.github.io/samples/web-bluetooth/characteristic-properties-async-await.html
let listOfServices = ['generic_access']; //NEVER modify this, and let each sdrvice push its UUID to it using .push() method.
const DEVICE_NAME_PREFIX = 'OI'; //Allow devices STARTING with this name

let ois = []; //this will hold all of our flowio object instances.
createNewInstance(); //automatically create the "flowio[0]" instance


function createNewInstance(){
    ois.push(new Object());
    let i = ois.length-1; //index number
    ois[i].instanceNumber = i;
    ois[i].destroyInstance = function(){
      if(ois[this.instanceNumber].isConnected) ois[this.instanceNumber].disconnect;
      delete ois[this.instanceNumber];
    }


    ois[i].log = function(text){
        console.log(text);
        document.querySelector(`#log${i}`).textContent = text + '\n' + document.querySelector(`#log${i}`).textContent;
      }
      ois[i].clearLog = function(){
        console.log("ClearLog-#" + i);
        document.querySelector(`#log${i}`).textContent = "";
      }
}


async function initializeAllServices(oi){
    try{
      await initConfigService(oi); //defined in "configService.js"
      await initControlService(oi); //defined in "controlService.js"
      await initIndicatorService(oi); //defined in "indicatorService.js"
    }catch(error){
      console.log("OI error: initializeAllServices() failed :( " + error);
      throw "OI error: initializeAllServices() failed :("
    }
  }

async function connectDevice(oi) { //the argument is a SINGLE instance, not an array of instances.
    //oi.showLoadingBtn();
    //oi.hideReconnectBtn();
    let deviceOptions = {filters: [{namePrefix: DEVICE_NAME_PREFIX}],  optionalServices: listOfServices};
    //the 'listOfServices' is defined in the conditions.js file.
    try{
      let bleDevice = await navigator.bluetooth.requestDevice(deviceOptions);
      bleDevice.addEventListener('gattserverdisconnected', event => {
        oi.log("Disconnected from: " + event.target.name + ", " + event.target.id);
      }); //create and event lisner for disconnect events.
      let bleServer = await bleDevice.gatt.connect();
  
      //This is how we define IMMUTABLE properties.
      Object.defineProperty(oi, 'bleDevice',{value:bleDevice}); //Equivalent to: this.bleDevice = bleDevice. (IMMUTABLE)
      Object.defineProperty(oi, 'bleServer',{value:bleServer}); //Equivalent to: this.bleServer = bleServer. (IMMUTABLE)
  
      Object.defineProperty(oi, 'isConnected',{value:bleDevice.gatt.connected});//this.isConnected = bleDevice.gatt.connected; (IMMUTABLE)
      Object.defineProperty(oi, 'disconnect',{get:function(){disconnectDevice(this)}});//this.disconnect = function(){disconnectDevice(this)}; (IMMUTABLE)
      Object.defineProperty(oi, 'reconnect',{get:function(){reconnectDevice(this)}}); //this.reconnect=function(){reconnectDevice(this)}; (IMMUTABLE)
      //we can't just define as this.reconnect = reconnect(this) because that will cause invocation at the time of definition. You invoke a function using ().
  
      try{
        await initializeAllServices(oi);
        oi.log("\nConnected and Initialized!");
      }catch(error){
        oi.log("FlowIO failed to init services :(. The error is" + error)
      }
    }
    catch(error){
      oi.log("FlowIO-" + oi.instanceNumber + " connect request cancelled");
    }
  }
  
  async function reconnectDevice(oi, reconnectAttempt=0){
    //NOTE: If we reconnect immediately after having disconnected, the reconnection will
    //happen fine, but the service initialization will fail, and then the connection
    //will drop. To fix this problem, we recursively call the reconnect() function
    //in the catch block below until we reconnect successffully or up to 3 tries.
    if (oi.bleDevice && !oi.bleDevice.gatt.connected){ //if a device exists but is not connected:
      oi.log("\nReconnecting...");
      try{
        await oi.bleDevice.gatt.connect(); //connect to the same bleDevice.
      }catch(error){
        oi.log(error);
        oi.log("The FlowIO device is probably Off");
      }
      if (oi.bleDevice.gatt.connected){
        oi.log("Initializing all services...");
        oi.showLoadingBtn();
        oi.hideReconnectBtn();
        try{
          await initializeAllServices(oi);
          oi.log("ReConnected and Initialized!");
        }catch(error){
          oi.log("Reconnect failed. " + error);
          reconnectAttempt++;
          if(reconnectAttempt<3){
            oi.log("Trying again " + reconnectAttempt)
            reconnectDevice(oi, reconnectAttempt);
          }
        }
      }
    }
    else{
      connectDevice(oi);
    }
  }