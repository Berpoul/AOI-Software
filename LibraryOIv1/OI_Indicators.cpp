#include "Arduino.h"
#include "OI.h"

uint16_t OI::getHardwareState(){
    return _hardwareState;
}
bool OI::getHardwareStateOf(uint8_t bitNumber){
    //Parse the nth bit and return true or false
    uint16_t one = 1; //0x0001.
    bool returnValue = (_hardwareState>>bitNumber & one);
    return returnValue;
}