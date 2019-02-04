var canvas = document.getElementById('game-canvas');
var ctx = canvas.getContext('2d');
ctx.fillStyle = '#000000';

var gameState = 'stopped';

const GameState = Object.freeze({
    STOPPED:   Symbol("stopped"),
    PAUSED:  Symbol("paused"),
    RUNNING: Symbol("running")
});
var gameScore = 0;
var highestScore = 0;
const highestScoreKey = 'ROADRUNNER_HIGHEST_SCORE';
var gameState = GameState.STOPPED;
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
    stopGame();
    paintGameOver();
}

function paintGameOver() {
    ctx.font = '30px Comic Sans MS';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText('Game over!', canvas.width/2, canvas.height/2);
    ctx.fillStyle = 'black';
}

function stopGame() {
    clearInterval(jumpInterval);
    clearInterval(paintInterval);
    gameState = GameState.STOPPED;
    processAndStoreGameScore();
}

function processAndStoreGameScore() {
    highestScore = highestScore > gameScore ? highestScore : gameScore;
    localStorage.setItem(highestScoreKey, highestScore + '');
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

function paintScores() {
    ctx.font = '10px Comic Sans MS';
    ctx.textAlign = 'right';
    ctx.fillText('Current Score: ' + gameScore, canvas.width-20, 20);
    ctx.fillText('Highest Score: ' + highestScore, canvas.width-20, 40);
    ctx.fillStyle = 'black';
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
    paintScores();
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
    gameScore += 100;
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

function initGame() {
    initData();
    gameState = GameState.RUNNING;
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
        gameScore = 0;
    };
    
}

document.onload = initGame();

document.body.onkeydown = function(e) {
    // If bar key is pressed
    if(e.keyCode == 32) {
        if (gameState == GameState.STOPPED) {
            initGame();
        }
        jump();
    }
}

function fetchHighestGameScore() {
    var highestScoreStr = localStorage.getItem(highestScoreKey);
    if (highestScoreStr) {
        return parseInt(highestScoreStr);
    }
    return 0;
}


function initData() {
    highestScore = fetchHighestGameScore();
    gameScore = 0;
    gameState = GameState.STOPPED;
    blockSize = 10;
    Y_MAX = canvas.height-blockSize;
    currentY = Y_MAX;
    currentT = 0;
    GRAVITY_ACCELERATION = 1500;
    INITIAL_VELOCITY = 700;
    X_OFFSET = 50;
    INTERVAL = 10; // In ms
    inFlight = false;
    bigCloudPosX = canvas.width;
    bigCloudHeight = 50;
    bigCloudWidth = 100;
    bigCloudOffsetY = 30;

    smallCloudPosX = bigCloudPosX + 300;
    smallCloudHeight = 30;
    smallCoudWidth = 50;
    smallCloudOffsetY = 50;

    hurdles = [];
    HURDLE_GAP_SEC = 2;
    firstHurdlePosX = canvas.width;
}
