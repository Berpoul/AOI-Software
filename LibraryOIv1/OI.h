#ifndef OI_h
#define OI_h

#include "Arduino.h"
#include "OI.h"


#define _BV(bit) (1<<bit) //bv = bit value
#define set_bit(bit,var) 	(var |=  _BV(bit))
#define clear_bit(bit,var) 	(var &= ~_BV(bit))
#define toggle_bit(bit,var)	(var ^=  _BV(bit))

//Constructor : Assign the pins as outputs

//enum : Types constantes intégral nommées
//
enum Configuration : uint8_t{
    GENERAL,SCENT_EMISSION_SERIES

};

enum Component : uint8_t{
	PIEZZO1, PIEZZO2, PIEZZO3, PIEZZO4, PIEZZO5, PIEZZO6, PIEZZO7, PIEZZO8, POWER
   //bit0, bit1,  bit2,  bit3,  bit4,  bit5,  bit6,   bit7,  bit8
};

class OI
{
    private:
        uint8_t _emissionport[8]={17,24}; //8 GPIO port on NRF52 connected to individual scent emission system
        uint8_t _powerport=25; //power command to activate the circuit.

        Configuration _config;
        void _setConfig(Configuration config);

        //Status indicators
        //16-bit variable hold all 
        uint16_t _hardwareState=0; 
        /*16-bit variable will hold info about what all the
  hardware is currently doing. Each bit corresponds to a hardware feature as follows:
   _______________________
  |bit| Component |'1' is |
  |---|-----------|-------|
  | 0 |  PIEZZO1    | Active |
  | 1 |  PIEZZO2    | Active |
  | 2 |  PIEZZO3    | Active |
  | 3 |  PIEZZO4    | Active |
  | 4 |  PIEZZO5    | Active |
  | 5 |  PIEZZO6    | Active |
  | 6 |  PIEZZO7    | Active |
  | 7 |  PIEZZO8    | Active   |
  | 8 |  POWER      | Active   |

  */


    public:

        //CONSTRUCTORS
        OI();
        OI(Configuration config);
        void setConfig(Configuration config);
        Configuration getConfig();

        //Driver : functions to control individual scent emmission system
        void powercircuitOn();
        void powercircuitOff();
        void piezzoOn(uint8_t port);
        void piezzoOff(uint8_t port);

        
        //Command 
        void command(uint8_t action, uint8_t ports);


        //Indicators 
        uint16_t getHardwareState();
        bool getHardwareStateOf(uint8_t bitNumber);
	   // bool getHardwareStateOf(Component name);



};

#endif