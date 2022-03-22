#include "scentdriver.h"


void powercircuitOn()
{
  //Power circuit is on port 25 
  digitalWrite(25,HIGH);
}

void powercircuitOff()
{
  //Power circuit is on port 25 
  digitalWrite(25,LOW);
}

// Switch the port to HIGH value
void piezzoOn(int port)
{
  digitalWrite(port,HIGH);
}

void piezzoOff(int port)
{
  digitalWrite(port,LOW);
}