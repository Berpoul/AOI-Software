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
/*
socket.on("update_list",data => {
    console.log("Addresse ip de AOI : "+data)
})



function refresh_list(){
    socket.emit("refresh_list")
}*/

const displayIP = document.getElementById('btnShowIP')
socket.on("update_list", data => {
  // console.log(data)
  displayIP.innerHTML = "> " + data;
})


document.getElementById('btnShowIP').addEventListener('click', () => {
  socket.emit("refresh_list")
})




function find_smell(){
  socket.emit("find")
  console.log("Find smell event sent to server")

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
       console.log("Socket Event sent to server : "+switchKey+"off")

    } else {
       socket.emit(`${switchKey}on`)
       console.log("Socket Event sent to server : "+switchKey+"on")

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


/* PLAY GUESS SCRIPT */

let isPlayingGuess = false
const guessBtn = document.getElementById('playGuessBtn')
const main = document.querySelector('main')
const playGuessCheck = document.getElementById('playGuessCheck')
function playGuess() {
  if (!isPlayingGuess) {
    isPlayingGuess = true
    socket.emit('startGuess')
    main.classList.add('playGuess')
    guessBtn.innerHTML = 'Stop playing'
    playGuessCheck.style.opacity = 1
    playGuessCheck.innerHTML = "What are you smelling ?"
  } else {
    isPlayingGuess = false
    socket.emit('stopGuess')
    main.classList.remove('playGuess')
    guessBtn.innerHTML = 'Play "guess the smell"'
    playGuessCheck.style.opacity = 0
    playGuessCheck.innerHTML = ""
  }
}
Array.from(document.querySelectorAll('.scent')).forEach(elem => {
  elem.addEventListener('click', () => {
    if (isPlayingGuess) {
      socket.emit('guess', elem.dataset.switch)
    }
  })
})

socket.on('check', (data) => {
  if (isPlayingGuess) {
    if (data) {
      isPlayingGuess = false
      playGuessCheck.style.opacity = 0
      setTimeout(() => {
        playGuessCheck.style.opacity = 1
        playGuessCheck.innerHTML = "CORRECT!"
      }, 200);

      setTimeout(() => {
        playGuessCheck.style.opacity = 0
        main.classList.remove('playGuess')
        guessBtn.innerHTML = 'Play "guess the smell"'
      }, 1500)
    } else {
      playGuessCheck.style.opacity = 0
      setTimeout(() => {
        playGuessCheck.style.opacity = 1
        playGuessCheck.innerHTML = "WRONG..."
      }, 200);
    }
  }
})

document.getElementById('playGuessBtn').addEventListener('click', playGuess)


