const fs = require('fs')
const express = require('express')
const app = express()

const http = require('http');
const server = http.createServer(app);

const {getStats} = require('./actions')

async function main(){
    const handleSockets = require('./sockets')
    await handleSockets(server)

    app.use(express.static('public'))

    let sprite = fs.readFileSync(__dirname + '/sprite.js', 'utf-8')
    sprite = sprite.split('~')[0].replace('//', '')

    app.get('/sprite.js', (req, res) => {
        res.status(200).type('application/javascript').send(sprite)
    })

    app.get('/stats', (req, res) => {
        const stats = getStats();
        res.status(200).json(stats);
    })

    const port = process.env.PORT || 3000
    const start = async() => {
        try{
            server.listen(port, () => console.log(`server is listening on http://127.0.0.1:${port}`))
        } catch(error){
            console.log(error)
        }
    }

    start()
}

main()