const {twoRectCollides, sphereAndRectCollides} = require('./collision')
const PLAYER_SPEED = 4

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

    updateHitBox(){
        this.hitBox.position.y = this.position.y + this.hitBox.offset.y
        this.hitBox.position.x = this.position.x + this.hitBox.offset.x
    }

    update(){
        this.position.y += this.velocity.y
        this.updateHitBox()
        this.checkCollisionVert()
        this.bottom = this.position.y + this.height
        this.position.x += this.velocity.x
        this.updateHitBox()
        this.checkCollisionHoriz()    
    }

    checkCollisionVert(){
        for(const block of this.collisionBlocks){
            if(twoRectCollides(this.hitBox, block)){
                if(this.velocity.y > 0){
                    this.velocity.y = 0
                    const offset = this.hitBox.position.y - this.position.y + this.hitBox.height
                    this.position.y = block.position.y - offset - 0.01
                } else if(this.velocity.y < 0){
                    this.velocity.y = 0
                    const offset = this.hitBox.position.y - this.position.y
                    this.position.y = block.position.y + block.height - offset + 0.01
                }
                this.hitBox.position.y = this.position.y + this.hitBox.offset.y
            }
        }
    }

    checkCollisionHoriz(){
        for(let i = 0; i < this.collisionBlocks.length; i++){
            const block = this.collisionBlocks[i]
            if(twoRectCollides(this.hitBox, block)){
                if(this.velocity.x > 0){
                    this.velocity.x = 0
                    const offset = this.hitBox.position.x - this.position.x + this.hitBox.width
                    this.position.x = block.position.x - offset - 0.01
                } else if(this.velocity.x < 0){
                    this.velocity.x = 0
                    const offset = this.hitBox.position.x - this.position.x
                    this.position.x = block.position.x + block.width - offset + 0.01
                }
                this.hitBox.position.x = this.position.x + this.hitBox.offset.x
            }
        }
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

    getStats(){
        return { id: this.id, team: this.team, name: this.name, kills: this.kills, deaths: this.deaths }
    }
    
    sendMsg(msg){
        if(msg.length === 0) this.msg.chunks = []
        else{
            const maxLineLength = 35
            const maxMsgLength = 100
            if(msg.length > maxMsgLength) msg = msg.substring(0, maxMsgLength - 3) + '...'
            let chunks = []
            for (let i = 0; i < msg.length; i += maxLineLength) {
                const chunk = msg.slice(i, i + maxLineLength);
                chunks.push(chunk)
            }
            this.msg = {chunks}
        }
    }

    update(){
        super.update()
        this.currentFrame++
    }

    move({keys, lastKey, vector}){
        if(keys){
            if(keys.w.pressed){
                this.velocity.y = -PLAYER_SPEED
            }
            else if(keys.s.pressed){
                this.velocity.y = PLAYER_SPEED
            }
            else this.velocity.y = 0
    
            if(keys.a.pressed && lastKey === 'a'){
                this.velocity.x = -PLAYER_SPEED
            }
            else if(keys.d.pressed && lastKey === 'd'){
                this.velocity.x = PLAYER_SPEED
            }
            else this.velocity.x = 0
        } else if(vector){
            if(vector.x <= 1 && vector.x >= -1) this.velocity.x = vector.x * PLAYER_SPEED
            if(vector.y <= 1 && vector.y >= -1) this.velocity.y = -vector.y * PLAYER_SPEED
        }

        if(this.velocity.x < 0) this.orientation = 'left'
        else if(this.velocity.x > 0) this.orientation = 'right'
    }

    takeDmg(dmg){
        this.isBeingHit = true
        this.health -= dmg
        setTimeout(() => {
            this.isBeingHit = false
        }, 150)
        if(this.health <= 0) this.die()
    }

    die(){
        this.deaths++
        this.velocity = {x: 0, y: 0}
        this.hitBox.width = 0
        this.hitBox.height = 0

        this.isDead = true
        this.dieingAnimation = true
        setTimeout(() => {
            this.dieingAnimation = false
        }, 500)
        setTimeout(() => {
            this.dispose = true
        }, 10000)
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
        
    attack(){
        let now = new Date().getTime()
        if(now >= this.lastAttack + this.attackCooldown && !this.isBeingHit){
            this.isAttacking = true
            this.attackAnimation = true

            setTimeout(() => {
                this.attackAnimation = false
            }, 300)
            this.lastAttack = now
        }
    }

    canAttack(target){
        return sphereAndRectCollides(this.attackCircle, target.hitBox)
    }

    updateAttackBox(){
        const xbox = this.orientation === 'right' ? this.width : 0
        this.attackCircle.position.x = this.position.x + xbox
        this.attackCircle.position.y = this.position.y + this.height / 2
    }

    update(){
        super.update()
        this.updateAttackBox()
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

    updateGun(){
        this.gun = {
            position: {
                x: this.position.x + 40,
                y: this.position.y + 32
            },
            width: 40,
            height: 15
        }
    }

    update(){
        super.update()
        this.updateGun()
    }

    attack(){
        let now = new Date().getTime()
        if(now >= this.lastAttack + this.attackCooldown && !this.isBeingHit){
            this.isAttacking = true
            this.attackAnimation = true

            setTimeout(() => {
                this.attackAnimation = false
            }, 100)
            this.lastAttack = now
        }
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
        this.velocity = this.calculateVelocity(this.angle)
    }

    calculateVelocity(angle){
        let xVelocity = Math.cos(angle) * this.speed
        let yVelocity = Math.sin(angle) * this.speed

        return {x: xVelocity, y: yVelocity}
    }

    collides(){
        for(const block of this.collisionBlocks){
            if(twoRectCollides(this, block)) return true
        }
        return false
    }

    hits(targets){
       for(const target of targets){
        if(twoRectCollides(this, target.hitBox)){
            target.takeDmg(this.damage)
            if(target.isDead) this.owner.kills++
            return true
        }
       }
       return false
    }

    update(targets){
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x
        if(this.collides() || this.hits(targets)) this.TTL = 0
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
}
module.exports = {Wolf, Pig, Bullet, Prop}