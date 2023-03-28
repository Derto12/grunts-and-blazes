/*!
 * Copyright 2023 by Balint Erdosi
 * All rights reserved
 * github.com/derto12
 */
import {Wolf, Pig, Bullet, Prop} from './sprite.js'
import { wolfStates, pigStates } from './character-states.js';
import { socket } from './socket.js';
import { zone } from './joystick.js';

const buffers = []
const BUFFER_COUNT = 2
for(let i = 0; i < BUFFER_COUNT; i++){
    const canv = document.createElement('canvas')
    const buff = canv.getContext('2d', {alpha: true, desynchronized: true})
    buffers.push(buff)
}

const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d', {alpha: false, desynchronized: false})
const root = document.querySelector(':root')
const tools = document.getElementById('tools')
const healthBar = document.getElementById('health')
const healthCont = document.getElementById('health-cont')
const joinCont = document.getElementById('join')
const msgElem = document.getElementById('msgBox')
const stats = document.getElementById('stats')
const nameInput = document.getElementById('name-input')
const reviveBtn = document.getElementById('revive-btn')
const pigStats = document.getElementById('pig-stats')
const wolfStats = document.getElementById('wolf-stats')
const controlls = document.getElementById('controlls')
const phoneCont = document.getElementById('phone-cont')
const ORIG_SIZE = {width: 1080, height: 720}
const SMALL_SIZE = {width: 720, height: 480}
const MOBILE_SMALL_SIZE = {width: 420, height: 280}
let scale = SMALL_SIZE.width / ORIG_SIZE.width
const elem = document.documentElement

canvas.width = SMALL_SIZE.width
canvas.height = SMALL_SIZE.height

let fullscreen = false
let tileSize
let mapRowTileCount
let mapColTileCount
let cam = {
    pos: { x: 0, y: 0},
    minPos: { x: 0, y: 0},
    maxPos: { x: 0, y: 0} 
}
let fullMapWidth
let fullMapHeight
let me
let name
let wolfs = []
let pigs = []
let bullets = []
let props = []
let team = undefined
let lastKey
let currentState
let showMsgBox = false
let msgBoxFocus = false
let pushX, pushY
const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
}
document.getElementById('pig-btn').onclick = () => {
    team = 'pigs'
    name = nameInput.value
    socket.emit('join', {name, team})
}
document.getElementById('wolf-btn').onclick = () => {
    team = 'wolfs'
    name = nameInput.value
    socket.emit('join', {name, team})
}
document.getElementById('stats-btn').onclick = () => changeStatsState()
document.getElementById('msg-btn').onclick = () => messageBox()
let mobileState = false
const setMobileState = () => {
    if(mobileState){
        if(currentState === 'game'){
            zone.style.display = 'block'
            phoneCont.style.display = 'block'
        }
        controlls.style.display = 'none'
    }
    else{
        zone.style.display = 'none'
        controlls.style.display = 'none'
        phoneCont.style.display = 'none'
    }
    setScreen()
}
document.getElementById('mobile-btn').onclick = () => {
    mobileState = !mobileState
    setMobileState()
}
reviveBtn.onclick = () => {
    socket.emit('revive')
}

const mapImg = new Image()
mapImg.src = './assets/tiles/plain_tiles.png'
const propsImg = new Image()
propsImg.src = './assets/tiles/prop_tiles.png'
const homeScreenImg = new Image()
homeScreenImg.src = './assets/home-screen.png'
const deadScreenImg = new Image()
deadScreenImg.src = './assets/dead-screen.png'
joinCont.style.display = 'none'
homeScreenImg.onload = () => {
    changeState('mainmenu')
}

function openFullscreen() {
    if (elem.requestFullscreen) {
    elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
    }
}

document.getElementById('maximize').addEventListener('click', () => openFullscreen())

function renderTiles(tiles, buffer, img){
    let posX = 0
    let posY = 0
    let imgTilesInRow = img.width / tileSize
    for(let col = 0; col < mapColTileCount; col++){
        posX = 0
        for(let row = 0; row < mapRowTileCount; row++){
            const id = tiles[col][row]
            if(id){
                const imgRow = parseInt(id / imgTilesInRow)
                const imgCol = id % imgTilesInRow

                buffer.drawImage(img,
                    imgCol * tileSize, imgRow * tileSize,
                    tileSize, tileSize, 
                    posX, posY,
                    tileSize, tileSize
                )
            }
            posX += tileSize
        }
        posY += tileSize
    }
}

function calculateProps(props, img){
    let imgTilesInRow = img.width / tileSize
    let arr = []
    for(let i = 0; i < props.length; i++){
        const prop = new Prop({
            ...props[i],
            imgTilesInRow,
            tileSize,
            img
        })
        prop.render()
        arr.push(prop)
    }
    return arr
}

