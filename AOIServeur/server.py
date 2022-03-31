#Python Flask
from crypt import methods
from pickle import GET
from socket import SocketIO
from flask import Flask,render_template,request
from flask_socketio import SocketIO  
import httpx
import asyncio

#SocketIO rajoute simplicité par rapport websocket (simplifie utilisation des websockets)

#Create server with Flask
app = Flask(__name__) 


#web socket transports with eventlet
sio = SocketIO(app,async_mode="eventlet")

#sio = SocketIO(app)
aois=[] #Liste des différentes AOI connecté (valeur = adresse ip) 

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
    print(data)

#Envoyer une requete GET, on peut mettre un argument, index pour définir AOI destination
#Dans la liste adresse ip de chaucne aoi, on peut choisir
async def sendMessage():
    async with httpx.AsyncClient() as client: #
        print(aois[0])
        response = await client.get("http://"+aois[0]+":5200/release?output=2&state=0")

@sio.on("refresh_list")
def sendlist():
    sio.emit("update_list",aois)


@sio.on("ledon")
def led_action():
    asyncio.run(led_on())
    #print("Instructiont to toggel led send from server")

@sio.on("ledoff")
def led_action():
    asyncio.run(led_off())
    #print("Instructiont to toggel led send from server")

@sio.on("poweron")
def led_action():
    asyncio.run(power_on())
    #print("Instructiont to toggel led send from server")

@sio.on("poweroff")
def led_action():
    asyncio.run(power_off())
    #print("Instructiont to toggel led send from server")



async def led_on():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=2&state=0")

async def led_off():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=2&state=1")

async def power_on():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=15&state=0")

async def power_off():
    async with httpx.AsyncClient() as client: #
        response = await client.get("http://"+aois[0]+":5200/release?output=15&state=1")


if __name__== "__main__":
    sio.run(app,host="0.0.0.0",port=5000) #diffuse le serveur sur toutes les adresses ip possible. 
    #Le port pour accèder au serveur sera 5000

#Tous les AOI une ip en commun : le server

