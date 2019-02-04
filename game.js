var canvas = document.getElementById('game-canvas');
var ctx = canvas.getContext('2d');
ctx.fillStyle = '#000000';

var blockSize = 10;
var Y_MAX = canvas.height-blockSize;
var startTime;
var currentY = Y_MAX;
var currentT = 0;
var GRAVITY_ACCELERATION = 1500;
var INITIAL_VELOCITY = 700;
var jumpInterval;
var paintInterval;
var hurdleInterval;
var X_OFFSET = 50;
var INTERVAL = 10; // In ms
var inFlight = false;
var cloud;
var bigCloudPosX = canvas.width;
var bigCloudHeight = 50;
var bigCloudWidth = 100;
var bigCloudOffsetY = 30;

var smallCloudPosX = bigCloudPosX + 300;
var smallCloudHeight = 30;
var smallCoudWidth = 50;
var smallCloudOffsetY = 50;

var hurdles = [];
var lastHurdleDate;
var HURDLE_GAP_SEC = 2;
var firstHurdlePosX = canvas.width;
var firstHurdleWidth;

function calculateYPos() {
    currentT = ((new Date()) - startTime) / 1000;
    return Y_MAX - ((INITIAL_VELOCITY * currentT)- ( 0.5 * GRAVITY_ACCELERATION * Math.pow(currentT, 2)));
}

function hasCollided(objectCoord, hurdleCoord) {
    var objectX1 = objectCoord.x;
    var objectX2 = objectCoord.x + objectCoord.width;
    var objectY1 = objectCoord.y;
    var objectY2 = objectCoord.y + objectCoord.height;

    var hurdleX1 = hurdleCoord.x;
    var hurdleX2 = hurdleCoord.x + hurdleCoord.width;
    var hurdleY1 = hurdleCoord.y;
    var hurdleY2 = hurdleCoord.y + hurdleCoord.height;

    return !(isNonOverlappingRange(objectX1, objectX2, hurdleX1, hurdleX2))
    && !(isNonOverlappingRange(objectY1, objectY2, hurdleY1, hurdleY2));
}

function isNonOverlappingRange(ax1, ax2, bx1, bx2) {
    return (ax2 < bx1) || (bx2 < ax1);
}

function collisionStop() {
    clearInterval(jumpInterval);
    clearInterval(paintInterval);
    ctx.font = '30px Comic Sans MS';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText('Game over!', canvas.width/2, canvas.height/2);
    ctx.fillStyle = 'black';
}

function paintPosition() {
    var calculatedY = calculateYPos();
    if (calculatedY != currentY) {
        currentY = calculatedY;
        if (currentY > Y_MAX) {
            currentY = Y_MAX;
            clearInterval(jumpInterval);
            inFlight = false;
            return;
        }
        clearCanvas();
        paintBackground();
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function calculateCloudPosition(currentPosX, cloudWidth) {
    currentPosX -= 1;
    if ((currentPosX + cloudWidth) < 0) {
        currentPosX = canvas.width;
    }
    return currentPosX;
}

function paintBackground() {
    
    // set green grass
    ctx.fillStyle = '#35B010'; 
    ctx.fillRect(0, 150, canvas.width, canvas.height-150);

    // set blue sky
    ctx.fillStyle = 'skyblue';
    ctx.fillRect(0, 0, canvas.width, 150);

    bigCloudPosX = calculateCloudPosition(bigCloudPosX, bigCloudWidth);
    smallCloudPosX = calculateCloudPosition(smallCloudPosX, bigCloudWidth);

    // larger cloud 
    ctx.drawImage(cloud, bigCloudPosX, bigCloudOffsetY, bigCloudWidth, bigCloudHeight);
    // smaller cloud
    ctx.drawImage(cloud,  smallCloudPosX, smallCloudOffsetY, smallCoudWidth, smallCloudHeight);
    
    

    ctx.fillStyle = '#000000';
    ctx.fillRect(X_OFFSET, currentY, blockSize, blockSize);
    paintHurdles();
    updateHurdles();
}

function jump() {
    if (!inFlight) {
        inFlight = true;
        startTime = new Date();
        jumpInterval = setInterval(paintPosition, INTERVAL);
    }
}

function paintHurdles() {
    var posX = firstHurdlePosX;
    for (var hurdle of hurdles) {
        var posY = canvas.height - hurdle.height;
        ctx.fillRect(posX, posY, hurdle.width, hurdle.height);
        if (hasCollided(
            {'x': X_OFFSET, 'y' : currentY, 'width' : blockSize, 'height' : blockSize}, 
            {'x' : posX, 'y' : posY, 'width' : hurdle.width, 'height' : hurdle.height})) {
                collisionStop();
        }
        posX += hurdle.width;
        posX += hurdle.offsetX;
    }
}

function removeFirstHurdle() {
    hurdles.shift();
}

function addNewHurdle() {
    hurdles.push({ 
        height  : 20 + parseInt(Math.random() * 80),
        offsetX : 200 + parseInt((Math.random() * 100)),
        width   : 20 + parseInt(Math.random() * 10)
    });
}

function updateHurdles() {
    firstHurdlePosX -= 2;
    if ((firstHurdlePosX + firstHurdleWidth) < 0) {
        firstHurdlePosX = hurdles[0].offsetX;
        removeFirstHurdle();
        addNewHurdle();
        firstHurdleWidth = hurdles[0].width;
    } 

    if (hurdles.length < 3) {
        addNewHurdle();
    }
}

function initCanvas() {
    cloud = new Image();
    cloud.src = 'images/cloud.svg';
    cloud.onload = () => {

        paintInterval = setInterval(function () {
            if (!inFlight) {
                clearCanvas();
                paintBackground();
            }
        }, INTERVAL);

        addNewHurdle();
        addNewHurdle();
        addNewHurdle();
        firstHurdleWidth = hurdles[0].width;
    };
    
}

document.onload = initCanvas();