const setStateVars = (state) => {
    if(state === 'loading'){
        joinCont.style.display = 'none'
        healthCont.style.display = 'none'
        reviveBtn.style.display = 'none'
    } else if(state === 'game'){
        joinCont.style.display = 'none'
        healthCont.style.display = 'block'
        reviveBtn.style.display = 'none'
    } else if(state === 'mainmenu'){
        joinCont.style.display = 'flex'
        healthCont.style.display = 'none'
        reviveBtn.style.display = 'none'
    } else if(state === 'dead'){
        joinCont.style.display = 'none'
        healthCont.style.display = 'none'
        reviveBtn.style.display = 'block'
    }
    setMobileState()
}

const changeState = (state) => {
    setStateVars(state)
    currentState = state
}

const renderStats = async() => {
    wolfStats.innerHTML = ""
    pigStats.innerHTML = ""
    
    const statsRes = await fetch('./stats')
    const stats = await statsRes.json()

    for(const player of stats){
        let name = player.name
        if(player.id === socket.id) name += ' (you)'
        const row = 
        `<tr>
            <td>
                ${name}
            </td>
            <td>
                ${player.kills}
            </td>
            <td>
                ${player.deaths}
            </td>
        </tr>`
        if(player.team === 'wolfs') wolfStats.innerHTML += row
        else pigStats.innerHTML += row
    }
}

let statsState = false
const changeStatsState = () => {
    renderStats()

    statsState = !statsState
    if(statsState) stats.style.display = 'block'
    else stats.style.display = 'none'
}

const setCanvasSize = (newSize) => {
    pushX = (ORIG_SIZE.width - newSize.width) / 2
    pushY = (ORIG_SIZE.height - newSize.height) / 2
    scale = newSize.width / ORIG_SIZE.width
    cam.minPos = {
        x: -(fullMapWidth - ORIG_SIZE.width) - pushX,
        y: -(fullMapHeight - ORIG_SIZE.height) - pushY
    }
    cam.maxPos = {x: -pushX, y: -pushY}
    root.style.setProperty('--canvas-width', `${newSize.width}px`)
    root.style.setProperty('--canvas-height', `${newSize.height}px`)
    canvas.width = newSize.width
    canvas.height = newSize.height
}

const minimize = (size) => {
    tools.style.display = 'flex'
    if(!mobileState) controlls.style.display = 'block'
    setCanvasSize(size)
}

const maximize = (size) => {
    tools.style.display = 'none'
    controlls.style.display = 'none'
    setCanvasSize(size)
}

const messageBox = () => {
    showMsgBox = !showMsgBox
    if(showMsgBox){
        msgElem.style.display = 'block'
        msgElem.focus()
    } else {
        msgElem.style.display = 'none'
    }
    msgBoxFocus = false
}

const sendMsg = () => {
    socket.emit('msg', msgElem.value)
    msgElem.value = ""
}

const setScreen = () => {
    if(fullscreen){
        if(mobileState) maximize({width: window.innerHeight * 1.5, height: window.innerHeight})
        else maximize(ORIG_SIZE)
    }
    else{
        if(mobileState) minimize(MOBILE_SMALL_SIZE)
        else minimize(SMALL_SIZE)
    }
    const canvasTop = window.pageYOffset + canvas.getBoundingClientRect().top
    root.style.setProperty('--canvas-top', `${canvasTop}px`)
}

document.addEventListener("fullscreenchange", () => {
    fullscreen = !fullscreen
    setScreen()
})

function clamp(value, min, max){
    return Math.max(min, Math.min(value, max))
}

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if(currentState === 'loading') loading(ctx)
    else if(currentState === 'game') game(ctx)
    else if(currentState === 'mainmenu') mainmenu(ctx)

    window.requestAnimationFrame(animate)
}


let foundMe = false
socket.on('update', ({wolfs: newWolfs, pigs: newPigs}, newBullets) => {
    if(currentState === 'game'){
        if(newWolfs) wolfs = newWolfs.map((w) => new Wolf({...w,...wolfStates}))
        if(newPigs) pigs = newPigs.map((p) => new Pig({...p,...pigStates, gunImg}))
        if(bullets) bullets = newBullets.map((b) => new Bullet(b))
        
        if(team === 'wolfs') me = wolfs.find((w) => w.id === socket.id)
        else me = pigs.find((p) => p.id === socket.id)
        
        if(me && !foundMe){
            setStateVars('game')
            foundMe = true
        } else if(!me){
            setStateVars('dead')
            foundMe = false
            me = [...pigs, ...wolfs][0]
        }

        if(foundMe) {
            const health = me ? `${me.health/me.maxHealth * 100}%` : '0px'
            healthBar.style.width = health
        }
    }
})

