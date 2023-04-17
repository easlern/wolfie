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
};

let fillStyle = (rgba8bitValues) => {
    return `rgba(${rgba8bitValues[0]}, ${rgba8bitValues[1]}, ${rgba8bitValues[2]}, ${rgba8bitValues[3]})`;
};

let drawRect = (x,y, w,h, rgba8bitValues) => {
    context.fillStyle = fillStyle(rgba8bitValues);
    context.fillRect(x,y, w,h);
};
let blitWholeRect = (image, dx,dy, dw,dh, alpha) => {
    return blitRect(image, 0,0, image.width,image.height, dx,dy, dw,dh, alpha);
}
let blitRect = (image, sx,sy, sw,sh, dx,dy, dw,dh, alpha) => {
    const oga = context.globalAlpha;
    context.globalAlpha = alpha;
    // slowLog(`blitting sx ${sx} sy ${sy} sw ${sw} sh ${sh} dx ${dx} dy ${dy} dw ${dw} dh ${dh} alpha ${alpha}`);
    context.drawImage(image, sx,sy, sw,sh, dx,dy, dw,dh);
    context.globalAlpha = oga;
};

let clear = () => {
    const top = [100,100,200, 255];
    drawRect(0, 0, width, height/2, top);
    const yStep = 5;
    let c = 0;
    for (let y = height/2; y < height; y += yStep) {
        drawRect(0, y, width, yStep, [c,c*.9,c*.5, 255]);
        c += 1;
    }
};
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
    mapContext.fillStyle = fillStyle([0,0,255, 255]);
    mapContext.fillRect((player.x-.25) * wallWidth, (player.y-.25) * wallHeight, wallWidth/2,wallHeight/2);

    // ********* draw facing
    let pmx = (player.x-.25)*mapCanvas.width/mapWidth + .25*wallWidth;
    let pmy = (player.y-.25)*mapCanvas.height/mapHeight + .25*wallHeight;
    mapContext.beginPath();
    mapContext.moveTo(pmx,pmy);
    mapContext.strokeStyle = fillStyle([0,0,255, 255]);
    mapContext.lineTo(pmx + player.facing.x*10, pmy + player.facing.y*10);
    mapContext.stroke();
}

let map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
mapCanvas.height = map.length * 10;
mapCanvas.width = map[0].length * 10;
let mapWidth = map[0].length;
let mapHeight = map.length;
let player = {
    x: 4.3,
    y: 2.4,
    facing: new Victor(.97,.26),
    speed: .001,
    turnSpeed: .001,
    shouldLog: false,
    fov: Math.PI/2,
};

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

