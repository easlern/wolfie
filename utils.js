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
let distanceFromPointToLine = (p, a, b) => { // p is the point, a is one end of line segment, b is other end of line segment.
    return Math.abs((b.x-a.x)*(a.y-p.y) - (a.x-p.x)*(b.y-a.y)) / Math.sqrt((b.x-a.x)**2 + (b.y-a.y)**2);
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
let test_compare = (name, expect, get) => {
    if (expect.toString() !== get.toString()) {
        console.log(`Failed test ${name}`);
        console.log(`Expected ${expect}`);
        console.log(`Got ${get}`);
    }
    else {
        console.log(`Passed test ${name}`);
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
];
for(let t of tests) {
    t();
}
testVerbose = (msg) => { }