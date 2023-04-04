import { myTeam, setMyTeam } from "./game.js"
import { socket } from "./socket.js"
import { changeScreenState} from "./state.js"
import { messageBox, openFullscreen } from "./ui.js"
import { changeStatsState } from "./stats.js"

const nameInput = document.getElementById('name-input')
document.getElementById('pig-btn').onclick = () => {
    setMyTeam('pigs')
    socket.emit('join', {name: nameInput.value, team: myTeam})
}
document.getElementById('wolf-btn').onclick = () => {
    setMyTeam('wolfs')
    socket.emit('join', {name: nameInput.value, team: myTeam})
}
document.getElementById('stats-btn').onclick = () => changeStatsState()
document.getElementById('msg-btn').onclick = () => messageBox()
document.getElementById('mobile-btn').onclick = () => changeScreenState()
document.getElementById('revive-btn').onclick = () => socket.emit('revive')
document.getElementById('maximize').onclick = () => openFullscreen()