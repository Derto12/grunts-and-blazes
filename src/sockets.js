const { Server } = require("socket.io");
const actions = require('./actions')

const TICK = 1000/60

const handleSockets = async(server) => {
    const io = new Server(server);
    const loadMap = require('./load-map')
    const {map, blocks, props} = await loadMap()

    actions.setParams(blocks, props)

    io.on('connection', (socket) => {
        socket.emit('connected', {map, props})
        console.log('client connected')

        socket.on('disconnect', () => actions.disconnect(socket.id));
        socket.on('join', (params) => {
            const team = actions.join(socket.id, params)
            socket.emit('joined', team)
        })
        socket.on('moveupdate', (params) => {
            actions.move(socket.id, params)
        })
        socket.on('attack', (params) => actions.attack(socket.id, params))
        socket.on('msg', (params) => actions.message(socket.id, params))
        socket.on('revive', () => actions.revive(socket.id))
    })

    // let i = 0
    // let lastUpdate = new Date().getTime()
    // function fps(){
    //     const now = new Date().getTime()
    //     if(i % 100 === 0) console.log('fps', 1000/(now - lastUpdate))
    //     lastUpdate = now
    //     i++
    // }

    setInterval(() => {
        const {players, bullets} = actions.update()
        io.emit('update', players, bullets)
        // fps()
    }, TICK)
}

module.exports = handleSockets