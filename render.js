let canvas = document.getElementById('myCanvas');
let mapCanvas = document.getElementById('mapCanvas');
let context = canvas.getContext('2d');
let mapContext = mapCanvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;
// console.log(`width ${width} height ${height}`);


let setPixel = (x,y, rgba8bitValues) => {
    let d = context.createImageData(1, 1);
    Object.assign(d.data, rgba8bitValues);
    context.putImageData(d, x,y);
}

let fillStyle = (rgba8bitValues) => {
    return `rgba(${rgba8bitValues[0]}, ${rgba8bitValues[1]}, ${rgba8bitValues[2]}, ${rgba8bitValues[3]})`;
}

let drawRect = (x,y, w,h, rgba8bitValues) => {
    context.fillStyle = fillStyle(rgba8bitValues);
    context.fillRect(x,y, w,h);
}

let clear = () => {
    drawRect(0, 0, width, height, [0, 0, 200, 255]);
}
let drawFacingLine = () => {
    pmx = (player.x+.5)*mapCanvas.width/mapWidth;
    pmy = (player.y+.5)*mapCanvas.height/mapHeight;
    mapContext.beginPath();
    mapContext.moveTo(pmx,pmy);
    mapContext.strokeStyle = fillStyle([0,0,255, 255]);
    mapContext.lineTo(pmx + player.facing.x*10, pmy + player.facing.y*10);
    mapContext.stroke();
}
let clearMap = () => {
    mapContext.fillStyle = fillStyle([0,255,0, 255]);
    mapContext.fillRect(0,0, mapCanvas.width,mapCanvas.height);
}
let drawMap = () => {
    clearMap();

    // ********** draw walls
    let wallHeight = mapCanvas.height / mapHeight;
    let wallWidth = mapCanvas.width / mapWidth;
    mapContext.fillStyle = fillStyle([255,0,0, 255]);
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            if (obstructed(map, x,y)) {
                mapContext.fillRect(x*wallWidth,y*wallHeight, wallWidth,wallHeight);
            }
        }
    }

    // ********* draw player
    mapContext.fillStyle = fillStyle([255,0,255, 255]);
    mapContext.fillRect((player.x+.5)*wallWidth-2, (player.y+.5)*wallHeight-2, 4,4);

    // *********** draw player vector
    drawFacingLine();
}

let map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
mapCanvas.height = map.length * 10;
mapCanvas.width = map[0].length * 10;
let mapWidth = map[0].length;
let mapHeight = map.length;
let player = {
    x: 5,
    y: 2,
    facing: new Victor(0,-1),
    speed: .001,
    turnSpeed: .001,
    shouldLog: false,
    fov: Math.PI/2,
}

let pressedKeys = {};
window.onkeyup = function(e) {
    // console.log(`let go ${e.key}`);
    pressedKeys[e.code] = false;
}
window.onkeydown = function(e) {
    // console.log(`pressed ${e.code}`);
    pressedKeys[e.code] = true;
}

let distance = (a, b) => {
    return Math.sqrt((b.x - a.x)**2 + (b.y - a.y)**2);
}

let frameCorrelator = Math.random();
function update(progress) {
    frameCorrelator = Math.random();

    // ******* get keyboard input
    let vel = new Victor();
    if (pressedKeys['KeyW']) vel.add(player.facing);
    if (pressedKeys['KeyS']) vel.subtract(player.facing);
    if (pressedKeys['KeyD']) player.facing = rotateBy(player.facing, progress * player.turnSpeed);
    if (pressedKeys['KeyA']) player.facing = rotateBy(player.facing,-progress * player.turnSpeed);
    if (pressedKeys['KeyU']) player.shouldLog = false;
    if (pressedKeys['KeyI']) player.shouldLog = true;
    // console.log(vel.length());
    if (vel.length() < .001) return;

    // ****** move player
    vel.normalize();
    vel.multiply(new Victor(progress*player.speed, progress*player.speed));
    let newPos = [player.x + vel.x, player.y + vel.y];
    // console.log(`newPos: ${newPos}`);
    let mx = Math.floor(newPos[0]);
    let my = Math.floor(newPos[1]);
    if (getMapValue(map, mx,my) === 0) {
        player.x = newPos[0];
        player.y = newPos[1];
    }
}

let getPreciseWallCollision = (openFrom, obstructedAt) => {
    let midPoint = new Victor((openFrom.x + obstructedAt.x)/2, (openFrom.y + obstructedAt.y)/2);
    if (distance(openFrom, obstructedAt) < .00001) return midPoint;

    if (obstructed(map, midPoint.x, midPoint.y)) {
        return getPreciseWallCollision(openFrom, midPoint);
    }
    return getPreciseWallCollision(midPoint, obstructedAt);
};
let getRayCollisionPoint = (sourcePoint, sourceRay) => {
    let point = sourcePoint.clone();
    let ray = sourceRay.clone();
    ray.normalize();
    ray.multiplyScalar(0.1);
    let lastPoint = point.clone();
    while(true) {
        if (obstructed(map, point.x,point.y)){
            return getPreciseWallCollision(lastPoint, point);
        }
        lastPoint = point.clone();
        point.add(ray);
    }
};
let slowLog = (msg) => {
    if (!player.shouldLog) return;
    if (frameCorrelator > .9) console.log(msg);
}
function draw() {
    slowLog(`********** draw`);
    clear();

    // *********** scan for walls
    const slices = width/10;
    function* nextRay(){
        let target = new Victor(player.x, player.y);
        let f = player.facing.clone();
        f.normalize();
        target.add(f);
        f = rotateBy(f, -Math.PI/2);
        target.add(f);
        f = rotateBy(f, -Math.PI);
        f.multiplyScalar(2/slices);
        for (let x = 0; x < slices; x++){
            let nextRay = new Victor(target.x-player.x, target.y-player.y);
            slowLog(`target ${target} nextRay ${nextRay}`);
            yield nextRay;
            target.add(f);
        }
    }
    nextRay = nextRay();
    let drawLoc = 0;
    let drawSliceSize = width/slices;
    let lastH = 0;
    let h = 0;
    for (let x = 0; x < slices; x++) {
        let wallPoint = findCollisionPoint(map, new Victor(player.x, player.y), nextRay.next().value);
        // slowLog(`collision point is ${wallPoint}`);
        let d = getPointDistanceFromCameraPlane(wallPoint, new Victor(player.x,player.y), player.facing);
        // slowLog(`d to plane is ${d}`);
        lastH = h;
        h = height/(2*d);
        h = round(h);
        h = h - (h % 4);
        // slowLog(`h became ${h}`);
        drawRect(drawLoc, height/2 - h/2, drawSliceSize, h, [255,0,0, 255]);
        drawLoc += drawSliceSize;
        // slowLog(`h delta is ${Math.abs(lastH - h)}`);
    }

    drawMap();
}

function loop(timestamp) {
    const progress = timestamp - lastRender

    update(progress)
    draw()

    lastRender = timestamp
    window.requestAnimationFrame(loop)

    let info = document.getElementById('info');
    info.innerHTML = `${round(progress,2)}<br/>${JSON.stringify(player)}`;
}
let lastRender = 0
window.requestAnimationFrame(loop)
