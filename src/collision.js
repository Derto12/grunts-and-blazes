function clamp(value, min, max){
    return Math.max(min, Math.min(value, max))
}

function twoRectCollides(rect1, rect2){
    const rect1Right = rect1.position.x + rect1.width;
    const rect2Right = rect2.position.x + rect2.width;
    const rect1Bottom = rect1.position.y + rect1.height;
    const rect2Bottom = rect2.position.y + rect2.height;

    return rect1Bottom >= rect2.position.y &&
           rect1.position.y <= rect2Bottom &&
           rect1.position.x <= rect2Right &&
           rect1Right >= rect2.position.x;
}

function sphereAndRectCollides(phere, rect){
    const closestX = clamp(phere.position.x, rect.position.x, rect.position.x + rect.width);
    const closestY = clamp(phere.position.y, rect.position.y, rect.position.y + rect.height);

    const distanceX = phere.position.x - closestX;
    const distanceY = phere.position.y - closestY;

    const distanceSquared = distanceX ** 2 + distanceY ** 2;
    const radiusSquared = phere.radius ** 2;

    return distanceSquared < radiusSquared;
}

module.exports = {twoRectCollides, sphereAndRectCollides}
