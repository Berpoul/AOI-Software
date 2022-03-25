
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <FS.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h> //parsing data in json format

ESP8266WebServer server;
char* ssid = "PoleDeVinci_DVIC";
char* password = "8PfURsp!dvic";

// hold uploaded file
File fsUploadFile;

// websockets server for handling messages sent by the client
WebSocketsServer webSocket = WebSocketsServer(81);



void setup()
{
  SPIFFS.begin();
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

  server.on("/",handleIndexFile);
  // list available files
  server.on("/list", HTTP_GET, handleFileList);
  // handle file upload
  server.on("/upload", HTTP_POST, [](){
    server.send(200, "text/plain", "{\"success\":1}");
  }, handleFileUpload);
  server.begin();
  webSocket.begin();
  // function to be called whenever there's a websocket event
  webSocket.onEvent(webSocketEvent);

  AFMS.begin();
  // set the initial speed of the motors
  
}

void loop()
{
  webSocket.loop();
  server.handleClient();
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t *payload, size_t length)
{
  if(type == WStype_TEXT)
  {
    // handle the websocket messages with direction and speed
    // by parsing the parameters from a JSON string
    String payload_str = String((char*) payload);
    // using the ArduinoJson library
    StaticJsonDocument<200> doc;
    // deserialize the data
    DeserializationError error = deserializeJson(doc, payload_str);
    // parse the parameters we expect to receive (TO-DO: error handling)
    String dir = doc["direction"];
//    Serial.print("direction: ");
//    Serial.println(dir);
    if(dir == "STP") {
      motor_left->run(RELEASE);
      motor_right->run(RELEASE);
      Serial.println("STOP");
    } else {
      int speed = doc["speed"];
      // on the page speed goes from 0 to 100. scale it between 0 and 255:
      speed = map(speed, 0, 100, 0, 255);
      motor_left->setSpeed(speed);
      motor_right->setSpeed(speed);
      if(dir == "FWD") {
        motor_left->run(FORWARD);
        motor_right->run(FORWARD);
        Serial.println("FORWARD");
      } else if(dir == "BWD") {
        motor_left->run(BACKWARD);
        motor_right->run(BACKWARD);
        Serial.println("BACKWARD");
      } else if(dir == "RGT") {
        motor_left->run(FORWARD);
        motor_right->run(BACKWARD);
        Serial.println("RIGHT");
      } else if(dir == "LFT") {
        motor_left->run(BACKWARD);
        motor_right->run(FORWARD);
        Serial.println("LEFT");
      }
    }
  }
}

void handleFileUpload()
{
  HTTPUpload& upload = server.upload();
  if(upload.status == UPLOAD_FILE_START)
  {
    String filename = upload.filename;
    if(!filename.startsWith("/"))
      filename = "/"+filename;
    Serial.print("handleFileUpload Name: "); Serial.println(filename);
    fsUploadFile = SPIFFS.open(filename, "w");
  } else if(upload.status == UPLOAD_FILE_WRITE)
  {
    if(fsUploadFile)
      fsUploadFile.write(upload.buf, upload.currentSize);
  } else if(upload.status == UPLOAD_FILE_END)
  {
    if(fsUploadFile)
      fsUploadFile.close();
    Serial.print("handleFileUpload Size: "); Serial.println(upload.totalSize);
  }
}

void handleFileList()
{
  String path = "/";
  // Assuming there are no subdirectories
  Dir dir = SPIFFS.openDir(path);
  String output = "[";
  while(dir.next())
  {
    File entry = dir.openFile("r");
    // Separate by comma if there are multiple files
    if(output != "[")
      output += ",";
    output += String(entry.name()).substring(1);
    entry.close();
  }
  output += "]";
  server.send(200, "text/plain", output);
}

void handleIndexFile()
{
  File file = SPIFFS.open("/index.html","r");
  server.streamFile(file, "text/html");
  file.close();
}
