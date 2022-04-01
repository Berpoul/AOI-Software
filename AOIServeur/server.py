#Python Flask
from crypt import methods
from pickle import GET
from socket import SocketIO
from flask import Flask,render_template,request
from flask_socketio import SocketIO  
import httpx
import asyncio
import random
import time

#SocketIO rajoute simplicité par rapport websocket (simplifie utilisation des websockets)

#Create server with Flask
app = Flask(__name__) 


#web socket transports with eventlet
sio = SocketIO(app,async_mode="eventlet")

#sio = d(app)
aois=[] #Liste des différentes AOI connecté (valeur = adresse ip) 
piezzorandom = ""

#On recoit une requête HTTP get de AOI qui veut nous communiquer son adresse ip


#Créer une fonction app route home pour afficher la page web 
# écoute requête get sur le / et return le code  
@app.route("/",methods=["GET"])
def home():
    return render_template("index.html")



@app.route("/register",methods=["GET"]) #Requete sur /register avec méthode GEt on applique la fonctions : 
def handler():
    print(request.args) #recupérer les arguments de la requête
    ip = request.args.get("ip") #request.args totalité du retour du GET
    #Avec get("ip") on prend que ip =123
    if ip is not None and ip not in aois:
        aois.append(ip) #On ajoute AOI à la liste de nos AOIs connectées

    print(aois)    
    #print(request.args.get("ip"))
    return "200" # Répondre AOI server ok 

@sio.on("test") ##Affiche le contenu de l'évènement test 
def on_test(data):
    asyncio.run(sendMessage())
    print("Message reçu du front"+data)

#Envoyer une requete GET, on peut mettre un argument, index pour définir AOI destination
#Dans la liste adresse ip de chaucne aoi, on peut choisir
async def sendMessage():
    async with httpx.AsyncClient() as client: #
        print("IP adressess array"+aois[0])
        response = await client.get("http://"+aois[0]+":5200/release?output=2&state=0")

@sio.on("refresh_list")
def sendlist():
    sio.emit("update_list",aois)

######################### EVENT RECEPTION #########################

######################### LED #########################

@sio.on("ledon")
def led_action():
    asyncio.run(led_on())
    #print("Instructiont to toggel led send from server")

@sio.on("ledoff")
def led_action():
    asyncio.run(led_off())
    #print("Instructiont to toggel led send from server")

######################### Power circuit #########################


@sio.on("poweron")
def led_action():
    asyncio.run(power_on())
    #print("Instructiont to toggel led send from server")

@sio.on("poweroff")
def led_action():
    asyncio.run(power_off())
    #print("Instructiont to toggel led send from server")

######################### Piezzo1 #########################


@sio.on("piezzo1on")
def led_action():
    asyncio.run(piezzo1_on())
    #print("Instructiont to toggel led send from server")

@sio.on("piezzo1off")
def led_action():
    asyncio.run(piezzo1_off())
    #print("Instructiont to toggel led send from server")


######################### Piezzo2 #########################

@sio.on("piezzo2on")
def led_action():
    asyncio.run(piezzo2_on())
    #print("Instructiont to toggel led send from server")

@sio.on("piezzo2off")
def led_action():
    asyncio.run(piezzo2_off())
    #print("Instructiont to toggel led send from server")

######################### Piezzo3 #########################
@sio.on("piezzo3on")
def led_action():
    asyncio.run(piezzo3_on())
    #print("Instructiont to toggel led send from server")

@sio.on("piezzo3off")
def led_action():
    asyncio.run(piezzo3_off())
    #print("Instructiont to toggel led send from server")

######################### Piezzo4 #########################
@sio.on("piezzo4on")
def led_action():
    asyncio.run(piezzo4_on())
    #print("Instructiont to toggel led send from server")

@sio.on("piezzo4off")
def led_action():
    asyncio.run(piezzo4_off())
    #print("Instructiont to toggel led send from server")

### find smell ####

@sio.on("startGuess")
def findsmell():
    asyncio.run(find_smell())
    #print("Instructiont to toggel led send from server")


@sio.on("stopGuess")
def stopguess():
    asyncio.run(stopguess())
    #print("Instructiont to toggel led send from server")


@sio.on("guess")
def checkguess(data):
    asyncio.run(checkguess(data))
########### LED CONTROL ################

async def stopguess():
    global piezzorandom
    piezzorandom = ""



async def checkguess(data):
    result = False
    if (data== piezzorandom):
        result = True 
        sio.emit("check",result)
    else : 
        sio.emit("check",result)





async def led_on():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=2&state=0")
        print("Led ON"+"http://"+aois[0]+":5200/release?output=2&state=0")
async def led_off():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=2&state=1")
        print("Led Off"+"http://"+aois[0]+":5200/release?output=2&state=1")



########### POWER CIRCUIT CONTROL ################



async def power_on():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=15&state=1")
        print("Power ON"+"http://"+aois[0]+":5200/release?output=15&state=1")

async def power_off():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=15&state=0")
        print("Power OFF"+"http://"+aois[0]+":5200/release?output=15&state=0")

#######PIEZZO CONTROL ###########
#Piezzo output are : 12,13,14,16

#PIEZZO1
async def piezzo1_on():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=16&state=1")
        print("PIEZZO ON"+"http://"+aois[0]+":5200/release?output=2&state=0")

async def piezzo1_off():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=16&state=0")

#PIEZZO2

async def piezzo2_on():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=14&state=1")

async def piezzo2_off():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=14&state=0")

#PIEZZO3

async def piezzo3_on():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=12&state=1")

async def piezzo3_off():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=12&state=0")

#PIEZZO4

async def piezzo4_on():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=13&state=1")

async def piezzo4_off():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=13&state=0")



##### FIND SMELL  ######

randompiezzo = ["piezzo1", "piezzo2", "piezzo3"]

async def find_smell():
    global piezzorandom
    print("Find the smell execution")
    #Choisir un scent aléatoire : 
    piezzorandom = random.choice(randompiezzo)
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=15&state=1") #turn power on
        if(piezzorandom=="piezzo1"):
                response = await client.get("http://"+aois[0]+":5200/release?output=16&state=1") #turn power on
                time.sleep(5)
                response = await client.get("http://"+aois[0]+":5200/release?output=16&state=0") #turn power on

        elif (piezzorandom=="piezzo2"):
                response = await client.get("http://"+aois[0]+":5200/release?output=14&state=1") #turn power on
                time.sleep(5)
                response = await client.get("http://"+aois[0]+":5200/release?output=14&state=0") #turn power on

        
        elif (piezzorandom=="piezzo3"):
                response = await client.get("http://"+aois[0]+":5200/release?output=12&state=1") #turn power on
                time.sleep(5)
                response = await client.get("http://"+aois[0]+":5200/release?output=12&state=0") #turn power on
        response = await client.get("http://"+aois[0]+":5200/release?output=15&state=0") #turn power on

    



if __name__== "__main__":
    sio.run(app,host="0.0.0.0",port=5001) #diffuse le serveur sur toutes les adresses ip possible. 
    #Le port pour accèder au serveur sera 5000

#Tous les AOI une ip en commun : le server

