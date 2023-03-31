import { pushX, pushY, cam, scale } from "./ui.js"
import { changeGameState } from "./state.js"

const homeScreenImg = new Image()
homeScreenImg.src = './assets/home-screen.png'
homeScreenImg.onload = () => {
    changeGameState('mainmenu')
}
const joinCont = document.getElementById('join')
const deadScreenImg = new Image()
deadScreenImg.src = './assets/dead-screen.png'
const canvas = document.querySelector('#canvas')

let map = {
    tileSize: undefined,
    rowTileCount: undefined,
    colTileCount: undefined,
    width: undefined,
    height: undefined,
}

let me
function setMe(newMe){
    me = newMe
}

let myTeam
function setMyTeam(newTeam){
    myTeam = newTeam
}

function clamp(value, min, max){
    return Math.max(min, Math.min(value, max))
}

function mainmenu(ctx){
    if(joinCont.style.display === 'none') joinCont.style.display = 'flex'
    ctx.drawImage(homeScreenImg, 0, 0, homeScreenImg.width, homeScreenImg.height, 0, 0, canvas.width, canvas.height)
}

function deadmenu(ctx){
    ctx.globalAlpha = 0.8
    ctx.drawImage(deadScreenImg, 0, 0, deadScreenImg.width, deadScreenImg.height, 0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 1.0
}

function loading(ctx){
    ctx.fillStyle = 'white'
    ctx.font = "30px Arial"
    ctx.fillText("Loading. . .", 10, 50)
}

function game(ctx, buffers, {wolfs, pigs, props, bullets}){
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
}

export {
    mainmenu,
    deadmenu,
    loading,
    game,
    me, setMe,
    myTeam, setMyTeam,
    map
}