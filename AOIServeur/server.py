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

sio = SocketIO(app,async_mode="eventlet")
#sio = SocketIO(app)
aois=[]

#On recoit une get de AOI :

#Créer une fonction app route home 
# écoute requpete get sur le / et return le code 

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
        response = await client.get("http://"+aois[0]+":5200/release?output=2&state=0")

@sio.on("refresh_list")
def sendlist():
    sio.emit("update_list",aois)


if __name__== "__main__":
    sio.run(app,host="0.0.0.0",port=5000) #diffuse le serveur sur toutes les adresses ip possible. 

#Tous les AOI une ip en commun : le server

