
async function connectDevice(oi) { //the argument is a SINGLE instance, not an array of instances.
    oi.showLoadingBtn();
    oi.hideReconnectBtn();
    let deviceOptions = {filters: [{namePrefix: DEVICE_NAME_PREFIX}],  optionalServices: listOfServices};
    //the 'listOfServices' is defined in the conditions.js file.
    try{
      let bleDevice = await navigator.bluetooth.requestDevice(deviceOptions);
      bleDevice.addEventListener('gattserverdisconnected', event => {
        oi.log("Disconnected from: " + event.target.name + ", " + event.target.id);
        oi.disableControls(); //disable controls on DISCONNECT EVENT
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
        oi.enableControls();
        oi.log("\nConnected and Initialized!");
      }catch(error){
        oi.log("Oi failed to init services :(. The error is" + error)
        oi.disableControls();
      }
    }
    catch(error){
      oi.log("Oi-" + oi.instanceNumber + " connect request cancelled");
      oi.disableControls();
    }
  }