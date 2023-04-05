const tmx = require('tmx-parser');
const {promisify} = require('util')
const {treeCollisionConfig, towerCollision1Config, towerCollision2Config} = require('./props.config');
const blocks = require('./blocks.config');
const parseFilePromise = promisify(tmx.parseFile)

const getMap = async () => {
  const getLayer = (tiles, width, height) => {
    return Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        const tile = tiles[y * width + x];
        return tile ? tile.id : null;
      })
    );
  };

  const getPropCollisions = (params) => {
    const {
      tiles,
      width,
      height,
      tileSize,
      startTileId,
      relPos,
      bottomOffset,
      propWidth,
      propHeight,
      collisionWidth,
      collisionHeight,
      collisionOffset,
    } = params;

    const props = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = tiles[y * width + x];
        if (tile) {
          props.push({
            id: startTileId,
            relPos,
            position: {
              x: x * tileSize,
              y: y * tileSize,
            },
            bottomOffset,
            bottom: (y + 1) * tileSize + bottomOffset.y,
            width: propWidth,
            height: propHeight,
            collisionWidth,
            collisionHeight,
            collisionOffset,
          });
        }
      }
    }
    return props;
  };

  try {
    const map = await parseFilePromise('./src/assets/map.tmx');
    const getTilesByName = (name) => map.layers.find((l) => l.name === name).tiles

    const width = map.width;
    const height = map.height;
    const mapConfig = {
      width, height, tileSize: map.tileWidth
    }

    const treeTiles = getTilesByName(treeCollisionConfig.name)
    const trees = getPropCollisions({
      ...mapConfig,
      ...treeCollisionConfig,
      tiles: treeTiles,
    });

    const towerTiles1 = getTilesByName(towerCollision1Config.name)
    const towers1Params = {
      ...mapConfig,
      ...towerCollision1Config,
      tiles: towerTiles1,
    };

    const towerTiles2 = getTilesByName(towerCollision2Config.name)
    const towers2Params = {
      ...mapConfig,
      ...towerCollision2Config,
      tiles: towerTiles2,
    };

    const towers = [
      ...getPropCollisions(towers1Params),
      ...getPropCollisions(towers2Params),
    ];

    const layers = map.layers
      .filter((l) => l.visible)
      .map((l) => getLayer(l.tiles, width, height));

    return {
      map: { ...mapConfig, layers },
      props: { trees, towers },
      blocks,
    };
  } catch (error) {
    console.error(error);
  }
};

module.exports = getMap ;