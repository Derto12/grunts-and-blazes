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

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function setParams(collisionBlocks, collisionProps){
    blocks = collisionBlocks
    props = [...collisionProps.trees, ...collisionProps.towers].map(p => new Prop(p)).map(p => 
        new Object({position: p.collision, width: p.collisionWidth, height: p.collisionHeight}))
}

function getStats(){
    const filtered = Array.from(playerMap.values()).map(value => value.getStats())
    return filtered
}

function getGuestName(){
    const countStr = guestCount.toString()
    const digits = 4
    const zeros = '0'.repeat(digits - countStr.length)
    guestCount++;

    return `Guest#${zeros}${countStr}`
}

function getNewPlayer(team, { id, name }) {
    if (name === '') name = getGuestName();
    const position = (team === 'wolfs')
        ? { x: randomBetween(2788, 2960), y: randomBetween(1271, 1511) }
        : { x: randomBetween(69, 469), y: randomBetween(93, 453) };
    const orientation = (team === 'wolfs') ? 'left' : 'right';
    const playerParams = { id, name, team, position, collisionBlocks: blocks, orientation };
    const player = (team === 'wolfs') ? new Wolf(playerParams) : new Pig(playerParams);
    return player;
}

function join(id, {name, team}){
    if(team !== 'wolfs') team = 'pigs'

    let player = getNewPlayer(team, {id, name})
    playerMap.set(id, player)
    players[team].push(player)
    console.log(team, 'player joined')

    return team
}

function revive(id){
    const user = playerMap.get(id)
    if(user){
        const player = getNewPlayer(user.team, {id, name: user.name, kills: user.kills, deaths: user.deaths})
        playerMap.set(id, player)
        players[user.team].push(player)
    }
}

function disconnect(id){
    const user = playerMap.get(id)
    if(user){
        players[user.team] = players[user.team].filter((p) => p.id != id)
        playerMap.delete(id)
    }
    console.log('client disconnected')
}

function move(id, params){
    const player = playerMap.get(id)
    if(player && !player.isDead) player.move(params)
}

function checkWolfAttack(wolf){
    for(const pig of players.pigs){
        if(wolf.canAttack(pig)){
            pig.takeDmg(wolf.attackDmg)
            if(pig.isDead) wolf.kills++
        }
    }
    wolf.isAttacking = false
}

function update() {
    const now = new Date().getTime();
    let { pigs, wolfs } = players;
  
    for (const player of [...pigs, ...wolfs]) {
      player.update();
      if (player.team === 'wolfs' && player.isAttacking) {
        checkWolfAttack(player);
      }
    }
  
    for (const bullet of bullets) bullet.update(wolfs);
    bullets = bullets.filter((bullet) => bullet.created + bullet.TTL >= now);

    let filteredWolfs = wolfs.filter((wolf) => !wolf.dispose);
    let filteredPigs = pigs.filter((pig) => !pig.dispose);
  
    players = { pigs: filteredPigs, wolfs: filteredWolfs };
    return { players, bullets };
  }

function shootBullet(pig, angle){
    pig.attackAngle = angle
    bullets.push(new Bullet({
        position: {...pig.gun.position},
        angle,
        collisionBlocks: [...blocks, ...props],
        owner: pig
    }))
    pig.isAttacking = false
}

function attack(id, angle){
    const player = playerMap.get(id)
    if(player && !player.isDead){
        player.attack()
        if(player.team === 'pigs' 
        && player.isAttacking && angle) shootBullet(player, angle)
    }
}

function message(id, msg){
    const player = playerMap.get(id)
    if(player) player.sendMsg(msg)
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