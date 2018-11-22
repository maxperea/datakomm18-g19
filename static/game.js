

//let movement = require('C:\Users\David\Documents\Datakom\datakomm18-g19\movement')
//let movement = require('./movement')
//import * as movement from './movement'
// Setup global variables, add io
let socket = io()
// The current state of intended movement




let gravity = 0.35
let edispersion = 0.99
let bounce = 0.6
let acceleration = 0.3
let jumpforce = 4
let speedcap = 8
let bounds = {
    left: 10,
    up: 10,
    right: 790,
    down: 590
}

movePlayer = (player, movement) => {
    if (movement.left) moveLeft(player)
    if (movement.up) jump(player)
    if (movement.right) moveRight(player)
}

forces = (player) => {
    player.yspeed *= edispersion // Air resistance/general dispersion of energy
    player.xspeed *= edispersion // -..-
    player.yspeed += gravity // gravitational force
    player.x += player.xspeed //movement derived from speed
    player.y += player.yspeed // -..-
}

confine = (player, bounds) => {
    if (isBelow(player, bounds)) {
        player.y = bounds.down 
        player.yspeed *= -bounce
        player.onground = true
    } else if (isAbove(player, bounds)) {
        player.y = bounds.up
        player.yspeed *= -bounce
    } 
    if (isRightOf(player, bounds)) {
        player.x = bounds.right
        player.xspeed *= -bounce
    } else if (isLeftOf(player, bounds)) {
        player.x = bounds.left
        player.xspeed *= -bounce
    } 
}

checkLoss = (player, bounds) => {
    if(isAbove(player, bounds))
    player.lost = true
}

moveItemUp = (y, bounds) => {
    bounds.up += y
    bounds.down += y
}
canMove= (player, movement) => {
    return true
}
collisionWThing = (player, bounds) => {
    if(isRightOf(player, bounds) &&
        !isAbove(player, bounds) &&
        !isBelow(player, bounds)) {
            if (player.x - player.radius < bounds.right) {
                player.x = bounds.right + player.radius
                player.xspeed *= -bounce
            }
        }
    if(isAbove(player, bounds) &&
        !isLeftOf(player, bounds) &&
        !isRightOf(player, bounds)) {
            if (player.y + player.radius > bounds.up) {
                player.y = bounds.up - player.radius
                player.yspeed *= -bounce
                player.onground = true
            }
        }
    if(isLeftOf(player, bounds) &&
        !isAbove(player, bounds) &&
        !isBelow(player, bounds)) {
            if (player.x + player.radius > bounds.left) {
                player.x = bounds.left - player.radius
                player.xspeed *= -bounce
            }
        }
    if(isBelow(player, bounds) &&
        !isLeftOf(player, bounds) &&
        !isRightOf(player, bounds)) {
            if (player.y - player.radius < bounds.down) {
                player.y = bounds.down + player.radius
                player.yspeed *= -bounce
            }
        }
   
}

let isBelow = (player, bounds) => {
    return player.y > bounds.down
}
let isAbove = (player, bounds) => {
    return player.y < bounds.up
}
let isRightOf = (player, bounds) => {
    return player.x > bounds.right
}
let isLeftOf = (player, bounds) => {
    return player.x < bounds.left
}
let moveLeft = (player) => {
    if (player.yspeed > -speedcap) player.xspeed -= acceleration
}
let moveRight = (player) => {
    if (player.yspeed < speedcap) player.xspeed += acceleration
}
let jump = (player) => {
    if(player.onground){
        player.yspeed -= jumpforce
    }
    player.onground = false

    
}



let speed = -0.2


let moving = {
    left: false,
    up: false,
    right: false,
    down: false
}
//simple for testing
let spd = 10
let tempStatePosition= {
    x:100,
    y:100
}

let permStatePosition= {
    x:100,
    y:100
}
let positionUpdateRate= 1
let counter = 1
let id = null
let tempState = null
let permState = {}
/*
tempState.position = {
    x:100,
    y:100    
}
permState.position = {
    x:100,
    y:100
}*/
// Get canvas from html document
let canvas = document.getElementById('canvas')
// Set params
canvas.width = 800
canvas.height = 600
// Get context from canvas (this is the variable used to draw)
var context = canvas.getContext('2d')

// Send new player message
socket.emit('new player')

// Add event listener for key presses, changes the movement object
document.addEventListener('keydown', event => {
    switch (event.keyCode) {
        case 65: // A
            moving.left = true
            break
        case 87: // W
            moving.up = true
            break
        case 68: // D
            moving.right = true
            break
        case 83: // S
            moving.down = true
            break
    }
})
document.addEventListener('keyup', event => {
    switch (event.keyCode) {
        case 65: // A
            moving.left = false
            break
        case 87: // W
            moving.up = false
            break
        case 68: // D
            moving.right = false
            break
        case 83: // S
            moving.down = false
            break
    }
})
function updatePermState(state){
    permState= state
}
function updateTempState(state){
   tempState= state
}
function predictGameChange(){
    for (var i in tempState.players) {
        let player = tempState.players[i]
        
        if(player.moving != null && canMove(player, player.moving)){ //not sure about the order of every movement realated action
            movePlayer(player, player.moving)
        }
        checkLoss(player, bounds)
        forces(player)
        confine(player, bounds)
        for (var id in tempState.world) {
            let item = tempState.world[id]
            collisionWThing(player, item)
        }
    }
    // Moves the world upwards with speed $speed
    for (var id in tempState.world) {
        let item = tempState.world[id]
        moveItemUp(speed, item)
    }

}
function updatePosition(moving){
    //if(canMove){
      //  movePlayer(player, moving)
    //}

    predictGameChange()
    
    //if(moving.left && moving.left + spd >9){
     //   tempState.position.x -= spd
    //}
    /*
    if(moving.right && moving.right + spd <791){
        tempState.position.x += spd
    }
    if(moving.up && moving.up + spd >9){
        tempState.position.y += spd
  }*/
    
}
function drawState(state){
    context.fillStyle = 'black'
    context.fillRect(0, 0, 800, 600)
    context.fillStyle = 'yellow'
    for(let id in state.players) {
        let player = state.players[id]
        if (!player.lost) {
            context.beginPath();
            context.arc(player.x, player.y, 10, 0, 2 * Math.PI)
            context.fill()
        }
    }
    for (let id in state.world) {
        let item = state.world[id]
        context.fillStyle = 'purple'
        context.beginPath();
        context.rect(item.left, item.up, item.right - item.left, item.down - item.up)
        context.fill()
    }
    //updatePermState(state)
}
// Sends information of movement every 1/60th second

setInterval( ()=> {
    counter++
    
    if(tempState != null){
        if(counter % positionUpdateRate == 0){
            if(id != null){
                tempState.players[id].moving = moving //instantly uppdates tempState
            }
        
            updatePosition(moving)
        }
        drawState(tempState)
        
    }
    
    socket.emit('movement', moving)
    
}, 1000 / 60)

// When a new state is received, draw it
socket.on('state', state => {
    //updatePermState(state)
    updateTempState(state)
    //drawState(state)
})

socket.on('rollback', state => {
    tempState=state
})
socket.on('playerId', playerId => {
    id = playerId
})

// When new score is received, update score
socket.on('score', score => {
    document.getElementById('score').innerText = score;
})
// This module contains the functinos controlling movement and forces of the game
// It should be quite self-explanatary
