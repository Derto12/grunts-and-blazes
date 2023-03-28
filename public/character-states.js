const pigIdleRightImg = new Image()
pigIdleRightImg.src = './assets/characters/pig-stand-right.png'
const pigIdleLeftImg = new Image()
pigIdleLeftImg.src = './assets/characters/pig-stand-left.png'
const pigRunRightImg = new Image()
pigRunRightImg.src = './assets/characters/pig-run-right.png'
const pigRunLeftImg = new Image()
pigRunLeftImg.src = './assets/characters/pig-run-left.png'
const wolfIdleRightImg = new Image()
const pigDieRightImg = new Image()
pigDieRightImg.src = './assets/characters/pig-die-right.png'
const pigDieLeftImg = new Image()
pigDieLeftImg.src = './assets/characters/pig-die-left.png'
const pigDeadRightImg = new Image()
pigDeadRightImg.src = './assets/characters/pig-dead-right.png'
const pigDeadLeftImg = new Image()
pigDeadLeftImg.src = './assets/characters/pig-dead-left.png'
const pigHitRightImg = new Image()
pigHitRightImg.src = './assets/characters/pig-hit-right.png'
const pigHitLeftImg = new Image()
pigHitLeftImg.src = './assets/characters/pig-hit-left.png'
wolfIdleRightImg.src = './assets/characters/wolf-stand-right.png'
const wolfRunRightImg = new Image()
wolfRunRightImg.src = './assets/characters/wolf-run-right.png'
const wolfIdleLeftImg = new Image()
wolfIdleLeftImg.src = './assets/characters/wolf-stand-left.png'
const wolfRunLeftImg = new Image()
wolfRunLeftImg.src = './assets/characters/wolf-run-left.png'
const wolfAttackLeftImg = new Image()
wolfAttackLeftImg.src = './assets/characters/wolf-attack-left.png'
const wolfAttackRightImg = new Image()
wolfAttackRightImg.src = './assets/characters/wolf-attack-right.png'
const scratchRightImg = new Image()
const wolfDieRightImg = new Image()
wolfDieRightImg.src = './assets/characters/wolf-die-right.png'
const wolfDieLeftImg = new Image()
wolfDieLeftImg.src = './assets/characters/wolf-die-left.png'
const wolfDeadRightImg = new Image()
wolfDeadRightImg.src = './assets/characters/wolf-dead-right.png'
const wolfDeadLeftImg = new Image()
wolfDeadLeftImg.src = './assets/characters/wolf-dead-left.png'
const wolfHitRightImg = new Image()
wolfHitRightImg.src = './assets/characters/wolf-hit-right.png'
const wolfHitLeftImg = new Image()
wolfHitLeftImg.src = './assets/characters/wolf-hit-left.png'
scratchRightImg.src = './assets/characters/scratch-right.png'
const scratchLeftImg = new Image()
scratchLeftImg.src = './assets/characters/scratch-left.png'
const gunImg = new Image()
gunImg.src = './assets/characters/rifle.png'

const wolfStates = {
    idleState: {
        imgs: {
            right: wolfIdleRightImg,
            left: wolfIdleLeftImg
        },
        frames: 1
    },
    runState: {
        imgs: {
            right: wolfRunRightImg,
            left: wolfRunLeftImg
        },
        frames: 6,
        frameHold: 3
    },
    attackState: {
        imgs: {
            right: wolfAttackRightImg,
            left: wolfAttackLeftImg,
        },
        scratch: {
            imgs: {
                right: scratchRightImg,
                left: scratchLeftImg,
            },
            frames: 4,
            frameHold: 4
        },
        frames: 3,
        frameHold: 5
    },
    dieState: {
        imgs: {
            right: wolfDieRightImg,
            left: wolfDieLeftImg
        },
        frames: 6,
        frameHold: 12
    },
    deathState: {
        imgs: {
            right: wolfDeadRightImg,
            left: wolfDeadLeftImg
        },
        frames: 1
    },
    hitState: {
        imgs: {
            right: wolfHitRightImg,
            left: wolfHitLeftImg
        },
        frames: 5,
        frameHold: 3
    }
}
const pigStates = {
    idleState: {
        imgs: {
            right: pigIdleRightImg,
            left: pigIdleLeftImg
        },
        frames: 1
    },
    runState: {
        imgs: {
            right: pigRunRightImg,
            left: pigRunLeftImg
        },
        frames: 6,
        frameHold: 3
    },
    dieState: {
        imgs: {
            right: pigDieRightImg,
            left: pigDieLeftImg
        },
        frames: 6,
        frameHold: 12
    },
    deathState: {
        imgs: {
            right: pigDeadRightImg,
            left: pigDeadLeftImg
        },
        frames: 1
    },
    hitState: {
        imgs: {
            right: pigHitRightImg,
            left: pigHitLeftImg
        },
        frames: 5,
        frameHold: 3
    }
}

export {wolfStates, pigStates}