#include <bluefruit.h>

void setup() {
  Serial.begin(115200); //define baud rate
  delay(500);
  Serial.println("Start!");

  Bluefruit.begin();
  Bluefruit.setName("Olfactive Interface"); //Write device name detected by browser

  startAdv(); //Start advertising : Is there any central device ? connect
}

void loop() { }

void startAdv(void) {
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();
  Bluefruit.Advertising.addName();
  Bluefruit.Advertising.restartOnDisconnect(true); //Restart on disconnect 
  Bluefruit.Advertising.setInterval(32, 244);
  Bluefruit.Advertising.setFastTimeout(30);
  Bluefruit.Advertising.start(0);
}

//To flash this to the firmware of the Bluefruit board 
