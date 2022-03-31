//Tous ce qui est dans le dossier static est accessible via url /static/script/socket.js : print let socket 
//io dans la bibliothèque socket io 
const socket = io.connect(window.location.origin, { //adresse ip du serveur socket
    cors: { //options pour éviter un bordel 
        origin: "*",
        methods: ["GET", "POST"]
    },
});
//SocketIO passe en pulling 

//Définir action à réception PUIS APRES envoyer event

//On recoit l'évent update list : consol log data

socket.on("update_list",data => {
    console.log(data)
})

//envoyer un évènement.
socket.emit("test","coucou")


//fonction

function refresh_list(){
    socket.emit("refresh_list")
}

//Liste vide et si on appuie refresh : la liste déroulante se met à jour 