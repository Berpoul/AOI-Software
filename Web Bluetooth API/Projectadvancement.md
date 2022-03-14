




## Bluetooth Low Energie (4.0)
ultra low power protocol (less time on air and device sleep longer time while no connection)
Instant connection with devices


Firmware code and browser code with javascript to detect BLE GATT characteristic and services

## Bluetooth Protocol Specifications
4 Roles in BLE : 
- Broadcaster : Device advertises data only 
- Observer : A device which scans for the advertised data and receive it but unable to connect.
- Central (web browser) : **Master** device, scans for advertisement packets, initiates a connection and connect with other Peripherals upon receiving advertisement packets. 
- Peripheral (OI) : **Slave** device which advertises its data.

## Bluetooth architecture
![img](https://infocenter.nordicsemi.com/topic/sds_s132/SDS/s1xx/Images/bt_stack_arch_s132_s140.svg)

## ATT (Attribute protocol)

It specifies how to access data using a client server model. The data is stored in attributes which can be accessed by client. 
Attribute composed of 3 basic elements:
- 16-bit handle
- UUID (attribute type)
- Value of a certain length

## GATT (Generic Attributes)
Base profile for all top-level LE profiles. 
It defines how a **bunch of ATT attributes** are grouped together into **meaningful services**. 
In Client Server Architecture : 2 roles defined Server and Client 


![imga](https://www.researchgate.net/publication/330381472/figure/fig7/AS:715199304708097@1547528210566/Bluetooth-low-energy-protocol-stack.ppm)

## Profiles 
Describes how 2 devices can discover each other and how they communicate. Multiple services for each profile. A profile will describe the overall functionality of the device.

**Service** (folder): Collection of device characteristics and behaviors.

**Characteristics** (files with data): Numeric value and actual data. 


## How data is transferred ? 


Web browser = Central Device = Client 

OI=NRF52=Server (read sensor value and update over BLE)

2 ways to transmit data from server to client : Notifications or Indications 

Notifications : Faster way, Without acknowledgement signal from client.

Indications : Need acknowledgement signal after data transfer. 

Bluetooth standard : data payload size = 27 to 251 Bytes for each transmission.




## Web Bluetoothe protocol
Interract with device trough the GATT protocol. 
Read/Write
Get the battery level


Web Bluetooth : Draft Community Group Report 1 July 2020
Draft stage (Not W3C standard)


```js
<script>
//Check if Bluetooth api is supported in browser : 
    if(navigator.bluetooth){
        console.log("Web Bluetooth API is not available in the browser")
}
</script>


```



# Plan : 

### Reverse Engineering

### Define data 

### Arduino Scent Driver librairies / Scent command / Command API 

### Bluetooth API 

### GUI

### Test : Arduino 

Test performance : 
- Test utilisateurs 
- Temps de réponse API: Bluetoothe 
- HTML API 
- Mesurer fréquence est ce bonne utilisateurs ? 

- Flow IO : rapport de performances ? 

- Consommation du programmes  : Diaggrame de décharge de la batterie en fonction du temps ( avec ou sans des features pour montrer des )
Artificiellemnet créer des sytemes de comparaisons. 

Interraciton utilisateurs points 
- 