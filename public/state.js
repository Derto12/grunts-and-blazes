import { setScreen } from "./ui.js"

let gameState
let isMobileScreen = false
let fullscreen = false

const zone = document.getElementById('zone-joystick')
const phoneCont = document.getElementById('phone-cont')
const healthCont = document.getElementById('health-cont')
const reviveBtn = document.getElementById('revive-btn')
const controlls = document.getElementById('controlls')
const joinCont = document.getElementById('join')
joinCont.style.display = 'none'

document.addEventListener("fullscreenchange", () => {
    fullscreen = !fullscreen
    setScreen()
})

function updateGameState(state){
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
    updateScreenState()
}

function changeGameState (state){
    gameState = state
    updateGameState(state)
}

function changeScreenState(){
    isMobileScreen = !isMobileScreen
    updateScreenState()
}

function updateScreenState (){
    if(isMobileScreen){
        if(gameState === 'game'){
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

export {updateGameState, changeGameState, changeScreenState, isMobileScreen, gameState, fullscreen}