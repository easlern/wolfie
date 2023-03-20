function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let NoImageTransition = (image) => {
    return {
        images: [image],
        alphas: [1],
        done: true,
        update: (delta) => { }
    }
}
let LinearImageTransition = (fromImage, toImage, time=1000) => {
    return {
        images: [fromImage, toImage],
        time: time,
        timePassed: 0,
        alphas: [1, 0],
        done: false,
        update: function(delta) {
            this.timePassed += delta;
            this.timePassed = Math.min(this.timePassed, this.time);
            this.done = this.timePassed >= this.time;
            this.alphas[1] = this.timePassed/this.time;
            this.alphas[0] = 1 - this.alphas[1];
            if (this.timePassed >= this.time) this.done = true;
        },
    };
};
let rotateBy = (vector, amount) => {
    let x2 = vector.x * Math.cos(amount) - vector.y * Math.sin(amount);
    let y2 = vector.x * Math.sin(amount) + vector.y * Math.cos(amount);
    return new Victor(x2,y2).normalize();
};
function round(num, places=0) {
    return Math.round(num * 10**places) / 10**places;
}
let getFirstDecimal = (num) => {
    num -= Math.floor(num);
    return Math.floor(num*10);
}
let getMapValue = (map, x,y) => {
    x = Math.floor(x);
    y = Math.floor(y);
    if (y < 0 || y >= map.length || x < 0 || x >= map[0].length){
        // testVerbose(`went off map at ${x} ${y}`);
        return 1;
    }
    // testVerbose(`got map value ${map[y][x]} at ${x} ${y}`);
    return map[y][x];
};
let obstructed = (map, x,y) => {
    return getMapValue(map, x,y) !== 0;
};

let testInfo = (msg) => {
    console.log(msg);
};
let testVerbose = (msg) => {
    console.log(msg);
};

let findCollisionPoint = (map, cameraPoint, cameraFacing) => {
    let point = cameraPoint.clone();
    let ray = cameraFacing.clone();

    let isEdge = (x,y) => {
        if (obstructed(map, x,y)) return true;
        if (Math.floor(x) === x && obstructed(map, x-.5,y)) return true;
        if (Math.floor(y) === y && obstructed(map, x,y-.5)) return true;
    };

    for (let z = 0; z < 10000; z++) {
        if (isEdge(point.x, point.y)) {
            // testVerbose(`obstructed at ${point}`);
            return point;
        }
        let xd = 1 - (point.x % 1);
        // testVerbose(`point ${point} point x%1 ${point.x%1}`);
        if (ray.x < 0 && xd !== 1) xd = 1 - xd;
        let yd = 1 - (point.y % 1);
        if (ray.y < 0 && yd !== 1) yd = 1 - yd;
        let xl = xd/ray.x;
        let yl = yd/ray.y;
        let m = Math.abs(xl);
        if (Math.abs(yl) < Math.abs(xl)) m = Math.abs(yl);
        // testVerbose(`point start ${point}`);
        point.x += ray.x * m;
        point.y += ray.y * m;
        // testVerbose(`point ${point} ray ${ray} xd ${xd} yd ${yd} xl ${xl} yl ${yl} m ${m}`);
    }
}
let distanceFromPointToLine = (p, a,b) => { // p is the point, a is one end of line segment, b is other end of line segment.
    return Math.abs((b.x-a.x)*(a.y-p.y) - (b.y-a.y)*(a.x-p.x)) / Math.sqrt((b.x-a.x)**2 + (b.y-a.y)**2);
};
let getPointDistanceFromCameraPlane = (point, camPoint, camFacing) => {
    let a = camPoint.clone();
    let r = camFacing.clone();
    r = rotateBy(r, Math.PI/2);
    let b = a.clone();
    b.add(r);
    return distanceFromPointToLine(point, a,b);
};
let getCollidedWallNormal = (x,y) => {
    slowLog(`getting normal for ${x} ${y}`);
    let eq = (x,y) => {
        return Math.abs(x - y) < 0.00000001;
    }
    if (eq(Math.round(x), x)){
        if (obstructed(map, x-.5,y)) return new Victor(1,0);
        return new Victor(-1,0);
    }
    if (eq(Math.round(y), y)){
        if (obstructed(map, x,y-.5)) return new Victor(0,1);
        return new Victor(0,-1);
    }
    throw (`can't get collided wall normal for ${x} ${y}`);
}
let getTextureX = (wcp) => {
    let normal = getCollidedWallNormal(wcp.x, wcp.y);
    if (normal.x === 1) return 1 - wcp.y%1;
    if (normal.x === -1) return wcp.y%1;
    if (normal.y === 1) return wcp.x%1;
    if (normal.y === -1) return 1 - wcp.x%1;
    throw (`can't get texture x for ${wcp}`);
}

