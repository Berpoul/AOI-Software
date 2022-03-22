
void createDeviceInfoService(){
  deviceInfoService.setFirmwareRev(FIRMWAREVERSION);
  deviceInfoService.setSystemID(getMcuUniqueID()); //set this to the serial number of the MCU.

  //We must explicitly set to NULL the characteristics that we don't want to create:
  deviceInfoService.setHardwareRev(NULL); 
  deviceInfoService.setManufacturer(NULL); 
  deviceInfoService.setSoftwareRev(NULL);
  deviceInfoService.setModel(NULL);
  deviceInfoService.setSerialNum(NULL); //by setting it to null, this defaults to the MCU serial number.
  //We can't avoid creating the SerialNum characteristic unless we modify the library.
  deviceInfoService.begin();
}