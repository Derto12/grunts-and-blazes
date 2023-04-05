const treeCollisionConfig = {
    name: 'tree collisions',
    startTileId: 19,
    relPos: { x: 24, y: 72 },
    bottomOffset: { x: 9, y: 9 },
    collisionOffset: { x: 9, y: -62 },
    propWidth: 72,
    propHeight: 96,
    collisionWidth: 18,
    collisionHeight: 72,
};

const towerCollision1Config = {
    name: 'tower collisions1',
    startTileId: 2,
    relPos: { x: 0, y: 72 },
    bottomOffset: { x: 9, y: 12 },
    collisionOffset: { x: 14, y: -59 },
    propWidth: 48,
    propHeight: 96,
    collisionWidth: 20,
    collisionHeight: 74,
};
  
const towerCollision2Config = {
    name: 'tower collisions2',
    startTileId: 4,
    relPos: { x: 0, y: 72 },
    bottomOffset: { x: 9, y: 12 },
    collisionOffset: { x: 14, y: -59 },
    propWidth: 48,
    propHeight: 96,
    collisionWidth: 20,
    collisionHeight: 74,
};
  
module.exports = {
    treeCollisionConfig,
    towerCollision1Config,
    towerCollision2Config,
};
  