const mainmenu = (ctx) => {
    if(joinCont.style.display === 'none') joinCont.style.display = 'flex'
    ctx.drawImage(homeScreenImg, 0, 0, homeScreenImg.width, homeScreenImg.height, 0, 0, canvas.width, canvas.height)
}

const deadmenu = (ctx) => {
    ctx.globalAlpha = 0.8
    ctx.drawImage(deadScreenImg, 0, 0, deadScreenImg.width, deadScreenImg.height, 0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 1.0
}

const loading = (ctx) => {
    ctx.fillStyle = 'white'
    ctx.font = "30px Arial"
    ctx.fillText("Loading. . .", 10, 50)
}

const game = (ctx) => {
    ctx.save()
    ctx.scale(scale, scale)
    ctx.translate(pushX, pushY)
    const pos = me ? me.position : {x: 0, y: 0}
    cam.pos.x = clamp(canvas.width / 2 - pos.x, cam.minPos.x, cam.maxPos.x)
    cam.pos.y = clamp(canvas.height / 2 - pos.y, cam.minPos.y, cam.maxPos.y)
    ctx.translate(cam.pos.x, cam.pos.y)

    ctx.drawImage(buffers[0].canvas, 0, 0)

    const renderObjs = [...wolfs, ...pigs, ...props].sort((a, b) => a.bottom - b.bottom)

    for(const obj of renderObjs) obj.draw(ctx)
    for(const bullet of bullets) bullet.draw(ctx)

    ctx.drawImage(buffers[1].canvas, 0, 0)
    ctx.restore()
    if(!foundMe) deadmenu(ctx)
}

const join = async () => {
    await new Promise((resolve, reject) => {
        socket.on('joined', (myteam) => {
            team = myteam
            resolve()
        })
    })

    msgElem.addEventListener('keypress', (e) => {
        e.preventDefault()
        if(msgBoxFocus && e.key.length === 1) msgElem.value += e.key
        msgBoxFocus = true
    })
    msgElem.addEventListener('focusin', () => {msgBoxFocus = true})
    msgElem.addEventListener('focusout', () => {msgBoxFocus = false})

    window.addEventListener('keydown', (e) => {
        if(Object.keys(keys).includes(e.key) && !msgBoxFocus){
            keys[e.key].pressed = true
            if(e.key === 'a' || e.key === 'd') lastKey = e.key
            socket.emit('moveupdate', {keys, lastKey})
        }
        else if(e.key === '/') messageBox()
        else if(msgBoxFocus && e.key === 'Enter') sendMsg()
        else if(!msgBoxFocus && e.key === 'Tab'){
            e.preventDefault()
            changeStatsState()
        }
    })
    window.addEventListener('keyup', (e) => {
        if(Object.keys(keys).includes(e.key)){
            keys[e.key].pressed = false
            socket.emit('moveupdate', {keys, lastKey})
        }
    })
    canvas.addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const pos = team === 'wolfs' ? me.position : me.gun.position
        const angle = Math.atan2(
            mouseY - pos.y - cam.pos.y,
            mouseX - pos.x - cam.pos.x
        )
        socket.emit('attack', angle)
    })
    window.addEventListener('touchmove', (e) => {
        const touch = e.targetTouches[1]
        if(touch){
            const pos = team === 'wolfs' ? me.position : me.gun.position
            const angle = Math.atan2(
                touch.pageY - pos.y - cam.pos.y,
                touch.pageX - pos.x - cam.pos.x
            )
            socket.emit('attack', angle)
        }
    })

    changeState('game')
}

const connect = async () => {
    let {map, props: propsObj} = await new Promise((resolve, reject) => {
        socket.on('connected', ({map, props}) => {
            resolve({map, props})
        })
    })
    
    mapRowTileCount = map.width
    mapColTileCount = map.height
    tileSize = map.tileSize

    fullMapWidth = mapRowTileCount * tileSize
    fullMapHeight = mapColTileCount * tileSize

    for(let i = 0; i < buffers.length; i++){
        buffers[i].canvas.width = fullMapWidth
        buffers[i].canvas.height = fullMapHeight
    }

    renderTiles(map.layers[0], buffers[0], mapImg)
    renderTiles(map.layers[1], buffers[0], propsImg)
    // renderTiles(map.layers[2], buffers[0], propsImg)
    renderTiles(map.layers[3], buffers[0], mapImg)

    buffers[1].clearRect(0,0,fullMapWidth,fullMapHeight)
    renderTiles(map.layers[4], buffers[1], mapImg)
    
    const trees = calculateProps(propsObj.trees, propsImg)
    props.push(...trees)

    const towers = calculateProps(propsObj.towers, propsImg)
    props.push(...towers)
}

const main = async() => {
    changeState('loading')
    animate()
    await connect()
    await join()
}

main()