let test_findCollisionPoint_findsFirstEdgeStraightOn = () => {
    let map = [
        [0,1],
    ];
    let cam = new Victor(0.5,0.5);
    let cp = findCollisionPoint(map, cam, new Victor(1,0));
    test_compare('100', new Victor(1,0.5), cp);
};
let test_findCollisionPoint_findsFirstEdgeStraightOnLeft = () => {
    let map = [
        [1,0],
    ];
    let cam = new Victor(1.5,0.5);
    let cp = findCollisionPoint(map, cam, new Victor(-1,0));
    test_compare('150', new Victor(1,0.5), cp);
};
let test_findCollisionPoint_findsDistantEdgeStraightOn = () => {
    let map = [
        [0,0,0,0,0,0,1],
    ];
    let cam = new Victor(0.5,0.5);
    let cp = findCollisionPoint(map, cam, new Victor(1,0));
    test_compare('200', new Victor(6,0.5), cp);
};
let test_findCollisionPoint_findsDistantEdgeStraightOnLeft = () => {
    let map = [
        [1,0,0,0,0,0,0],
    ];
    let cam = new Victor(6.5,0.5);
    let cp = findCollisionPoint(map, cam, new Victor(-1,0));
    test_compare('250', new Victor(1,0.5), cp);
};
let test_findCollisionPoint_findsEdgeOneUp = () => {
    let map = [
        [0,0,1],
        [0,0,0]
    ];
    let cam = new Victor(0.5,1.5);
    let cp = findCollisionPoint(map, cam, new Victor(1,-0.5));
    test_compare('300', new Victor(2,0.75), cp);
};
let test_findCollisionPoint_findsEdgeOneDown = () => {
    let map = [
        [0,0,0],
        [0,0,1]
    ];
    let cam = new Victor(0.5,0.5);
    let cp = findCollisionPoint(map, cam, new Victor(1,0.5));
    test_compare('400', new Victor(2,1.25), cp);
};
let test_findCollisionPoint_findsImmediateDiagonalEdge = () => {
    let map = [
        [0,1],
        [0,0]
    ];
    let cam = new Victor(0.5,1.5);
    let cp = findCollisionPoint(map, cam, new Victor(1,-1));
    test_compare('500', new Victor(1,1), cp);
};
let test_findCollisionPoint_findsUpperLeftDiagonalEdge = () => {
    let map = [
        [0,0,1],
        [0,0,0]
    ];
    let cam = new Victor(1,1);
    let cp = findCollisionPoint(map, cam, new Victor(1,-1));
    test_compare('600', new Victor(2,0), cp);
};
let test_distanceFromPointToLine_pointOnRightOfVerticalLine = () => {
    let p = new Victor(10,0);
    let l1 = new Victor(0,-10);
    let l2 = new Victor(0,10);
    test_compare('1000', 10, distanceFromPointToLine(p, l1,l2));
};
let test_distanceFromPointToLine_pointOnRightOfVerticalLine_normalOutsideSegmentEnds = () => {
    let p = new Victor(10,0);
    let l1 = new Victor(0,10);
    let l2 = new Victor(0,20);
    test_compare('1100', 10, distanceFromPointToLine(p, l1,l2));
};
let test_distanceFromPointToLine_pointOnRightOfVerticalLine_normalOutsideSegmentEnds_offsetLine = () => {
    let p = new Victor(10,-10);
    let l1 = new Victor(1,-1);
    let l2 = new Victor(1,1);
    test_compare('1150', 9, distanceFromPointToLine(p, l1,l2));
}
let test_distanceFromPointToLine_pointUpperRightOfDecline_offsetLine = () => {
    let p = new Victor(10,-10);
    let l1 = new Victor(1,0);
    let l2 = new Victor(2,1);
    test_compare('1175', Math.sqrt(9**2+9**2), distanceFromPointToLine(p, l1,l2));
}
let test_getPointDistanceFromCameraPlane_pointRightOfVerticalPlane = () => {
    let p = new Victor(10,0);
    let cp = new Victor(0,0);
    let fv = new Victor(10,0);
    test_compare(`1200`, 10, getPointDistanceFromCameraPlane(p, cp,fv));
};
let test_getPointDistanceFromCameraPlane_pointUpperRightOfVerticalPlane = () => {
    let p = new Victor(10,-10);
    let cp = new Victor(0,0);
    let fv = new Victor(10,0);
    test_compare(`1300`, 10, getPointDistanceFromCameraPlane(p, cp,fv));
};
let test_getPointDistanceFromCameraPlane_pointUpperLeftOfVerticalPlane = () => {
    let p = new Victor(-10,-10);
    let cp = new Victor(0,0);
    let fv = new Victor(-10,0);
    test_compare(`1400`, 10, getPointDistanceFromCameraPlane(p, cp,fv));
};
let test_getPointDistanceFromCameraPlane_pointUpperLeftOfHorizontalPlane = () => {
    let p = new Victor(-10,-10);
    let cp = new Victor(0,0);
    let fv = new Victor(0,-10);
    test_compare(`1500`, 10, getPointDistanceFromCameraPlane(p, cp,fv));
};
let test_getPointDistanceFromCameraPlane_pointUpperRightOfDecline = () => {
    let p = new Victor(10,-10);
    let cp = new Victor(0,0);
    let fv = new Victor(1,-1);
    test_compare(`1600`, Math.sqrt(200), getPointDistanceFromCameraPlane(p, cp,fv));
};
let test_getPointDistanceFromCameraPlane_pointUpperRightOfDecline_offsetCamera = () => {
    let p = new Victor(10,-10);
    let cp = new Victor(1,-1);
    let fv = new Victor(1,-1);
    test_compare(`1700`, Math.sqrt(9**2+9**2), getPointDistanceFromCameraPlane(p, cp,fv));
};
let test_rotateBy_rotatesClockwise = () => {
    let r = new Victor(0,-1);
    r = rotateBy(r, Math.PI/2);
    test_compare(`2000`, new Victor(1,0), r);
};
let test_compare = (name, expect, get) => {
    const fudge = .00001;
    let pass = () => {
        console.log(`Passed test ${name}`);
    }
    if (typeof(expect) === typeof(new Victor()) && typeof(get) === typeof(new Victor())) {
        if (expect.x - get.x < fudge && expect.y - get.y < fudge){
            return pass();
        }
    }
    if (expect.toString() === get.toString()){
        return pass();
    }
    else if (Number.isFinite(expect) && Number.isFinite(get)) {
        if (round(expect, 3) === round(get, 3)){
            return pass();
        }
    }
    else {
        console.log(`Failed test ${name}`);
        console.log(`Expected ${expect}`);
        console.log(`Got ${get}`);
    }
};

