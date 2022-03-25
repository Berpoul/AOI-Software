//When you type on seril montitor :
//web socket communication from the webserver which has interface over usb  to the serial monitor and the web client
//which is web browser running on computer : That communication by directionnal is working (in one direction)
//Server sur mon pc : node.js   
//

//Websocket for exchanging data between web client and a webser.


#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h> //include library websocketserver

WebSocketsServer webSocket = WebSocketsServer(81); //Create web socketserver object runing on port 81
ESP8266WebServer server;
uint8_t pin_led = 2; //Pin2 on weimosD1mini
uint8_t power = 15; //Pin2 on weimosD1mini
uint8_t scent1 = 16; 
uint8_t scent2 = 14; 
uint8_t scent3 = 13; 
uint8_t scent4 = 12; 




//char* ssid = "PoleDeVinci_DVIC";
//char* password = "8PfURsp!dvic";

char* ssid = "Villa Rose ";
char* password = "cleverzoo133";


//textarea : display message send from the serial monitor id rxConsole
//user define fonction init()
//Define Socket variable to be an instacnce of the wbe socket class
//windos.location.hostname to get the url of the websocket
//use the attribut init javascript

//Part 2 : Add a text bar to to send message from the webpage to the serial monitor
//input type : txBar : transmitting data from the client to the server
//onkeydown : when a key is pressed, determine when enter was pressed to send the message
//if enter is pressed : call function sendText
//

//Part 3 : slider to control led intensity
//oninput : anytime the slider is changed it will trigger the javascript methods
char webpage[] PROGMEM = R"=====(
<html>
<head>
  <script> 
  var Socket;
  function init() {
    Socket = new WebSocket('ws://' + window.location.hostname + ':81/');
    Socket.onmessage = function(event){
      document.getElementById("rxConsole").value += event.data;
    }
  }
  function sendText(){
    Socket.send(document.getElementById("txBar").value);
    document.getElementById("txBar").value = "";
  }

  function sendBrightness(){
    Socket.send("#"+document.getElementById("brightness").value);
  }

   function ledOn(){
    Socket.send("+"+document.getElementById("ledon").value);
  }

  function ledOff(){
    Socket.send("-"+document.getElementById("ledoff").value);
  }

  function powerOn(){
    Socket.send("o"+document.getElementById("poweron").value);
  }

  function powerOff(){
    Socket.send("f"+document.getElementById("poweroff").value);
  }

  function scent(){
    Socket.send("1"+document.getElementById("scent1").value);
  }
 </script>
</head>
<body onload="javascript:init()">
  <div>
    <textarea id="rxConsole"></textarea>
  </div>
  <hr/>
  <div>
    <input type="text" id="txBar" onkeydown="if(event.keyCode == 13) sendText();" />

  </div>
  <hr/>
  <div>
    <input type="range" min="0" max="1023" value="512" id="brightness" oninput="sendBrightness();" />

  </div>
  <hr/>
  <div>
    <input type="button" value="LED ON " id="ledon" onclick="ledOn();" />

  </div>


  <hr/>
  <div>
    <input type="button" value="LED OFF" id="ledoff" onclick="ledOff();" />

  </div>


  <hr/>
  <div>
    <input type="button" value="Power On" id="poweron" onclick="powerOn();" />

  </div>


  <hr/>
  <div>
    <input type="button" value="Power Off" id="poweroff" onclick="powerOff();" />

  </div>



    <hr/>
  <div>
    <input type="button" value="Scent 1" id="scent1" onclick="scent();" />

  </div>


  
  
</body>
</html>
)=====";

//When a key is pressed : onkeydown
void setup()
{
  pinMode(pin_led, OUTPUT);
  
  pinMode(15, OUTPUT);
  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(14, OUTPUT);
  pinMode(16, OUTPUT);
  //for (int port=12;port<=16;port++){
    //digitalWrite(port,LOW);
  //}


  WiFi.begin(ssid,password);
  Serial.begin(115200);
  while(WiFi.status()!=WL_CONNECTED)
  {
    Serial.print(".");
    delay(500);
  }
  Serial.println("");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  server.on("/",[](){
    //send the webpage that we ahve created before
    //P because store int he flash mmory
    server.send_P(200, "text/html", webpage);
  });
  server.begin();

  webSocket.begin();
  webSocket.onEvent(webSocketEvent); //
}

void loop()
{

  webSocket.loop();
  //provide the data that are goign to be send to our 
  //text area on the page.
  server.handleClient();
  if(Serial.available()>0){

    char c[]= {(char)Serial.read()};
    webSocket.broadcastTXT(c,sizeof(c));
  }
}

//Websocket server when data is sent by the client to the server. 

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length){
  if(type == WStype_TEXT){
  
    if(payload[0] == '#'){
      uint16_t brightness =(uint16_t) strtol((const char *) &payload[1], NULL,10); //detecte automatiquemen chiffre dans un string et renvoit en long
      brightness=1024-brightness;
      analogWrite(pin_led, brightness);
      Serial.print("brighntess= "); //Not send to the server 
    }
    else if(payload[0] == '+'){
        digitalWrite(pin_led,LOW);

    }
    else if(payload[0] == '-'){
      digitalWrite(pin_led,HIGH);

    }



    else if(payload[0] == 'o'){
      digitalWrite(power,HIGH);
    }
    else if(payload[0] == 'f'){
      digitalWrite(power,LOW);

    }
    else if (payload[0] == '1'){
      digitalWrite(scent1,HIGH);

    }
    for(int i = 0; i<length; i++)
    {
      Serial.print((char) payload[i]);  
    }
  Serial.println();
  }
  
}
