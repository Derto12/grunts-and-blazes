import { socket } from "./socket.js"

const zone = document.getElementById('zone-joystick')
const zoneRect = zone.getBoundingClientRect()
const bodyRect = document.body.getBoundingClientRect()
const options = {
    restJoystick: true,
    zone,
    position: {
        x: zoneRect.left + zoneRect.width / 2,
        y: zoneRect.top - bodyRect.top + zoneRect.height / 2
    },
    mode: 'static'
}
var joystick = nipplejs.create(options)
joystick.on('move', function (evt, data) {
    socket.emit('moveupdate', {vector: data.vector})
})
joystick.on('end', function (evt) {
    socket.emit('moveupdate', {vector: {x: 0, y: 0}})
})