tests = [
    test_findCollisionPoint_findsFirstEdgeStraightOn,
    test_findCollisionPoint_findsFirstEdgeStraightOnLeft,
    test_findCollisionPoint_findsDistantEdgeStraightOn,
    test_findCollisionPoint_findsDistantEdgeStraightOnLeft,
    test_findCollisionPoint_findsEdgeOneUp,
    test_findCollisionPoint_findsEdgeOneDown,
    test_findCollisionPoint_findsImmediateDiagonalEdge,
    test_findCollisionPoint_findsUpperLeftDiagonalEdge,
    test_distanceFromPointToLine_pointOnRightOfVerticalLine,
    test_distanceFromPointToLine_pointOnRightOfVerticalLine_normalOutsideSegmentEnds,
    test_distanceFromPointToLine_pointOnRightOfVerticalLine_normalOutsideSegmentEnds_offsetLine,
    test_distanceFromPointToLine_pointUpperRightOfDecline_offsetLine,
    test_getPointDistanceFromCameraPlane_pointRightOfVerticalPlane,
    test_getPointDistanceFromCameraPlane_pointUpperRightOfVerticalPlane,
    test_getPointDistanceFromCameraPlane_pointUpperLeftOfVerticalPlane,
    test_getPointDistanceFromCameraPlane_pointUpperLeftOfHorizontalPlane,
    test_getPointDistanceFromCameraPlane_pointUpperRightOfDecline,
    test_getPointDistanceFromCameraPlane_pointUpperRightOfDecline_offsetCamera,
    test_rotateBy_rotatesClockwise,
];
for(let t of tests) {
    t();
}
testVerbose = (msg) => { }



let a = new Victor(0,-1);
let b = new Victor(0,-1);
for (let x = 0; x < 8; x++) {
    console.log(`${a} dot ${b} = ${a.dot(b)}`);
    // console.log(`${a} cross ${b} = ${a.cross(b)}`);
    b = rotateBy(b, Math.PI/4);
}