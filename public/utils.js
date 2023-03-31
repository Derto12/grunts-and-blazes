import { Prop } from "./sprite.js"

function renderTiles(tiles, buffer, img, map){
    let posX = 0
    let posY = 0
    let imgTilesInRow = img.width / map.tileSize
    for(let col = 0; col < map.colTileCount; col++){
        posX = 0
        for(let row = 0; row < map.rowTileCount; row++){
            const id = tiles[col][row]
            if(id){
                const imgRow = parseInt(id / imgTilesInRow)
                const imgCol = id % imgTilesInRow

                buffer.drawImage(img,
                    imgCol * map.tileSize, imgRow * map.tileSize,
                    map.tileSize, map.tileSize, 
                    posX, posY,
                    map.tileSize, map.tileSize
                )
            }
            posX += map.tileSize
        }
        posY += map.tileSize
    }
}

function calculateProps(props, img, tileSize){
    let imgTilesInRow = img.width / tileSize
    let arr = []
    for(let i = 0; i < props.length; i++){
        const prop = new Prop({
            ...props[i],
            imgTilesInRow,
            tileSize: tileSize,
            img
        })
        prop.render()
        arr.push(prop)
    }
    return arr
}

export {renderTiles, calculateProps}