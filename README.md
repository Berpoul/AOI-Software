AOI Software
ReadMe : 
Nom du projet, descriptif, Logo, Quickstart(git clone puis make), requirements, tests, bugs

http://172.20.10.8:5200/release?output=2&state=1

Connect to the front client to control the AOI : http://127.0.0.1:5000/
If you want to send command directly  http://172.20.10.8:5200/release?output=2&state=1
usi the ip adresse of the aoi given by server

## Description 

ScentIO aims to make seameless interraction between users and
olfactive interfaces.


Olfactive Interface is a wireless and portable scent releaser necklace
that simulates the sense of smell. The interface can be composed of
several release modules for different fragrances. The augmented interface
controls the frequency of each smells perceived by the user. Olfactive
Interface is controlled by a weimos D1 mini which enables wifi communication.
The electronic circuit can to control each scent releaser
module individually. (through digital output pins (HIGH) or (LOW) of
the microcontroller.)

ScentIO enables users to interact easily with the OI through aweb browser.
ScentIO includes HTTP server, flask server, websocket protocol and a
web-GUI.

## Diagram 

![Diagram](/diagram1024_1.png "Architecture Diagram").

The architecture diagram below shows the different parts of the ScentIO.
The user can interact with the software directly on the GUI (web browser).
The Web interface sends data to the Web server API using websocket
and socketIO protocol. The Web server API communicates to the microcontroller
mounted on the OI using HTTP request The microcontroller
sends the command to the electronic circuit through Arduino libraries
and digitalWrite functions.

## Quickstart 

Check out the tutorial video :
https://youtu.be/4dTqJkcMnHk

## Requirements
