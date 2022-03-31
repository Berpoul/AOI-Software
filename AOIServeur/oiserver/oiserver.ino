#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>


//Weimos se connect au router (Clients front et servers aussi)
const char* ssid = "Romain";
const char* password = "chatoune";

WiFiClient client; // Creates a client that can connect to to a specified internet IP address and port

//SERVER HOST AND PORT
String host = "172.20.10.2" ; 
const uint16_t port = 5000 ;


uint8_t pin_led = 2; //Pin2 on weimosD1mini
uint8_t power = 15; //Pin2 on weimosD1mini
uint8_t scent1 = 16; 
uint8_t scent2 = 14; 
uint8_t scent3 = 13; 
uint8_t scent4 = 12; 

const char* PARAM_INPUT_1 = "output"; //Variable afin d'extraire les informations importantes d'une requête http dans l'URL
const char* PARAM_INPUT_2 = "state";  //

const uint16_t portaoi = 5200 ;

AsyncWebServer server(portaoi); //Create AsyncWebServer object on port 5200

//Using asynchronous network means that you can handle more than one connection at the same time

void setup () {

  
  pinMode(power, OUTPUT);
  pinMode(scent3, OUTPUT);
  pinMode(scent4, OUTPUT);
  pinMode(scent2, OUTPUT);
  pinMode(scent1, OUTPUT);

  pinMode(pin_led, OUTPUT);

  Serial.begin(115200);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) //En attente de connexion
  {

    delay(1000);
    Serial.println("Connecting..");

  }

  Serial.print("Connection to wifi with the port ");
  Serial.print(portaoi);
  Serial.println(" succedeed");


  if (client.connect(host, port)) //Connect to the IP address and port
  {
    Serial.print("connection to server on host : ");
    Serial.print(host);
    Serial.print("and port ");
    Serial.print(port);
    Serial.println(" succedeed");

    
  } else {
    Serial.print("connection to server on host : ");
    Serial.print(host);
    Serial.print(" and port ");
    Serial.print(port);
    Serial.println(" failed");    
    delay(5000);
    return;
  }


  
  

  // Function to handle a GET request to <ESP_IP>/release?output=<inputMessage1>&state=<inputMessage2>
  //listen to an event called "/release"
  server.on("/release", HTTP_GET, [] (AsyncWebServerRequest * request) {
    String inputMessage1;
    String inputMessage2;
    // GET input1 value on <ESP_IP>/update?output=<inputMessage1>&state=<inputMessage2>
    //Verifie que la requête est complète
    if (request->hasParam(PARAM_INPUT_1) && request->hasParam(PARAM_INPUT_2))
    {
      inputMessage1 = request->getParam(PARAM_INPUT_1)->value(); //Associe la valeur de output au string
      inputMessage2 = request->getParam(PARAM_INPUT_2)->value();
      digitalWrite(inputMessage1.toInt(), inputMessage2.toInt());
    }
    else {
      inputMessage1 = "No message sent";
      inputMessage2 = "No message sent";
    }
    //digitalWrite(inputMessage1.toInt(), inputMessage2.toInt());
    //digitalWrite(2,LOW);
    //delay(1000);
    //digitalWrite(2,HIGH);
    Serial.print("GPIO: ");
    Serial.print(inputMessage1);
    Serial.print(" - Set to: ");
    Serial.println(inputMessage2.toInt());
    request->send(200, "text/plain", "OK c'est bon");
  });



  server.begin(); //Tells the server to begin listening for incoming connections.
  Serial.print("Server on");

}

void loop() {

  if (WiFi.status() == WL_CONNECTED) { //Check WiFi connection status
    //ESP web client to make HTTP request to the server.
    //With HTTPClient we have the methods to create and send HTTP request
    HTTPClient http;  //Declare an object of class HTTPClient

    //PAss the URL that we want to connect and make the GET request

    //We send /register?ip=ip de aoi sur la réseau afin que le sever récupère ip
    http.begin(client, "http://" + host + ":" + String(port) + "/register?ip=" + WiFi.localIP().toString()); //Specify request destination
    int httpCode = http.GET();  //Send the request 
    //Thie methos will return the status of operation (good to store for error handling)

    if (httpCode > 0) { //Check the returning code : Greater then 0 means it is standar HTTP code (else erros)

      //get string methods on http object.
      String payload = http.getString();   //Get the request response payload
      Serial.println(payload);             //Print the response payload

    }

    http.end();   //Close connection TCP and free ressources

  }
  delay(10000); 
  //Cette boucle permet de :
  //Communiquer au server l'addresse ip de esp8266 à travers une requets HTTP GET.
  //Rassurer le server chaque minute que l'AOI en questions est encore connectée.
  
  //TO DO : Supprimer de la liste les AOI qui se sont deconnecte après 2 minutes
  Serial.println("test");
}
