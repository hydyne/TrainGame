//train game, arrows left and right to move the train.

const canvas = document.getElementById('game_canvas');
const ctx = canvas.getContext('2d');
const time_step = 10; //ms between physics updates

var audio1 = new Audio('assets/rpm_idle.mp3');
var audio2 = new Audio('assets/rpm_idle.mp3');

var timer1, timer2; // Variables to hold the timers for each audio

// Function to start the audio loops
function startLoop() {
    // Start playing the first audio immediately and repeat every 4 seconds
    // audio1.play();
    timer1 = setInterval(() => {
        // audio1.currentTime = 0;
        // audio1.play();
    }, 4000);

    // Delay the start of the second audio by 2 seconds and then repeat every 4 seconds
    setTimeout(() => {
        audio2.play();
        timer2 = setInterval(() => {
            // audio2.currentTime = 0;
            // audio2.play();
        }, 4000);
    }, 1900);
}

startLoop(); // Start the audio loops

class Smoke {
  constructor(sizeX, sizeY, rows, columns, imgUrl) {
      this.sizeX = sizeX;
      this.sizeY = sizeY;
      this.resX = sizeX / columns;
      this.resY = sizeY / rows;
      this.rows = rows;
      this.columns = columns;
      this.img = new Image();  // Create a new Image object
      this.img.src = imgUrl;   // Set the source of the image to the provided URL
  }
  // draw() {  // Added 'ctx' as parameter to make it clear where 'ctx' is coming from
  //     if (this.img.complete) {  // Ensure the image is loaded before drawing
  //         ctx.drawImage(this.img, this.posX, this.posY, 128, 100);
  //     }
  // }
}

const smoke1 = new Smoke(128, 100, 5, 8, 'assets/smoke1.png')
const smoke2 = new Smoke(128, 100, 5, 8, 'assets/smoke2.png')

const mapBridge = {
    width: 1280,
    height: 720,
    drawings: [
      'assets/background_bridge_0.png',
      'assets/background_bridge_1.png', 
      'assets/background_bridge_2.png', 
      'assets/background_bridge_3.png'],
};

function drawBackground(map, ctx, x_start) {
  let totalWidth = map.width * map.drawings.length; // Total width of all images combined
  let x = x_start % totalWidth; // Adjust x_start to always be within the total width

  if (x > 0) {
      x -= totalWidth; // Adjust initial x to ensure no blank space if we're at the end of the loop
  }

  let index = 0;
  while (x < ctx.canvas.width) {
      const img = new Image();
      img.src = map.drawings[index % map.drawings.length]; // Loop back to the first image when end is reached
      ctx.drawImage(img, x, 0, map.width, map.height);
      x += map.width; // Move x to the right by the width of one image
      index++; // Move to the next image
  }
}
  
const key = {
    left: false,
    right: false,
    down: false
    };

class Train {
  constructor(imgUrl, spawnX, power, mass, posX, posY, speed, width, height, isSmoking, smokeX, smokeY, smoke ) {
    this.img = new Image();
    this.img.src = imgUrl;
    this.spawnX = spawnX;
    this.power = power;   //kW
    this.mass = mass;     //tonnes
    this.posX = posX;
    this.posY = posY;
    this.speed = speed;
    this.width = width;
    this.height = height;
    this.isSmoking = isSmoking;
    this.smokeX = smokeX;
    this.smokeY = smokeY;
    this.smokeSpeed = 0;
    this.state = 'idle';
    this.smokeframe = 0;
    this.smokerow = 0;
    this.frame = 0;
    this.smoke = smoke;
  }
  draw() {
    // ctx.drawImage(img_train, this.posX, this.posY, this.width, this.height);  
    ctx.drawImage(this.img , this.spawnX, this.posY, this.width, this.height);  
    this.frame += 1;
    if (this.isSmoking) {
        if (this.state === "idle" || this.state === 'brake') this.smokeSpeed = 10;
        else this.smokeSpeed = 1;
        if (this.frame % this.smokeSpeed === 0) {
            this.smokeframe++;
            if (this.smokeframe > this.smoke.columns - 1) {
                this.smokeframe = 0;
                this.smokerow++;
                if (this.smokerow > this.smoke.rows - 1) this.smokerow = 0;  // Resets row counter after the last row
            }
        }
        ctx.drawImage(this.smoke.img , this.smokeframe * 128 , this.smokerow * 128, 128, 128, this.smokeX, this.smokeY, 128, 128);
    }
    

    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Speed: ' + Math.round(this.speed/3.6) + 'km/h', 10, 50);
    ctx.fillText('Position: ' + Math.round(this.posX/10), 10, 100);
    ctx.fillText('Status: ' + this.state, 10, 150);
  }
  update() {
    this.frame += 1;
    
    if (key.left) {
      this.speed -= ((this.power*1000)/(this.mass*1000))*time_step/1000;
        // if (Math.abs(this.speed) < 10) this.speed -= ((this.power*1000)/(this.mass*1000))*time_step/1000;
        // else this.speed -= ((this.power*1000/Math.abs(this.speed))/(this.mass*1000))*time_step/1000;
        this.state = 'acceleration_left';
    }
    if (key.right) {
      this.speed += ((this.power*1000)/(this.mass*1000))*time_step/1000;
      // else this.speed = 0.00001
      this.state = 'acceleration_right';
    }
    if (key.down) {
        this.speed = this.speed*0.99;
        this.state = 'brake';
    }
    if (!key.left && !key.right && !key.down) {
        this.speed = this.speed*0.9995;
        this.state = 'idle';
    }
    this.posX += this.speed/40;
    }
  }

const ekspres = new Train(
    'assets/train.png',
    -1500,  // spawn x
    30000,  // power 8000
    400,    // mass
    0,      // pos x
    305,    // pos y
    0.0001,      // speed
    2600,   // width
    140,    // height
    true,   // is smoking
    765,    // smoke x
    290,    // smoke y
    smoke2  // smoke
);

const shinkansen = new Train(
    'assets/shinkansen.png',
    -20,    // spawn x
    80000,  // power 17000oryginal shinkansen
    720,    // mass
    0,      // pos x
    312,    // pos y
    0.0001,      // speed
    1000,   // width
    120,    // height
    false,  // is smoking
    765,    // smoke x
    290,    // smoke y
    smoke1  // smoke
);

const drivenTrain = ekspres;

// const fps = 1;
// const interval = 1000/fps;



// function animate() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//     drawBackground(mapBridge, ctx, -drivenTrain.posX);
    
//     drivenTrain.update();
//     drivenTrain.draw();
  
//   requestAnimationFrame(animate);
// }
// animate();

let lastUpdateTime = Date.now();

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(mapBridge, ctx, -drivenTrain.posX*1);

    // Check if 10 ms have passed since the last update
    if (Date.now() - lastUpdateTime >= 10) {
        drivenTrain.update();
        lastUpdateTime = Date.now();  // Update the last update time
    }

    drivenTrain.draw();

    requestAnimationFrame(animate); // Continue the animation loop
}

animate(); // Start the animation loop





document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
    key.left = true;
    console.log('left');
    } else if (event.key === 'ArrowRight') {
    key.right = true;
    } else if (event.key === 'ArrowDown') {
    key.down = true;
    }
  });

document.addEventListener('keyup', function(event) {
    if (event.key === 'ArrowLeft') {
    key.left = false;
    console.log('leftup');
    } else if (event.key === 'ArrowRight') {
    key.right = false;
    } else if (event.key === 'ArrowDown') {
    key.down = false;
    }
  });
