// Constants Possibly move to separate file
// The possible playerColors can add more without changing anything else.
const playerColors = [
    'yellow',
    'green',
    'red'
]

// Setup global variables, add io
let socket = io()
// The current state of intended movement
let movement = {
    left: false,
    up: false,
    right: false,
    down: false
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
            movement.left = true
            break
        case 87: // W
            movement.up = true
            break
        case 68: // D
            movement.right = true
            break
        case 83: // S
            movement.down = true
            break
    }
})
document.addEventListener('keyup', event => {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false
            break
        case 87: // W
            movement.up = false
            break
        case 68: // D
            movement.right = false
            break
        case 83: // S
            movement.down = false
            break
    }
})


// Sends information of movement every 1/60th second
setInterval( ()=> {
    socket.emit('movement', movement)
}, 1000 / 60)

// When a new state is received, draw it
socket.on('state', state => {
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
})