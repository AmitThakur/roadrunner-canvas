var canvas = document.getElementById('game-canvas');
var ctx = canvas.getContext('2d');
ctx.fillStyle = '#000000';

var blockSize = 10;
var Y_MAX = canvas.height-blockSize;
var startTime;
var currentY = Y_MAX;
var currentT = 0;
var GRAVITY_ACCELERATION = 1500;
var INITIAL_VELOCITY = 600;
var paintInterval;
var X_OFFSET = 50;
var INTERVAL = 10; // In ms
var inFlight = false;

function calculateYPos() {
    currentT = ((new Date()) - startTime) / 1000;
    return Y_MAX - ((INITIAL_VELOCITY * currentT)- ( 0.5 * GRAVITY_ACCELERATION * Math.pow(currentT, 2)));
}

function paintPosition() {
    var calculatedY = calculateYPos();
    if (calculatedY != currentY) {
        currentY = calculatedY;
        if ((currentY - blockSize / 2) > Y_MAX) {
            clearInterval(paintInterval);
            inFlight = false;
            return;
        }
        clearCanvas();
        ctx.fillRect(X_OFFSET, currentY, blockSize, blockSize);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function jump() {
    if (!inFlight) {
        inFlight = true;
        startTime = new Date();
        paintInterval = setInterval(paintPosition, INTERVAL);
    }
}

function initCanvas() {
    ctx.fillRect(X_OFFSET, currentY, blockSize, blockSize);
}

document.onload = initCanvas();
