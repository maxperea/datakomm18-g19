// This module contains the functinos controlling movement and forces of the game
// It should be quite self-explanatary


let gravity = 0.35
let edispersion = 0.99
let bounce = 0.6
let acceleration = 0.3
let jumpforce = 4
let speedcap = 8


//Should have ome check
exports.canMove= (player, movement) => {
    return true
}
exports.movePlayer = (player, movement) => {
    if (movement.left) moveLeft(player)
    if (movement.up) jump(player)
    if (movement.right) moveRight(player)
}

exports.forces = (player) => {
    player.yspeed *= edispersion // Air resistance/general dispersion of energy
    player.xspeed *= edispersion // -..-
    player.yspeed += gravity // gravitational force
    player.x += player.xspeed //movement derived from speed
    player.y += player.yspeed // -..-
}

exports.confine = (player, bounds) => {
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

exports.checkLoss = (player, bounds) => {
    if(isAbove(player, bounds))
    player.lost = true
}

exports.moveItemUp = (y, bounds) => {
    bounds.up += y
    bounds.down += y
}

exports.collisionWThing = (player, bounds) => {
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
