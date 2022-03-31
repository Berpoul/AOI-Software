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



function refresh_list(){
    socket.emit("refresh_list")
}

function find_smell(){
  socket.emit("find")
}

//Liste vide et si on appuie refresh : la liste déroulante se met à jour 

//envoyer un évènement.
socket.emit("test","coucou")

// function led_on(){
//     socket.emit("ledon")
//     //console.log(socket)
// }
// function led_off(){
//     socket.emit("ledoff")
//     //console.log(socket)
// }


// function power_on(){
//     socket.emit("poweron")
//     //console.log(socket)
// }
// function power_off(){
//     socket.emit("poweroff")
//     //console.log(socket)
// }


/* initialize the switches */
const switches = {
    led: false,
    power: false,
    piezzo1: false,
    piezzo2: false,
    piezzo3: false,
    piezzo4: false

  }
  
  function toggle(switchKey) {
    if (switches[switchKey]) {
       socket.emit(`${switchKey}off`) //socket.emit("ledoff")
       
    } else {
       socket.emit(`${switchKey}on`)
    }
    switches[switchKey] = !switches[switchKey]
    console.log(`Toggled ${switchKey} to : ${switches[switchKey]}`)
  }
  
  
  /* listen to toggle inputs */
  const inputList = Array.from(document.querySelectorAll('.toggleWrapper'))
  
  inputList.forEach(element => {
    const input = element.querySelector('.customToggle')
    input.addEventListener('click', () => {
  
      // toggle html class
      if (input.classList.contains('toggled')) {
        input.classList.remove('toggled')
      } else {
        input.classList.add('toggled')
      }
  
      // trigger the appropriate socket event
      toggle(element.dataset.switch)
    })
  })