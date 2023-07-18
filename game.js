const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const bg = new Audio;
bg.src = 'bg.mp3';
const button = document.getElementById('button');
button.addEventListener('click', function(){
  canvas.style.display = 'block';
  button.style.display = 'none';
  bg.play()
})
let harding = 1000;
// Set canvas size to match the window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const sprite = {
  image: new Image(),
  frameWidth: 383, // Width of each frame in the sprite
  frameHeight: 464, // Height of each frame in the sprite
  frameCount: 4, // Number of frames in the sprite
  currentFrame: 0, // Current frame index
  animationSpeed: 0.2, // Animation speed (adjust as needed)
  frameTimer: 0, // Timer for frame animation
  x: canvas.width / 2,
  y: canvas.height - 100, // Start the player at the bottom of the canvas
  size: 80, // Adjust the size to your desired value
  targetX: canvas.width / 2,
  targetY: canvas.height - 100,
  speed: 5,
  isLoaded: false // Flag to track if the sprite image is fully loaded
};

const bullets = []; // Array to store player bullets
const enemies = []; // Array to store enemy objects
let boss = null; // The boss enemy
let score = 0;
let health = 100;
let isGameOver = false; // Flag to track game over state
let level = 1; // Current level
let levelScoreThreshold = 10; // Score threshold to reach next level
const levelColors = {
  1: '#ff0000', // Level 1 color (red)
  2: '#00ff00', // Level 2 color (green)
  3: '#0000ff' // Level 3 color (blue)
};

// Health Bar
const healthBar = {
  width: canvas.width - 20,
  height: 20,
  x: 10,
  y: 10
};

// Score Text
const scoreText = {
  x: 10,
  y: canvas.height - 10,
  color: 'green', // Set text color to black
  font: '24px Arial'
};

sprite.image.src = 'sprite.png';

// Preload the sprite image before starting the animation loop
sprite.image.onload = () => {
  sprite.isLoaded = true;
  gameLoop();
};

function updatePlayerPosition(touchX, touchY) {
  sprite.targetX = touchX;
  sprite.targetY = touchY;
}

function createEnemy() {
  const enemySize = 50; // Adjust the enemy size as desired
  const minX = enemySize / 2;
  const maxX = canvas.width - enemySize / 2;

  const enemy = {
    x: Math.random() * (maxX - minX) + minX,
    y: -100, // Start above the top of the canvas
    size: enemySize,
    speed: Math.random() * (2 + level / 5) + 1 // Random speed based on the level
  };

  enemies.push(enemy);
}

function createBoss() {
  boss = {
    x: canvas.width / 2,
    y: -200, // Start above the top of the canvas
    size: 150, // Adjust the boss size as desired
    speed: 1 // Boss speed
  };
}

function updateBullets() {
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];
    bullet.y -= 10; // Move the bullet upwards

    // Remove the bullet from the array if it goes above the canvas
    if (bullet.y < 0) {
      bullets.splice(i, 1);
      i--;
    }
  }
}

function updateEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    enemy.y += enemy.speed; // Move the enemy downward

    // Check collision between bullets and enemies
    for (let j = 0; j < bullets.length; j++) {
      const bullet = bullets[j];
      const dx = enemy.x - bullet.x;
      const dy = enemy.y - bullet.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < enemy.size / 2 + bullet.size / 2) {
        // Collision occurred, destroy the enemy and remove the bullet
        enemies.splice(i, 1);
        i--;

        bullets.splice(j, 1);
        j--;

        // Increase the score
        score += 10;

        // Shake effect
        canvas.classList.add('shake');

        // Vibrate the device if supported
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
        if(score <= 500){
          enemy.speed += 200;
        }

        // Remove the shake effect after a delay
        setTimeout(() => {
          canvas.classList.remove('shake');
        }, 200);
      }
    }

    // Remove the enemy from the array if it goes below the canvas
    if (enemy.y > canvas.height) {
      enemies.splice(i, 1);
      i--;
      health -= 10;
    }
  }
}

function detectCollision() {
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];

    // Check collision between player and enemy
    const dx = enemy.x - sprite.x;
    const dy = enemy.y - sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < enemy.size / 2 + sprite.size / 2) {
      // Collision occurred, reduce player health
      health -= 10;

      // Remove the enemy from the array
      enemies.splice(i, 1);
      i--;

      // Decrease the score
      score -= 5;

      // End the game if health reaches 0
      if (health <= 0) {
        isGameOver = true;
        health = 0;
        bg.pause();
      }
    }
  }
}

