var canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d'),
  raf;

var DOG_WIDTH = 30,
  DOG_HEIGHT = 40,
  CLOUD_WIDTH = 80,
  CLOUD_HEIGHT = 48;

// Dog Object
var dog = {
  x: 240,
  y: 650,
  vx: 0,
  vy: 0,
  draw: function() {
    ctx.drawImage(images[0], this.x - DOG_WIDTH / 2,
      this.y - DOG_HEIGHT / 2, DOG_WIDTH, DOG_HEIGHT);
  }
};

// Cloud Object * 2
function Cloud(initY) {
  this.y = initY;
  this.vy = 0;
  this.scored = false;
}

Cloud.prototype.draw = function(skip) {
  for (var i = 0 ; i < 6 ; i ++) {
    if (i != skip) {
      ctx.drawImage(images[1], i * CLOUD_WIDTH, this.y);
    }
  }
}

var clouds = [new Cloud(0), new Cloud(400)];

// Click Event Handler
canvas.addEventListener('click', function(event) {
  var boundingRect = canvas.getBoundingClientRect(),
    mouseX = event.clientX - boundingRect.left,
    mouseY = event.clientY - boundingRect.top;

  if (mouseX < dog.x + DOG_WIDTH / 2) {
    dog.vx = -2;
  } else {
    dog.vx = 2;
  }
  dog.vy = -3;
}, false);

// Load images and draw the canvas
var imagesFiles = ['dog.png', 'rain-cloud.png'],
  images = [],
  imageRoot = 'images/',
  loadedCount = 0;
for (var i = 0, len = imagesFiles.length ; i < len ; i ++) {
  var img = new Image();
  img.src = imageRoot + imagesFiles[i];
  images.push(img);
  img.onload = function() {++ loadedCount};
}
var checkImageLoad = setInterval(function() {
  if (loadedCount == imagesFiles.length) {
    clearInterval(checkImageLoad);
    draw();
  }
}, 100);

function randomSkip() {
  return Math.floor(Math.random() * 4) + 1;
}

var skips = [randomSkip(), randomSkip()],
  score = 0,
  gameover = false,
  scoreElem = document.getElementById('score');

function checkCollisionOrScore(params) {
  var dogX = params.dog.x,
    dogY = params.dog.y,
    cloud = params.cloud,
    cloudY = cloud.y,
    skip = params.skip;

  if ((! cloud.scored) && dogX > CLOUD_WIDTH * skip &&
    dogX < CLOUD_WIDTH * (skip + 1) &&
    dogY < cloudY) {
    cloud.scored = true;
    scoreElem.innerHTML = (++ score);
  } else if ((((dogX > 0 && dogX < CLOUD_WIDTH * skip) ||
      (dogX > CLOUD_WIDTH * (skip + 1) && dogX < CLOUD_WIDTH * 8)) &&
      (dogY > cloudY && dogY < cloudY + CLOUD_HEIGHT)) ||
      dogY > 800) {
    gameover = true;
  }
}

function draw() {
  ctx.clearRect(0,0, canvas.width, canvas.height);

  if (gameover) {
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('gameOverScore').innerHTML = score;
    return;
  }

  // Dog Position
  dog.draw();
  dog.x += dog.vx;
  dog.y += dog.vy;
  // Dog Gravity
  dog.vy += 0.1;

  // Cloud Position
  for(var i = 0, len = clouds.length ; i < len ; i ++) {
    var cloud = clouds[i];

    checkCollisionOrScore({
      dog: dog,
      cloud: cloud,
      skip: skips[i]
    });

    cloud.draw(skips[i]);
    cloud.y += cloud.vy;

    if (dog.vy < 0) {
      cloud.vy = - dog.vy;
    } else {
      cloud.vy = 0;
    }

    if (cloud.y > 800) {
      cloud.y = 0;
      cloud.scored = false;
      skips[i] = randomSkip();
    }
  }

  raf = window.requestAnimationFrame(draw);
}
