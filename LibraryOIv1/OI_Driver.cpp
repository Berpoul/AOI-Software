#include "Arduino.h"
#include "OI.h"

//SCENT DRIVER : functions to control individual scent emission system

//piezzo number : From 1 to 8 (Left to right on OI)
void OI::piezzoOn(u_int8_t piezzoNumber)
{
    digitalWrite(25-piezzoNumber,HIGH);
    set_bit(piezzoNumber+1,_hardwareState);
}

void OI::piezzoOff(u_int8_t piezzoNumber)
{
    digitalWrite(25-piezzoNumber,LOW);
    clear_bit(piezzoNumber+1,_hardwareState);

}


void OI::powercircuitOn()
{
    digitalWrite(_powerport,HIGH);
    set_bit(8,_hardwareState);

}

void OI::powercircuitOff()
{
    digitalWrite(_powerport,LOW);
    clear_bit(8,_hardwareState);

}

