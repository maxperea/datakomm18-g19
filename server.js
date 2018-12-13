// Constants
const maxRectanglesObjects = 50
const maxNoHoles = 5
const holeSize = 50


// Dependencies
let movement = require('./movement')
let express = require('express')
let http = require('http')
let path = require('path')
let socketIO = require('socket.io')




let app = express()
let server = http.Server(app)
let io = socketIO(server)
let connectCounter = 0
let highScores = {
    first:{score: 0,
           id: "",
           name: ""},
    second:{score: 0,
            id: "",
            name: ""},
    third:{score: 0,
           id: "",
           name: ""}
}
let firstLoss = false;


let port = 80

let refreshRate = 1000 / 60

//used to show local state works
let sendRate = 1
let SCounter = 0
app.set('port', port)




app.use('/static', express.static(__dirname + '/static'))

// Routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

// Starts the server.
server.listen(port, () => {
    console.log(`Starting server on ${port}`)
})

// Setup global variables
// The object containing all player objects
let players = {}

// The object containing all item objects
let world = {}

//The object describing the size of the gamespace
let bounds = {
    left: 10,
    up: 10,
    right: 790,
    down: 590
}

// The state of the game: the combination of all players and the world
let state = {
    players: players,
    world: world
}

// Variables used by later functions, speed: movement of the world, trigger: accumulates speed to
// trigger the addition of a new row, counter: counts up by makeRow() to identify the different rows
let speed = -0.3
let trigger = 0
let counter = 0

// Uses global variables counter and world to add new rows to the game $world
let makeRow = (y, height) => {
    // should be constants or macros
    let windowWidth = 800

    let noHoles = Math.ceil(Math.random()*maxNoHoles)

    let holes = [-holeSize]  // puts a hole that ends at x= 0


    for(let i = 1; i < noHoles +1; ++i){
        holes[i] = Math.floor(Math.random()*(windowWidth-holeSize))
    }
    holes.sort(function(a, b){return a-b})

    holes[noHoles+1] = windowWidth  // puts a hole at windowWidth


    //  puts rectangles between all holes
    for(let i = 1; i < noHoles + 2; ++i){
        if((holes[i-1]+ holeSize) < holes[i]){
            world[counter%maxRectanglesObjects] = {
                left: holes[i-1]+ holeSize,
                up: y,
                right: holes[i],
                down: y+ height,
            }
            counter++
        }
    }


}
let mapNameToId = (id, name)=> {
    if(first.id == id){
        first.name = name
    }
    if(second.id == id){
        second.name = name
    }
    if(third.id == id){
        third.name = name
    }
}
let updateHighScore = (newScore, id, name) => {
    temp = {
        score: newScore,
        id: id,
        name: name
    }
    old = null
    oldId = null
    for(i = 0; i< 100; i++){
        if (i == id){
            return
        } 
    }
    
    if(temp.score > highScores.first.score){
        old = highScores.first
        highScores.first = temp
        temp = old
        if(highScores.second.id == highScores.first.id){
            highScores.second = temp
        }
        
        if(highScores.third.id == highScores.first.id){
            highScores.third = temp
            
        }
      
    }

    
    if(temp.score > highScores.second.score  && highScores.first.id != temp.id){
        old = highScores.second
        highScores.second = temp
        temp = old
        
        if(highScores.second.id == highScores.third.id){
            highScores.third = temp
        }
    }

    
    if(temp.score > highScores.third.score  && highScores.first.id != temp.id && highScores.second.id != temp.id){
        old = highScores.third
        highScores.third = temp
        temp = old
    }
        
}



let newGame = () => {
    makeRow(600, 50)
    makeRow(500, 50)
    makeRow(400, 50)
    makeRow(300, 50)
    makeRow(200, 50)
    makeRow(100, 50)
}

newGame()

// All the functions reacting on messages from clients
io.on('connection', socket => {
    connectCounter++
    // Creates a new player object on arrival
    socket.on('new player', () => {
        players[socket.id] = {
            x:300,
            y:300,
            yspeed: 0,
            xspeed: 0,
            radius: 10,
            onground: false,
            score: 0,
            name: "",
            lost: false,
            moving: null,

            index: connectCounter
        }
        socket.emit('playerId', socket.id)
        socket.emit('highScore', highScores)
    })
    socket.on('saveName', name => {
        let player = players[socket.id] || {};
        player.name = name
    })
    // Takes keyboard data and applies movePlayer function, moving the player.
    socket.on('movement', data => {
        let player = players[socket.id] || {};

        if(data != null){
            player.moving = data
            
        }
        else{
            console.log("no movement data recieved")
        }
        if(movement.canMove(player, data)){
            movement.movePlayer(player, player.moving)
        }
        else{
            player.moving = {
                left: false,
                up: false,
                right: false,
                down: false
            }
            
            socket.emit('rollback', state)
        }
        socket.emit('score', player.score)

    })
    // Removes the player on disconnect
    socket.on('disconnect', function() {
        console.log("Id :" + socket.id + " disconnected")
        player = players[socket.id]
        if(player != null){
          updateHighScore(player.score, player.index, player.name)
        }
        delete players[socket.id]
    });
})



// This function updates the gamestate and then emits it to all players
setInterval(() => {
    // Applies forces, checks loss and confines the player, it also checks collision with items
    for (var i in players) {
        let player = players[i]
        
        movement.checkLoss(player, bounds)
        movement.forces(player)
        movement.confine(player, bounds)
        for (var id in world) {
            let item = world[id]
            movement.collisionWThing(player, item)
        }
    }
    // Moves the world upwards with speed $speed
    for (var id in world) {
        let item = world[id]
        movement.moveItemUp(speed, item)
    }

    // Here the trigger is increased by $speed and when it reaches 100 makeRow() is called
    // Score is also added to the player
    trigger += -speed
    if (trigger > 100) {
        trigger = 0
        makeRow(600, 50)
        //speed -= 0.05
        for (var id in players) {
            let player = players[id]
            if(!player.lost) {
                player.score -= 100 * speed
                
                updateHighScore(player.score, id, player.name)
                
            }
            else{
                io.sockets.emit('highScore', highScores)
            }
        }
    }
    //used to be able to see difference between local and persistant state
    SCounter++
    if(SCounter % sendRate == 0){
        // State is emitted
        io.sockets.emit('state', state)
    }
    io.sockets.emit('highScore', highScores) // this is not the most efficient but cba
    
}, refreshRate)
