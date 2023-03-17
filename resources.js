let waitForLoad = (image) => {
    console.log(`loading ${image.src}. . .`);
    while (!image.complete) sleep(100).then(() => {});
    console.log(`loaded ${image.src}`);
}

let brick = new Image(100,100);
brick.src = "images/brick.png";
waitForLoad(brick);
