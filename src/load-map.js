const tmx = require('tmx-parser')
const blocks = require('./collisions')

const getMap = async() => {
    const getLayer = (tiles, width, height) => {
        let arr = []
        for(let i = 0; i < height; i++){
            let row = []
            for(let j = 0; j < width; j++){
                let tile = tiles[i * width + j]
                if(tile) row.push(tile.id)
                else row.push(null)
            }
            arr.push(row)
        }
        return arr
    }

    const getPropCollisions = ({tiles, width, height, tileSize, startTileId, relPos, bottomOffset, propWidth, propHeight, collisionWidth, collisionHeight, collisionOffset}) => {
        let props = []
        let posX = 0
        let posY = 0
        for(let i = 0; i < height; i++){
            posX = 0
            for(let j = 0; j < width; j++){
                let tile = tiles[i * width + j]
                if(tile){
                    props.push({
                        id: startTileId,
                        relPos,
                        position: {
                            x: posX,
                            y: posY,
                        },
                        bottomOffset,
                        bottom: posY + bottomOffset.y,
                        width: propWidth,
                        height: propHeight,
                        collisionWidth,
                        collisionHeight,
                        collisionOffset
                    })
                }
                posX += tileSize
            }
            posY += tileSize
        }
        return props
    }

    const {map, props} = await new Promise(function(resolve, reject){
        tmx.parseFile('./src/assets/map.tmx', function(err, map){
            if(err) reject(err)

            const width = map.width
            const height = map.height

            const treeTiles = map.layers.find((l) => l.name === 'tree collisions').tiles
            let trees = getPropCollisions({
                tiles: treeTiles,
                width, height,
                tileSize: map.tileWidth,
                startTileId: 19,
                relPos: {x: 24, y: 72},
                bottomOffset: {x: 9, y: 9},
                collisionOffset: {x: 9, y: -62},
                propWidth: 72,
                propHeight: 96,
                collisionWidth: 18,
                collisionHeight: 72
            })

            const towerTiles1 = map.layers.find((l) => l.name === 'tower collisions1').tiles
            const towerParams = {
                tiles: towerTiles1,
                width, height,
                tileSize: map.tileWidth,
                startTileId: 2,
                relPos: {x: 0, y: 72},
                bottomOffset: {x: 9, y: 12},
                collisionOffset: {x: 14, y: -59},
                propWidth: 48,
                propHeight: 96,
                collisionWidth: 20,
                collisionHeight: 74
            }
            let towers = getPropCollisions(towerParams)

            const towerTiles2 = map.layers.find((l) => l.name === 'tower collisions2').tiles
            let towers2 = getPropCollisions({
                ...towerParams,
                tiles: towerTiles2,
                startTileId: 4
            })

            towers.push(...towers2)

            let layers = []
            map.layers = map.layers.filter(l => l.visible)
            for(let i = 0; i < map.layers.length; i++){
                layers.push(getLayer(map.layers[i].tiles, width, height))
            }
    
            resolve({
                map: {
                    width, height,
                    tileSize: map.tileWidth, 
                    layers
                },
                props: {
                    trees,
                    towers
                }
            })
        })
    })

    return {map, blocks, props}
}

module.exports = getMap