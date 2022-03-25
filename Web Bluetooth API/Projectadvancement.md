




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




Fun with Bluetooth 

## Central and Peripheral

Central device can connect to (multiple) peripheral.
Peripheral can't connect to central device.

## Generic attribute profile GATT
Central= Client (Web)
Peripheral = Server (NRF52)

### Services 

NRF52 multiple services :
- device information
- battery information
- GPIO control 

### Characteristic
Inside a service : Multiple Characteristics 

#### Device information
Device information :
- manufacturer
- software number
- model number 

Each characteristic has value : 

SERVER = Array of Objects
SERVICE = Object
CHARACERISTIC = Property
VALUE = Value

Services and characteristics are identified by UUID (16 or 128 bit)

```c
  chrBattPercentage = BLECharacteristic(0x2A19);
  uint8_t configServiceUUID[16] = {0x03,0xaa,0x00,0x00,0x00,0x00,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b}; //"0b0b0b0b-0b0b-0b0b-0b0b-00000000aa03"

```

BLE has low bandwidt : sending number is easier than sending strings. 

## Do on characteristic :

- Read
- Write
- Write without response
- Notify

Every value is an array of bytes. 

### Web Bluetooth API : 


### Connect to a device : 

```c++
navigator.bluetooth.requestDevice({
    filters : [
        { namePrefix: 'OI'}
    ],
})
```

For security, user has to click on the pair bouton.

When user click : We get promise back. 

We can : 


```c++
let device= await navigator.bluetooth.requestDevice({
    filters : [
        { namePrefix: 'OI'}
    ],
})


let server = await device.gatt.connect(); //connect to the server
let service = await server.getPrimaryService(0xff0f); //get the service 
let characteristic = await service.getCharacteristic (0wfffc)); //get characteristic

```

### Write data

Now we have the Characteristic so we can start to write value :

```c++

characteristic.writeValue(
    new Uint8array([00x00,r,g,b]) //4 bytes for lightbulb 
)
```
### Read data

We can also read the data :

```c++

let value =await characteristic.readValue(
    let r = value.getUint8(1);
    )
```

### Get notified of changes 
Event listener so that you can update on the screen when something changes. 

```c++

characteristic.addEventListener(
    'characteristicvaluechanged',e => {
        let r =e.target.value.getUint8(1);
    }
);

characteristic.startNotifications(); //start listening

promises = async await




• Description:
In this video I show you how to get started with WebSockets, one of the latest web technologies for exchanging data between web clients and web servers.
We've seen how to use HTTP requests from a web browser to request data from a web server running on the ESP8266 (https://youtu.be/VNgFbQAVboA). A problem is that every time the client sends a request, the entire webpage needs to be reloaded. We saw how using XML HTTP requests and AJAX allowed for dynamically updating parts of the webpage (https://youtu.be/ZJoBy2c1dPk).
With websockets the data exchange between a client and server is much easier, faster, and doesn't need a request to be made by the client. 
In this tutorial, I build a webpage that:
1. Allows me to display text data sent from the server using the Serial Monitor for text input.
2. Allows me to send text data to the server using the Serial Monitor as a display output.
3. Allows me to change the value of a slider to set the brightness value of an LED that's controlled by the web server running on the ESP8266.