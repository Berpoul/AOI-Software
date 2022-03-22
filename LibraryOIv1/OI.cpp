#include "Arduino.h"
#include "OI.h"

//CONSTRUCTORS : Assigns the pinx as outputs.

OI::OI(){   //If no parameters in the constructor : default is general
    _setConfig(GENERAL);
}

OI::OI(Configuration mode){
    _setConfig(mode);
}


//Hardware configuration mode 

void OI::_setConfig(Configuration config){
    _config=config;
    for (int port=0;port<=7;port++)
    {
        pinMode(_emissionport[port],OUTPUT); //Define the emission port as output
        digitalWrite(_emissionport[port],LOW); //make sure all ports are low
    }
    pinMode(_powerport,OUTPUT); //define the power port as output
    digitalWrite(_powerport,LOW); //make sure all ports are low

}
void OI::setConfig(Configuration config){ //Notice that this is different from "_setConfig"
    _config = config;
}
Configuration OI::getConfig(){
    return _config;
}
