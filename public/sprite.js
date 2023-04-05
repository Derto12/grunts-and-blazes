/*!
 * Copyright 2023 by Balint Erdosi
 * All rights reserved
 * github.com/derto12
 */
import { pigStates, wolfStates } from "./character-states.js";

class ScreenObj {
    position = {x: undefined, y: undefined}
    velocity = {x: 0, y: 0}
    width = 24
    height = 48
    bottom = undefined
    orientation = undefined
    collisionBlocks = []
    hitBox = {
        offset: {
            x: 0,
            y: 0
        },
        position: {
            x: this.position.x,
            y: this.position.y
        },
        width: this.width,
        height: this.height
    }

    constructor(values){
        Object.assign(this, values);
    }

    draw(ctx){
        ctx.fillStyle = 'blue'
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

class Player extends ScreenObj{
    id = undefined
    name = undefined
    isDead = false
    dispose = false
    maxHealth = 500
    attackDmg = 70
    isBeingHit = false
    attackCooldown = 500
    lastAttack = new Date().getTime()
    isAttacking = false
    attackAnimation = false
    dieingAnimation = false
    framePosX = 0
    heldFrames = 0
    currentFrame = 0
    width = 65
    height = 65
    kills = 0
    deaths = 0
    attackAgle = 0
    msg = {
        chunks: []
    }

    constructor(values){
        super(values)
        Object.assign(this, values);
        this.health = this.maxHealth
    }

    draw(ctx, states){
        let state
        if(this.dieingAnimation) state = states.dieState
        else if(this.isDead) state = states.deathState
        else if(this.isBeingHit) state = states.hitState
        else if(this.attackAnimation && states.attackState) state = states.attackState
        else if(this.velocity.x !== 0 || this.velocity.y !== 0) state = states.runState
        else state = states.idleState
        
        const stateImg = state.imgs[this.orientation]
        const frameWidth = stateImg.width / state.frames
        const cropBox = {
            position: { 
                x: 0,
                y: 0
            },
            width: frameWidth,
            height: stateImg.height
        }
        if(state.frames > 1){
            let newPos = (parseInt(this.currentFrame / state.frameHold) % state.frames) * frameWidth
            if(this.orientation === 'left') newPos = Math.abs(newPos - (state.frames - 1) * frameWidth)
            cropBox.position.x = newPos
        }
        
        ctx.drawImage(stateImg,
            cropBox.position.x, cropBox.position.y,
            cropBox.width, cropBox.height,
            this.position.x, this.position.y,
            this.width, this.height
        )
        if(this.msg.chunks.length > 0) this.drawMessage(ctx)
    }

    drawMessage(ctx){
        ctx.lineWidth = 4
        ctx.strokeStyle = "#000000"
        ctx.font="10px Georgia"
        ctx.textAlign="center" 
        ctx.textBaseline = "middle"
        ctx.fillStyle = "white"
        
        const lineHeight = 10
        const rectHeight = this.msg.chunks.length * lineHeight + 10
        const rectWidth = Math.max(...this.msg.chunks.map(c => c.length)) * 5 + 20
        const rectX = this.hitBox.position.x + this.hitBox.width / 2 - rectWidth / 2
        const rectY = this.hitBox.position.y - rectHeight - 5

        ctx.fillRect(rectX, rectY, rectWidth, rectHeight)
        ctx.fillStyle = "black"
        for(let i = 0; i < this.msg.chunks.length; i++){
            ctx.fillText(this.msg.chunks[i], rectX + (rectWidth/2), rectY + (i+1) * lineHeight)
        }
    }
}

class Wolf extends Player{
    team = 'wolf'
    attackCircle = {
        position: {x: 0, y: 0},
        radius: 45
    }
    attackCooldown = 300
    lastAttack = new Date().getTime()
    isAttacking = false
    attackAnimation = false
    hitBox = {
        offset: {
            x: 0,
            y: 30
        },
        position: {
            x: this.position.x,
            y: this.position.y + this.hitBox.offset.y
        },
        width: this.width,
        height: this.height / 2 - this.hitBox.offset.y
    }

    constructor(values){
        super(values)
        Object.assign(this, values);
    }

    drawScratch(ctx){
        const state = wolfStates.attackState.scratch
        const stateImg = wolfStates.attackState.scratch.imgs[this.orientation]
        const frameWidth = stateImg.width / state.frames
        const cropBox = {
            position: { 
                x: 0,
                y: 0
            },
            width: frameWidth,
            height: stateImg.height
        }

        let newPos = (parseInt(this.currentFrame / state.frameHold) % state.frames) * frameWidth
        if(this.orientation === 'left') newPos = Math.abs(newPos - (state.frames - 1) * frameWidth)
        cropBox.position.x = newPos

        let dxOffset = this.attackCircle.radius - 20
        if(this.orientation === 'left') dxOffset *= -1

        const imgSize = 90
        const dx = this.attackCircle.position.x + dxOffset - imgSize / 2
        const dy = this.attackCircle.position.y - imgSize / 2
        
        ctx.drawImage(stateImg,
            cropBox.position.x, cropBox.position.y,
            cropBox.width, cropBox.height,
            dx, dy,
            imgSize, imgSize
        )
    }

    draw(ctx){
        super.draw(ctx, wolfStates)
        if(this.attackAnimation) this.drawScratch(ctx)
    }
}

class Pig extends Player{
    team = 'pig'
    attackCooldown = 180
    hitBox = {
        offset: {
            x:  15,
            y: 0
        },
        position: {
            x: this.position.x + this.hitBox.offset.x,
            y: this.position.y
        },
        width: 35,
        height: this.height
    }

    constructor(values){
        super(values)
        Object.assign(this, values);
    }

    draw(ctx){
        super.draw(ctx, pigStates)
        if(!this.isDead) this.drawGun(ctx)
    }

    drawGun(ctx){
        ctx.save()
        if(Math.abs(this.attackAngle) > Math.PI / 2){
            let posX = this.gun.position.x - 5
            if(this.orientation === 'left') posX -= 5
            ctx.translate(posX - 5, this.gun.position.y)
            ctx.scale(-1, 1)
            ctx.rotate(-this.attackAngle-Math.PI)
        }
        else {
            let posX = this.gun.position.x
            if(this.orientation === 'left') posX -= 5
            ctx.translate(posX, this.gun.position.y)
            ctx.rotate(this.attackAngle)
        }
        ctx.drawImage(pigStates.gunImg,
            0, 0,
            pigStates.gunImg.width, pigStates.gunImg.height,
            -this.gun.width / 2, -this.gun.height / 2,
            this.gun.width, this.gun.height
        )
        ctx.restore()
    }
}

class Bullet extends ScreenObj{
    TTL = 400
    created = new Date().getTime()
    wolfs = []
    angle = undefined
    owner = undefined
    speed = 20
    width = 8
    height = 4
    damage = 62

    constructor(values){
        super(values)
        Object.assign(this, values);
    }
    draw(ctx){
        ctx.fillStyle = 'yellow'
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

class Prop{
    img = undefined
    relPos = {
        x: undefined,
        y: undefined
    }
    collision = {
        x: undefined,
        y: undefined
    }
    collisionWidth
    collisionHeight

    constructor(values){
        Object.assign(this, values);
        this.collision.x = this.position.x + this.collisionOffset.x
        this.collision.y = this.position.y + this.collisionOffset.y
    }

    render(){
        const imgRow = parseInt(this.id / this.imgTilesInRow)
        const imgCol = this.id % this.imgTilesInRow
        this.srcX = imgCol * this.tileSize
        this.srcY = imgRow * this.tileSize
        this.posX = this.position.x - this.relPos.x
        this.posY = this.position.y - this.relPos.y
    }

    draw(ctx){
        ctx.drawImage(this.img,
            this.srcX, this.srcY,
            this.width, this.height, 
            this.posX, this.posY,
            this.width, this.height
        )
    }
}

export {Wolf, Pig, Bullet, Prop}