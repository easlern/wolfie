let waitForLoad = (image) => {
    while (!image.complete) sleep(100).then(() => {});
}

let brick = new Image(100,100);
brick.src = "images/brick.png";
waitForLoad(brick);
