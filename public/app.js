/*!
 * Copyright 2023 by Balint Erdosi
 * All rights reserved
 * github.com/derto12
 */
import { Wolf, Pig, Bullet } from './sprite.js'
import { socket } from './socket.js';
import './button-events.js'
import './joystick.js';
import { renderTiles, calculateProps } from './utils.js'
import { gameState, updateGameState, changeGameState} from './state.js';
import { SMALL_SIZE} from './ui.js';
import { addGameEvents } from './events.js';
import { game, loading, mainmenu, deadmenu, myTeam, setMyTeam, me, setMe, map} from './game.js';

let wolfs = []
let pigs = []
let bullets = []
let props = []

const canvas = document.querySelector('#canvas')
canvas.width = SMALL_SIZE.width
canvas.height = SMALL_SIZE.height
const ctx = canvas.getContext('2d', {alpha: false, desynchronized: false})
const healthBar = document.getElementById('health')
const mapImg = new Image()
mapImg.src = './assets/tiles/plain_tiles.png'
const propsImg = new Image()
propsImg.src = './assets/tiles/prop_tiles.png'

const buffers = []
const BUFFER_COUNT = 2
for(let i = 0; i < BUFFER_COUNT; i++){
    const canv = document.createElement('canvas')
    const buff = canv.getContext('2d', {alpha: true, desynchronized: true})
    buffers.push(buff)
}

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if(gameState === 'loading') loading(ctx)
    else if(gameState === 'game'){
        game(ctx, buffers, {wolfs, pigs, props, props, bullets})
        if(!foundMeLastTime) deadmenu(ctx)
    }
    else if(gameState === 'mainmenu') mainmenu(ctx)

    window.requestAnimationFrame(animate)
}

let maybeMe
let foundMeLastTime = false
socket.on('update', ({wolfs: newWolfs, pigs: newPigs}, newBullets) => {
    if(gameState === 'game'){
        if(newWolfs) wolfs = newWolfs.map((w) => new Wolf(w))
        if(newPigs) pigs = newPigs.map((p) => new Pig(p))
        if(bullets) bullets = newBullets.map((b) => new Bullet(b))
        
        if(myTeam === 'wolfs') maybeMe = wolfs.find((w) => w.id === socket.id)
        else maybeMe = pigs.find((p) => p.id === socket.id)
        
        if(maybeMe){
            if(!foundMeLastTime){
                updateGameState('game')
                foundMeLastTime = true
            }
            setMe(maybeMe)
        } else if(foundMeLastTime && !maybeMe){
            updateGameState('dead')
            setMe([...pigs, ...wolfs][0])
            foundMeLastTime = false
        }

        if(foundMeLastTime) {
            const health = me ? `${me.health/me.maxHealth * 100}%` : '0px'
            healthBar.style.width = health
        }
    }
})

const join = async () => {
    await new Promise((resolve, reject) => {
        socket.on('joined', (myteam) => {
            setMyTeam(myteam)
            resolve()
        })
    })
    addGameEvents()
    changeGameState('game')
}

const connect = async () => {
    let {map: newMap, props: newProps} = await new Promise((resolve, reject) => {
        socket.on('connected', ({map, props}) => {
            resolve({map, props})
        })
    })
    
    map.rowTileCount = newMap.width
    map.colTileCount = newMap.height
    map.tileSize = newMap.tileSize

    map.width = map.rowTileCount * map.tileSize
    map.height = map.colTileCount * map.tileSize

    for(let i = 0; i < buffers.length; i++){
        buffers[i].canvas.width = map.width
        buffers[i].canvas.height = map.height
    }

    renderTiles(newMap.layers[0], buffers[0], mapImg, map)
    renderTiles(newMap.layers[1], buffers[0], propsImg, map)
    // renderTiles(newMap.layers[2], buffers[0], propsImg, map)
    renderTiles(newMap.layers[3], buffers[0], mapImg, map)

    buffers[1].clearRect(0, 0, map.width, map.height)
    renderTiles(newMap.layers[4], buffers[1], mapImg, map)
    
    const trees = calculateProps(newProps.trees, propsImg, map.tileSize)
    props.push(...trees)

    const towers = calculateProps(newProps.towers, propsImg, map.tileSize)
    props.push(...towers)
}

const main = async() => {
    changeGameState('loading')
    animate()
    await connect()
    await join()
}

main()