const {Wolf, Pig, Bullet, Prop} = require('./sprite')
let players = {
    wolfs: [], 
    pigs: []
}
let guestCount = 0
let playerMap = new Map()
let blocks = []
let props = []
let bullets = []

function genRand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const setParams = (collisionBlocks, collisionProps) => {
    blocks = collisionBlocks
    props = [...collisionProps.trees, ...collisionProps.towers].map(p => new Prop(p)).map(p => 
        new Object({position: p.collision, width: p.collisionWidth, height: p.collisionHeight}))
}

const getStats = () => {
    const filtered = playerMap.values.map( value => value.getStats())
    return filtered
}

const getGuestName = () => {
    const countStr = guestCount.toString()
    const digits = 4
    const zeros = '0'.repeat(digits - countStr.length)
    guestCount++;

    return 'Guest#' + zeros + countStr
}

const getNewPlayer = (team, playerParams) => {
    playerParams = {...playerParams, team, collisionBlocks: blocks}
    let player
    if(team === 'wolfs'){
        player = new Wolf({...playerParams, orientation: 'left', position: {
            x: genRand(2788, 2960),
            y: genRand(1271, 1511)
        }})
    }
    else {
        player = new Pig({...playerParams, orientation: 'right', position: {
            x: genRand(69, 469),
            y: genRand(93, 453)
        }})
    }
    if(player.name === '') player.name = getGuestName()
    return player
}

const join = (id, {name, team}) => {
    if(team !== 'wolfs') team = 'pigs'

    let player = getNewPlayer(team, {id, name})
    
    playerMap.set(id, player)
    players[team].push(player)
    console.log(team, 'player joined')

    return team
}

const revive = (id) => {
    if(playerMap.has(id)){
        const user = playerMap.get(id)
        const player = getNewPlayer(user.team, {id, name: user.name, kills: user.kills, deaths: user.deaths})
        playerMap.set(id, player)
        players[user.team].push(player)
    }
}

const disconnect = (id) => {
    if(playerMap.has(id)){
        const user = playerMap.get(id)
        players[user.team] = players[user.team].filter((p) => p.id != id)
        playerMap.delete(id)
    }
    console.log('client disconnected')
}

const move = (id, params) => {
    if(playerMap.has(id)){
        const player = playerMap.get(id)
        if(!player.isDead) player.move(params)
    }
}

const checkWolfAttack = (wolf) => {
    for(const pig of players.pigs){
        if(wolf.canAttack(pig)){
            pig.takeDmg(wolf.attackDmg)
            if(pig.isDead) wolf.kills++
        }
    }
    wolf.isAttacking = false
}

const update = () => {
    const now = new Date().getTime()
    for(const pig of players.pigs) pig.update()
    for(const wolf of players.wolfs){
        wolf.update()
        if(wolf.isAttacking) checkWolfAttack(wolf)
    }
    for(const bullet of bullets) bullet.update(players.wolfs)
    
    bullets = bullets.filter((b) => b.created + b.TTL >= now)
    let newWolfs = []
    for(const wolf of players.wolfs){
        if(!wolf.dispose) newWolfs.push(wolf)
        if(wolf.isDead && wolf.id) wolf.id = null
    }
    let newPigs = []
    for(const pig of players.pigs){
        if(!pig.dispose) newPigs.push(pig)
        if(pig.isDead && pig.id) pig.id = null
    }
    players.wolfs = newWolfs
    players.pigs = newPigs

    return {players, bullets}
}

const attack = (id, angle) => {
    const player = playerMap.get(id)
    if(player && !player.isDead){
        player.attack()
        if(player.team === 'pigs' && player.isAttacking && angle){
            player.attackAngle = angle
            bullets.push(new Bullet({
                position: {...player.gun.position},
                angle,
                collisionBlocks: [...blocks, ...props],
                owner: player
            }))
            player.isAttacking = false
        }
    }
}

const message = (id, msg) => {
    if(playerMap.has(id)){
        const player = playerMap.get(id)
        player.sendMsg(msg)
    }
}

module.exports = {
    join,
    revive,
    disconnect,
    move,
    update,
    attack,
    setParams,
    message,
    getStats
}