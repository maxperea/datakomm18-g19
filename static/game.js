
/*requirejs(["./test"], function(test) {
    //This function is called when scripts/helper/util.js is loaded.
    //If util.js calls define(), then this function is not fired until
    //util's dependencies have loaded, and the util argument will hold
    //the module value for "helper/util".
});
let testmod = require('./test')*/
// Constants Possibly move to separate file
// The possible playerColors can add more without changing anything else.
const playerColors = [
    'yellow',
    'green',
    'red'
]


// Setup global variables, add io
let socket = io()

let speed = -0.2


let moving = {
    left: false,
    up: false,
    right: false,
    down: false
}
let positionUpdateRate= 1
let counter = 1
let id = null
let tempState = null


//should import the movement module instead of this

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

//used to sync the local state with the server state
let updateTempState = (state) =>{
   tempState= state
}


//bredicts how the clients will behave
let predictGameChange = () =>{
    for (var i in tempState.players) {
        let player = tempState.players[i]
        
        if(player.moving != null && canMove(player, player.moving)){
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


//creates the graphical represesntaion of the game
let drawState = (state) => {
    context.fillStyle = 'black'
    context.fillRect(0, 0, 800, 600)
    for(let id in state.players) {
        let player = state.players[id]
        context.fillStyle = playerColors[player.index%playerColors.length]
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

    let player = state.players[socket.id] || { score: 0 }
    document.getElementById('score').innerText = player.score;
}
// Sends information of movement every 1/60th second
function saveName(){
    var name = document.getElementById("name").value;
    var score = document.getElementById("score").innerText;
    document.getElementById("saved_name").innerHTML = name;
    document.getElementById("saved_score").innerHTML = score;
    socket.emit('saveName', name)
}
setInterval( ()=> {
    counter++

    //if(testmod.bla()){
      //  console.log("hello")
    //}
    if(tempState != null){
        
        if(counter % positionUpdateRate == 0){
            if(id != null){
                tempState.players[id].moving = moving //instantly uppdates tempState
            }
        
            predictGameChange() 
        }
        drawState(tempState)
        
    }
    
    socket.emit('movement', moving)
    
}, 1000 / 60)

// When a new state is received, sync the local state with it
socket.on('state', state => {
    updateTempState(state)
})

//reverts changes made to the local state
socket.on('rollback', state => {
    tempState=state
})

//gets this client's id
socket.on('playerId', playerId => {
    id = playerId
})

// When new score is received, update score
socket.on('score', score => {
    document.getElementById('score').innerText = score;
})
socket.on('highScore', highScore => {
    console.log("test")
    console.log(highScore)
    document.getElementById('name1').innerText = highScore.first.name
    document.getElementById('score1').innerText = highScore.first.score
    document.getElementById('name2').innerText = highScore.second.name
    document.getElementById('score2').innerText = highScore.second.score
    document.getElementById('name3').innerText = highScore.third.name
    document.getElementById('score3').innerText = highScore.third.score
    
})

