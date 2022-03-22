#include <Arduino.h>



void setup() {
  // put your setup code here, to run once:

  //Define all the port connected to an individual scent emission system as output
  for(int port=17;port<=25;port++)
  { 
    pinMode(port,OUTPUT);
  }
}


void loop(){
  
}


