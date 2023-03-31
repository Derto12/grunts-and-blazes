const fs = require('fs')
const express = require('express')
const app = express()

const http = require('http');
const server = http.createServer(app);

const {getStats} = require('./actions');
const helmet = require('helmet');
const path = require('path');

const scriptSources = ["'self'",'https://cdn.socket.io','https://cdnjs.cloudflare.com']    
const helmetOptions = {
    crossOriginEmbedderPolicy: true,
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "script-src": scriptSources
        }
    },
}

async function main(){
    app.use(helmet(helmetOptions))

    const handleSockets = require('./sockets')
    await handleSockets(server)

    app.use(express.static('public'))

    let sprite = fs.readFileSync(path.normalize(__dirname + '/sprite.js'), 'utf-8');
    sprite = sprite.split('~')[0].replace(/\/\//g, '');

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
            await server.listen(port, () => console.log(`server is listening on http://127.0.0.1:${port}`))
        } catch(error){
            console.error('Error starting server:', error);
            process.exit(1); // Restart server if it fails to start
        }
    }

    start()
}

main()