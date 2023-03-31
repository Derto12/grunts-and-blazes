import { isMobileScreen, fullscreen } from "./state.js"
import { msgBoxFocused } from "./events.js"
import { map } from "./game.js"

const elem = document.documentElement
const root = document.querySelector(':root')
const ORIG_SIZE = {width: 1080, height: 720}
const SMALL_SIZE = {width: 720, height: 480}
const MOBILE_SMALL_SIZE = {width: 420, height: 280}
let scale = SMALL_SIZE.width / ORIG_SIZE.width

function openFullscreen() {
    if (elem.requestFullscreen) {
    elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
    }
}

let pushX, pushY
export const cam = {
    pos: { x: 0, y: 0},
    minPos: { x: 0, y: 0},
    maxPos: { x: 0, y: 0} 
}
const setCanvasSize = (newSize) => {
    pushX = (ORIG_SIZE.width - newSize.width) / 2
    pushY = (ORIG_SIZE.height - newSize.height) / 2
    scale = newSize.width / ORIG_SIZE.width
    cam.minPos = {
        x: -(map.width - ORIG_SIZE.width) - pushX,
        y: -(map.height - ORIG_SIZE.height) - pushY
    }
    cam.maxPos = {x: -pushX, y: -pushY}
    root.style.setProperty('--canvas-width', `${newSize.width}px`)
    root.style.setProperty('--canvas-height', `${newSize.height}px`)
    canvas.width = newSize.width
    canvas.height = newSize.height
}

const tools = document.getElementById('tools')
const minimize = (size) => {
    tools.style.display = 'flex'
    if(!isMobileScreen) controlls.style.display = 'block'
    setCanvasSize(size)
}

const maximize = (size) => {
    tools.style.display = 'none'
    controlls.style.display = 'none'
    setCanvasSize(size)
}

let showMsgBox = false
const messageBox = () => {
    showMsgBox = !showMsgBox
    if(showMsgBox){
        msgElem.style.display = 'block'
        msgElem.focus()
    } else {
        msgElem.style.display = 'none'
    }
    msgBoxFocused = false
}

function setScreen(){
    if(fullscreen){
        if(isMobileScreen) maximize({width: window.innerHeight * 1.5, height: window.innerHeight})
        else maximize(ORIG_SIZE)
    }
    else{
        if(isMobileScreen) minimize(MOBILE_SMALL_SIZE)
        else minimize(SMALL_SIZE)
    }
    const canvasTop = window.pageYOffset + canvas.getBoundingClientRect().top
    root.style.setProperty('--canvas-top', `${canvasTop}px`)
}

export {
    openFullscreen,
     messageBox,
     minimize,
     maximize,
     setScreen,
     scale,
     SMALL_SIZE,
     ORIG_SIZE,
     pushX,
     pushY,
}