function update() {
  // Update frame animation timer
  sprite.frameTimer += sprite.animationSpeed;

  // Update current frame when timer exceeds frame duration
  if (sprite.frameTimer >= 1) {
    sprite.frameTimer = 0;
    sprite.currentFrame++;

    // Reset frame to start if it exceeds the frame count
    if (sprite.currentFrame >= sprite.frameCount) {
      sprite.currentFrame = 0;
    }
    
  }

  // Update player position with smoothing
  const dx = sprite.targetX - sprite.x;
  const dy = sprite.targetY - sprite.y;
  sprite.x += dx * 0.2;
  sprite.y += dy * 0.2;

  // Keep player within canvas bounds
  sprite.x = Math.max(Math.min(sprite.x, canvas.width - sprite.size / 2), sprite.size / 2);
  sprite.y = Math.max(Math.min(sprite.y, canvas.height - sprite.size / 2), sprite.size / 2);

if (score >= levelScoreThreshold) {
  level++;
  levelScoreThreshold += 40;

  // Increase enemy difficulty based on the level
  const enemySpeedMultiplier = 2 + (level / 10); // Adjust the multiplier as desired

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    enemy.speed *= enemySpeedMultiplier;
  }
}
  updateBullets();
  updateEnemies();
  detectCollision();
}

function render() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Render player sprite
  if (sprite.isLoaded) {
    const sourceX = Math.floor(sprite.currentFrame) * sprite.frameWidth;
    const sourceY = 0; // As all frames are in a single row

    ctx.drawImage(
      sprite.image,
      sourceX,
      sourceY,
      sprite.frameWidth,
      sprite.frameHeight,
      sprite.x - sprite.size / 2,
      sprite.y - sprite.size / 2,
      sprite.size,
      sprite.size
    );
  }

  // Render bullets
  for (let i = 0; i < bullets.length; i++) {
    const bullet = bullets[i];

    ctx.fillStyle = '#ffff00'; // Set bullet color
    ctx.fillRect(bullet.x - bullet.size / 2, bullet.y - bullet.size / 2, bullet.size, bullet.size);
  }

  // Render enemies
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];

    ctx.fillStyle = '#333'; // Set enemy color
    ctx.fillRect(enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
  }

  // Render boss
  if (boss) {
    ctx.fillStyle = '#ff0000'; // Set boss color
    ctx.fillRect(boss.x - boss.size / 2, boss.y - boss.size / 2, boss.size, boss.size);
  }
let colorOfHealth = 'green';
    if(health <= 40){
      colorOfHealth = 'yellow';
    }
    if (health <= 20){
      colorOfHealth = 'red';
    }
    if(level >= 500){
      window.open('https://instagram.com/byteninja_studios');
    }
  // Render health bar
  const healthBarWidth = (health / 100) * healthBar.width;
  ctx.fillStyle = colorOfHealth; // Set health bar color
  ctx.fillRect(healthBar.x, healthBar.y, healthBarWidth, healthBar.height);

  // Render score text
  ctx.fillStyle = scoreText.color;
  ctx.font = scoreText.font;
  ctx.fillText(`Score: ${score}`, scoreText.x, scoreText.y);
  
  //levels
  ctx.fillStyle = 'green'; // Set text color to black
  ctx.font = '24px Arial';
  ctx.fillText(`Level: ${level}`, 10, canvas.height - 50);

  // Render game over text if the game is over
  if (isGameOver) {
    ctx.fillStyle = '#ff0000'; // Set text color
    ctx.font = '48px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2);
  }
}

function gameLoop() {
  if (!isGameOver) {
    update();
    render();
    requestAnimationFrame(gameLoop);
  }
}

// Touch event handler
function handleTouch(event) {
  const touchX = event.touches[0].clientX;
  const touchY = event.touches[0].clientY;
  updatePlayerPosition(touchX, touchY);
}

// Add touch event listeners
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
canvas.addEventListener('touchend', () => {
  // Stop player movement when touch ends
  sprite.targetX = sprite.x;
  sprite.targetY = sprite.y;
});

// Add touch event listener for shooting
canvas.addEventListener('touchstart', () => {
  if (!isGameOver) {
    const bullet = {
      x: sprite.x,
      y: sprite.y - sprite.size / 2,
      size: 10 // Adjust the bullet size as desired
    };

    bullets.push(bullet);
  }
})
// Generate enemies at regular intervals
setInterval(createEnemy, 400); // Adjust the interval as desired

// Generate boss at a certain score
const BOSS_SCORE_THRESHOLD = 100;
let bossGenerated = false;
setInterval(() => {
  if (score >= BOSS_SCORE_THRESHOLD && !bossGenerated) {
    createBoss();
    bossGenerated = true;
  }
}, 300); // Adjust the interval as desired

// Load sprite image before starting the game loop
sprite.image.onload = () => {
  sprite.isLoaded = true;
  gameLoop();
};
