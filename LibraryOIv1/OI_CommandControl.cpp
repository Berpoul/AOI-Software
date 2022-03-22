#include "Arduino.h"
#include "OI.h"

//COMMAND CONTROL API: 2-byte based control. This is an implementation of our communication protocol at the library level. The "command()" method
	//allows you to control just about any feature of the FlowIO device, based on what arguments you provide. The first argument 'action' is
	//describing what to do. The second argument is describing on which ports that action is to be performed based on the position and
	//value of the individual bits, namely the first 9 bits.


void OI::command (uint8_t action, uint8_t port){

    switch(action){
        case '+':
            powercircuitOn();
            break;

        case '-':
            powercircuitOff();
            break;

        case 'n':
            piezzoOn(port) ;
            break;

        case 'f':
            piezzoOff(port);
            break;
        
        case '!': //stop everything on disconnect
            powercircuitOff();
            piezzoOff(port);
            

    }


}