// This module contains the functinos controlling movement and forces of the game
// It should be quite self-explanatary



exports.movePlayer = (player, movement, speedcap, bounds) => {
    if (movement.left) moveLeft(player, speedcap)
    if (movement.up) jump(player)
    if (movement.right) moveRight(player, speedcap)
}

exports.forces = (player) => {
    player.yspeed *= 0.99 // Air resistance/general dispersion of energy
    player.xspeed *= 0.99 // -..-
    player.yspeed += 0.15 // gravitational force
    player.x += player.xspeed //movement derived from speed
    player.y += player.yspeed // -..-
}

exports.confine = (player, bounds) => {
    if (isBelow(player, bounds)) {
        player.y = bounds.down 
        player.yspeed *= -0.5
        player.onground = true
    } else if (isAbove(player, bounds)) {
        player.y = bounds.up
        player.yspeed *= -0.5
    } 
    if (isRightOf(player, bounds)) {
        player.x = bounds.right
        player.xspeed *= -0.5
    } else if (isLeftOf(player, bounds)) {
        player.x = bounds.left
        player.xspeed *= -0.5
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
                player.xspeed *= -0.5
            }
        }
    if(isAbove(player, bounds) &&
        !isLeftOf(player, bounds) &&
        !isRightOf(player, bounds)) {
            if (player.y + player.radius > bounds.up) {
                player.y = bounds.up - player.radius
                player.yspeed *= -0.5
                player.onground = true
            }
        }
    if(isLeftOf(player, bounds) &&
        !isAbove(player, bounds) &&
        !isBelow(player, bounds)) {
            if (player.x + player.radius > bounds.left) {
                player.x = bounds.left - player.radius
                player.xspeed *= -0.5
            }
        }
    if(isBelow(player, bounds) &&
        !isLeftOf(player, bounds) &&
        !isRightOf(player, bounds)) {
            if (player.y - player.radius < bounds.down) {
                player.y = bounds.down + player.radius
                player.yspeed *= -0.5
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
let moveLeft = (player, speedcap) => {
    if (player.yspeed > -speedcap) player.xspeed -= 0.1
}
let moveRight = (player, speedcap) => {
    if (player.yspeed < speedcap) player.xspeed += 0.1
}
let jump = (player) => {
    if(player.onground){
        player.yspeed -= 4
    }
    player.onground = false

    
}