let music = null;
let frameCorrelator = Math.random();
raven = Raven(7,2);
let characters = [];
characters.push(raven);
function update(delta) {
    frameCorrelator = Math.random();

    raven.update(delta);

    // ******* get keyboard input
    let vel = new Victor();
    if (pressedKeys['KeyW']) vel.add(player.facing);
    if (pressedKeys['KeyS']) vel.subtract(player.facing);
    if (pressedKeys['KeyD']) player.facing = rotateBy(player.facing, delta * player.turnSpeed);
    if (pressedKeys['KeyA']) player.facing = rotateBy(player.facing,-delta * player.turnSpeed);
    player.shouldLog = !!pressedKeys['KeyI'];
    if (vel.length() < .001) return;
    if (!music) {
        music = new Audio('music/curious.ogg');
        music.play();
    }

    // ****** move player
    vel.normalize();
    vel.multiply(new Victor(delta*player.speed, delta*player.speed));
    let newPos = [player.x + vel.x, player.y + vel.y];
    // console.log(`newPos: ${newPos}`);
    if (obstructed(map, newPos[0],newPos[1])) {
        if (!obstructed(map, newPos[0],player.y)) newPos[1] = player.y;
        else if (!obstructed(map, player.x,newPos[1])) newPos[0] = player.x;
    }
    if (!obstructed(map, newPos[0],newPos[1])) {
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
let getWallTexture = (x,y) => {
    let normal = getCollidedWallNormal(x,y);
    if (normal.x === 1) x -= 0.5;
    if (normal.y === 1) y -= 0.5;
    const mv = getMapValue(map, x,y);
    if (mv === 2) return whiteBrick;
    if (mv === 1) return brick;
}

let getXAssignment = (ray) => {
    return
};

let slices = 160; // 160 "slices" (pixels) horizontal (4 pixels wide on 640 wide display)
// slices = 2**6;
// slices = 4;
// slices = width;
let sliceWidth = width/slices;
function draw() {
    slowLog(`********** draw`);
    clear();

    // *********** scan for walls
    let dist = (thing) => {
        return (player.x - thing.x)**2 + (player.y - thing.y)**2;
    }
    function* rayGen(){
        let target = new Victor(player.x, player.y);
        let f = player.facing.clone();
        f.normalize();
        target.add(f);
        f = rotateBy(f, -Math.PI/2);
        target.add(f);
        f = rotateBy(f, -Math.PI);
        f.multiplyScalar(2/slices);
        for (let x = 0; x <= slices; x++){
            let next = new Victor(target.x-player.x, target.y-player.y);
            next.normalize();
            // slowLog(`target ${target} next ${next}`);
            yield next;
            target.add(f);
        }
    }

    // draw walls
    rayGen = rayGen();
    let sliceHeight = 0;
    let nextRay = rayGen.next().value;
    let nextWallPoint = findCollisionPoint(map, new Victor(player.x, player.y), nextRay);
    let thingsToDraw = [];
    for (let x = 0; x < width; x += sliceWidth) {
        let ray = nextRay;
        const wallPoint = nextWallPoint;
        nextRay = rayGen.next().value;
        if (nextRay) nextWallPoint = findCollisionPoint(map, new Victor(player.x, player.y), nextRay);
        let d = getPointDistanceFromCameraPlane(wallPoint, new Victor(player.x,player.y), player.facing);

        let tex = getWallTexture(wallPoint.x, wallPoint.y);
        if (!tex){
            console.log(`no tex for wallPoint ${wallPoint}`);
            continue;
        }

        // describe black background behind texture
        sliceHeight = height/(2*d);
        sliceHeight = round(sliceHeight);
        sliceHeight = sliceHeight - (sliceHeight % sliceWidth);
        let sliceY = height/2 - sliceHeight/2;

        // describe texture for the square
        let sx = Math.floor((getTextureX(wallPoint) * tex.width) % tex.width);
        let sy = 0;
        let sw = 1;
        let sh = tex.height;
        let dx = x;
        let dy = sliceY;
        let dw = sliceWidth;
        let dh = sliceHeight;
        let bright = 1/distance(new Victor(player.x,player.y), wallPoint);

        thingsToDraw.push({
            type: 'wall',
            x: wallPoint.x,
            y: wallPoint.y,
            image: tex,
            sx: sx,
            sy: sy,
            sw: sw,
            sh: sh,
            dx: dx,
            dy: dy,
            dw: dw,
            dh: dh,
            alpha: bright,
        });
    }

    // draw characters
    for (let c of characters) {
        let dot = player.facing.dot(new Victor(c.x - player.x, c.y - player.y));
        slowLog(`dot to char ${dot}`);
        if (dot < 0) continue;
        let d = dist(c);

        let dh = height/(2*d);
        let dy = height/2;

        for (let k = 0; k < c.images.length; k++) {
            let i = c.images[k];
            let a = c.alphas[k];
            let dw = i.width * (dh/i.height);
            thingsToDraw.push({
                type: 'character',
                x: c.x,
                y: c.y,
                image: i,
                dx: width/2 - dw/2,
                dy: dy,
                dw: dw,
                dh: dh,
                alpha: a,
            });
        }
    }

    thingsToDraw.sort((a,b) => {
        if (dist(a) === dist(b)) return 0;
        if (dist(a) > dist(b)) return -1;
        return 1;
    });
    for (let x = 0; x < thingsToDraw.length; x++) {
        let t = thingsToDraw[x];
        if (t.type === `wall`) {
            drawRect(t.dx,t.dy, t.dw,t.dh, [0, 0, 0, 255]);
            blitRect(t.image, t.sx, t.sy, t.sw, t.sh, t.dx, t.dy, t.dw, t.dh, t.alpha);
        }
        if (t.type === `character`) {
            blitWholeRect(t.image, t.dx,t.dy, t.dw,t.dh, t.alpha);
        }
    }

    // draw fog
    for (let x = 0; x < width; x++) {

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
let lastRender = 0;
window.requestAnimationFrame(loop);
