import { socket } from "./socket.js"
import { me, myTeam } from "./game.js"
import { cam, messageBox, msgBoxFocused, setMsgBoxFocus } from "./ui.js"
import { changeStatsState } from "./stats.js"

const msgElem = document.getElementById('msgBox')
let lastKey
const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
}

function sendMsg(){
    socket.emit('msg', msgElem.value)
    msgElem.value = ""
}
function addCharToMsgBox(e){
    e.preventDefault()
    if(msgBoxFocused && e.key.length === 1) msgElem.value += e.key
    setMsgBoxFocus(true)
}
function windowKeyDown(e){
    if(Object.keys(keys).includes(e.key) && !msgBoxFocused){
        keys[e.key].pressed = true
        if(e.key === 'a' || e.key === 'd') lastKey = e.key
        socket.emit('moveupdate', {keys, lastKey})
    }
    else if(e.key === '/') messageBox()
    else if(msgBoxFocused && e.key === 'Enter') sendMsg()
    else if(!msgBoxFocused && e.key === 'Tab'){
        e.preventDefault()
        changeStatsState()
    }
}
function windowKeyUp(e){
    if(Object.keys(keys).includes(e.key)){
        keys[e.key].pressed = false
        socket.emit('moveupdate', {keys, lastKey})
    }
}
function canvasClick(e){
    const rect = e.target.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const pos = myTeam === 'wolfs' ? me.position : me.gun.position
    const angle = Math.atan2(
        mouseY - pos.y - cam.pos.y,
        mouseX - pos.x - cam.pos.x
    )
    socket.emit('attack', angle)
}
function windowTouchMove(e){
    const touch = e.targetTouches[1]
    if(touch){
        const pos = team === 'wolfs' ? me.position : me.gun.position
        const angle = Math.atan2(
            touch.pageY - pos.y - cam.pos.y,
            touch.pageX - pos.x - cam.pos.x
        )
        socket.emit('attack', angle)
    }
}

function addGameEvents(){
    msgElem.addEventListener('keypress', (e) => addCharToMsgBox(e))
    msgElem.addEventListener('focusin', () => {setMsgBoxFocus(true)})
    msgElem.addEventListener('focusout', () => {setMsgBoxFocus(false)})

    canvas.addEventListener('click', (e) => canvasClick(e))

    window.addEventListener('keydown', (e) => windowKeyDown(e))
    window.addEventListener('keyup', (e) => windowKeyUp(e))
    // window.addEventListener('touchmove', (e) => windowTouchMove(e))
}

export {
    addGameEvents
}