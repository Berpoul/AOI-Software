#include <OI.h>
#include <bluefruit.h>
#define DEVICE_NAME "OI"// Device Name: Maximum 30 bytes
#define FIRMWAREVERSION "1.0" //this is 10 bytes

OI oi;

//#################---Define Service and Characteristic Names---####################
BLEService controlService;
  BLECharacteristic chrCommand;
  BLECharacteristic chrHardwareState;
  uint8_t cmd[2]; //holds the command. cmd[0]=action, cmd[1]=port
BLEService configService;
  BLECharacteristic chrConfig;

BLEDis deviceInfoService; //this creates both the service and characteristic(s) automatically.
//##################################################################################
  
void setup() {
  oi = OI(GENERAL); //This must be done the very first item to minimize the click on startup (Bug #44 on Github)  
  
  Serial.begin(115200);
  Bluefruit.autoConnLed(true);   // Setup the BLE LED to be enabled on CONNECT.
  //All Bluefruit.config***() function must be called before Bluefruit.begin()
  Bluefruit.configPrphBandwidth(BANDWIDTH_MAX); // Config the peripheral connection with maximum bandwidth.
  //Bluefruit.configUuid128Count(15); //by default this is 10, and we have more than 10 services & characteristics on OI
  Bluefruit.begin();
  Bluefruit.setTxPower(8);
  Bluefruit.setName(DEVICE_NAME); //OI
  Bluefruit.Periph.setConnectCallback(connect_callback);
  Bluefruit.Periph.setDisconnectCallback(disconnect_callback);

  //#####################---Create Services---####################
  createControlService();   //defined in "controlService.ino"
  createConfigService();    //defined in "configService.ino"
  createDeviceInfoService();//defined in "deviceInfoService.ino"
  //##############################################################

  startAdvertising();  
  
}

void startAdvertising(void) {
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();
  Bluefruit.ScanResponse.addName();
  Bluefruit.Advertising.restartOnDisconnect(true);
      //Choose which services we want to advertise.
  Bluefruit.Advertising.addService(controlService); //advertise service uuid
  Bluefruit.Advertising.addService(configService); //advertise service uuid
  Bluefruit.Advertising.addService(deviceInfoService); //advertise service uuid

  Bluefruit.Advertising.setInterval(32, 244); // in unit of 0.625 ms
  Bluefruit.Advertising.setFastTimeout(30);   // number of seconds in fast mode
  
  Bluefruit.Advertising.start(0);
}

void loop() 
{
}

void connect_callback(uint16_t conn_handle){
  //stop everything on connect
  Serial.println("Connected");
  Serial.println(FIRMWAREVERSION);  
  cmd[0] = '!';
  cmd[1] = 0b00011111;
  oi.command(cmd[0],cmd[1]);
  //You can replace the above 3 lines with: flowio.stopAction(0x00011111);
  chrCommand.write(cmd,2); //We are writing the full 3-byte cmd array. 
  chrHardwareState.notify16(oi.getHardwareState());
  chrConfig.notify8(oi.getConfig());  


}
void disconnect_callback(uint16_t conn_handle, uint8_t reason){
  //stop everything on disconnect
  cmd[0] = '!'; //stop 
  cmd[1] = 0b00011111; //all
  oi.command(cmd[0],cmd[1]);
  //You can replace the above 3 lines with flowio.stopAction(0x00011111);
  //but leave them like this for clarity of how the protocol can be used.

}
