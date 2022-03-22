//This file must be loaded first and before any other .js file, because it defines the "listOfServices" array,
//and each service.js file appends its UUID to this array using .push().

//NOTE: The following representations are equivalent:
// myFunction(oi) and oi.myFunction()
//The first representation is more convenient for invoking functions from HTML buttons.
//The latter representation is more convernient for invoking from the JavaScript API.
//For the clearLog() function, I have both of those representations for convenience

//##########################################################################################
//whenever you add a new service js file, you only need to update this function:
async function initializeAllServices(oi){
  try{
    await initConfigService(oi); //defined in "configService.js"
    await initControlService(oi); //defined in "controlService.js"
    await initDeviceInfoService(oi); //defined in "deviceInfoService.js"
  }catch(error){
    console.log("Oi error: initializeAllServices() failed :( " + error);
    throw "Oi error: initializeAllServices() failed :("
  }
}
//##########################################################################################

////You can find the names of service names defined in the Web Bluetooth API at
//https://googlechrome.github.io/samples/web-bluetooth/characteristic-properties-async-await.html
let listOfServices = ['generic_access']; //NEVER modify this, and let each sdrvice push its UUID to it using .push() method.
const DEVICE_NAME_PREFIX = 'OI'; //Allow devices STARTING with this name

let ois = []; //this will hold all of our oi object instances.
createNewInstance(); //automatically create the "oi[0]" instance

//########################################################################################
//####################---Begin Method definitions inside this function--##################
function createNewInstance(){
  ois.push(new Object());
  let i = ois.length-1; //index number
  ois[i].instanceNumber = i;
  ois[i].destroyInstance = function(){
    if(ois[this.instanceNumber].isConnected) ois[this.instanceNumber].disconnect;
    delete ois[this.instanceNumber];
  }
  //##############################---GUI Methods---#######################################
  //TODO: The following methods contain statements that require certaint GUI/DOM elements to be present.
  //If we create our instance using the API not the GUI, then those elements will not exist, and that will then
  //result in an error. Thus, we must encapsulate the entie function definition inside a try-catch block to avoid
  //errors when using pureley the API. In the future, we want to completely separate the API from the GUI and make the
  //API have no dependency on the GUI.
  ois[i].enableControls = function(){
    try{
      document.querySelector(`#disconnect_btn${this.instanceNumber}`).style.display = "block";
      document.querySelector(`#reconnect_btn${this.instanceNumber}`).style.display = "none";
      document.querySelector(`#loading_btn${this.instanceNumber}`).style.display = "none";
      //Enable all controls that have the class x.
      let xItems = document.getElementsByClassName(`x${this.instanceNumber}`).length;
      for(j=0; j<xItems; j++){
        document.getElementsByClassName(`x${this.instanceNumber}`)[j].disabled = false;
      }
      //Set opacity of the oigraphic if it exists
      if(document.querySelector(`#oigraphic${this.instanceNumber}`)){ //if the oigraphic exists:
        document.querySelector(`#oigraphic${this.instanceNumber}`).style.opacity = 1;
      }
    }
    catch(e){
      this.log("Can't enableControls() b/c GUI element not present.");
    }
  }
  ois[i].disableControls = function(){
    try{
      document.querySelector(`#reconnect_btn${this.instanceNumber}`).style.display = "block";
      document.querySelector(`#disconnect_btn${this.instanceNumber}`).style.display = "none";
      document.querySelector(`#loading_btn${this.instanceNumber}`).style.display = "none";
      //Disable all controls that have the class x.
      let xItems = document.getElementsByClassName(`x${this.instanceNumber}`).length;
      for(j=0; j<xItems; j++){
        document.getElementsByClassName(`x${this.instanceNumber}`)[j].disabled = true;
      }
      //Set opacity of the oigraphic if it exists
      if(document.querySelector(`#oigraphic${this.instanceNumber}`)){ //if the oigraphic exists:
        document.querySelector(`#oigraphic${this.instanceNumber}`).style.opacity = 0.4;
      }
    }
    catch(e){
      this.log("Can't disableControls() b/c GUI element not present.");
    }
  }
  ois[i].hideReconnectBtn = function(){
    try{
      document.querySelector(`#reconnect_btn${this.instanceNumber}`).style.display = "none"; //disable reconnect button
    }
    catch(e){
      this.log("Can't hideReconnectBtn() b/c GUI element not present.");
    }
  }
  ois[i].showLoadingBtn = function(){
    try{
      document.querySelector(`#loading_btn${this.instanceNumber}`).style.display = "block";
    }
    catch(e){
      this.log("Can't showLoadingBtn() b/c GUI element not present.");
    }
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
//############################---End Method Definitions---########################
//################################################################################
//#############################---Begin Functions---##############################

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
      oi.log("The Oi device is probably Off");
    }
    if (oi.bleDevice.gatt.connected){
      oi.log("Initializing all services...");
      oi.showLoadingBtn();
      oi.hideReconnectBtn();
      try{
        await initializeAllServices(oi);
        oi.enableControls();
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

function disconnectDevice(oi) {
  if (!oi.bleDevice) {
    oi.log('No device found');
  }
  else if (oi.bleDevice.gatt.connected) {
    oi.log('Disconnecting...');
    oi.bleDevice.gatt.disconnect();
    // oi.disableControls(); unnecessary b/c this happens in the disconnect event.
  }
  else {
    oi.log('Device already disconnected');
    oi.disableControls();
  }
}

function clearLog(oi) { //argument is a particular instance
    document.querySelector(`#log${oi.instanceNumber}`).textContent = "";
}

// function log(text) {
//     console.log(text);
//     document.querySelector(`#log0`).textContent = text + '\n' + document.querySelector(`#log0`).textContent;
// }
