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
            return;
        }
        clearCanvas();
        ctx.fillRect(50, currentY, blockSize, blockSize);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function jump() {
    startTime = new Date();
    paintInterval = setInterval(paintPosition, 10);
}

function initCanvas() {
    ctx.fillRect(50, currentY, 10, 10);
}

document.onload = initCanvas();
