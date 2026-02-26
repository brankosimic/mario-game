const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const gameOverScreen = document.getElementById('game-over');
const winScreen = document.getElementById('win-screen');
const bgm = document.getElementById('bgm');
const muteBtn = document.getElementById('muteBtn');
bgm.volume = 0.3;

let score = 0;
let lives = 3;
let gameRunning = true;
let playerSize = 1;

// Player properties
const player = {
    x: 100,
    y: 480,
    width: 30,
    height: 40,
    color: '#FF0000',
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: -15,
    gravity: 0.8,
    grounded: false
};

// Camera/Scrolling
let cameraX = 0;
const mapWidth = 2000;

// Platform properties
const platforms = [
    // Ground - extended
    { x: 0, y: 570, width: mapWidth, height: 30, color: '#8B4513' },
    // Platforms
    { x: 200, y: 450, width: 120, height: 20, color: '#CD853F' },
    { x: 400, y: 350, width: 120, height: 20, color: '#CD853F' },
    { x: 600, y: 250, width: 120, height: 20, color: '#CD853F' },
    { x: 100, y: 300, width: 100, height: 20, color: '#CD853F' },
    { x: 500, y: 150, width: 100, height: 20, color: '#CD853F' },
    { x: 800, y: 400, width: 150, height: 20, color: '#CD853F' },
    { x: 1000, y: 320, width: 120, height: 20, color: '#CD853F' },
    { x: 1200, y: 420, width: 120, height: 20, color: '#CD853F' },
    { x: 1400, y: 350, width: 120, height: 20, color: '#CD853F' },
    { x: 1600, y: 280, width: 120, height: 20, color: '#CD853F' },
    { x: 1800, y: 200, width: 120, height: 20, color: '#CD853F' }
];

// Coins
let coins = [
    { x: 240, y: 410, width: 20, height: 20, collected: false },
    { x: 440, y: 310, width: 20, height: 20, collected: false },
    { x: 640, y: 210, width: 20, height: 20, collected: false },
    { x: 140, y: 260, width: 20, height: 20, collected: false },
    { x: 540, y: 110, width: 20, height: 20, collected: false },
    { x: 860, y: 360, width: 20, height: 20, collected: false },
    { x: 1040, y: 280, width: 20, height: 20, collected: false },
    { x: 1240, y: 380, width: 20, height: 20, collected: false },
    { x: 1440, y: 310, width: 20, height: 20, collected: false },
    { x: 1640, y: 240, width: 20, height: 20, collected: false },
    { x: 1840, y: 160, width: 20, height: 20, collected: false }
];

// Enemies
let enemies = [
    { x: 300, y: 530, width: 30, height: 30, color: '#8B0000', velocityX: 1.5, patrolStart: 250, patrolEnd: 500 },
    { x: 600, y: 530, width: 30, height: 30, color: '#8B0000', velocityX: -1.5, patrolStart: 550, patrolEnd: 700 },
    { x: 450, y: 310, width: 30, height: 30, color: '#8B0000', velocityX: 1.5, patrolStart: 420, patrolEnd: 500 },
    { x: 900, y: 530, width: 30, height: 30, color: '#8B0000', velocityX: -1.5, patrolStart: 850, patrolEnd: 1000 },
    { x: 1300, y: 530, width: 30, height: 30, color: '#8B0000', velocityX: 1.5, patrolStart: 1250, patrolEnd: 1400 },
    { x: 1700, y: 530, width: 30, height: 30, color: '#8B0000', velocityX: -1.5, patrolStart: 1650, patrolEnd: 1800 }
];

// Flag (goal)
const flag = {
    x: 1900,
    y: 200,
    width: 10,
    height: 350,
    color: '#00FF00',
    flagColor: '#FF0000'
};

// Mushrooms
let mushrooms = [
    { x: 350, y: 410, width: 25, height: 25, collected: false },
    { x: 750, y: 210, width: 25, height: 25, collected: false },
    { x: 1150, y: 360, width: 25, height: 25, collected: false },
    { x: 1550, y: 180, width: 25, height: 25, collected: false }
];

// Input handling
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
    }
    if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.code === 'ArrowRight') keys.ArrowRight = true;
    if (e.code === 'Space') {
        keys.Space = true;
        if (!gameRunning) {
            resetGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.code === 'ArrowRight') keys.ArrowRight = false;
    if (e.code === 'Space') keys.Space = false;
});

// Mobile controls
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');

if (leftBtn) {
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.ArrowLeft = true;
    });
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.ArrowLeft = false;
    });
}

if (rightBtn) {
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.ArrowRight = true;
    });
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.ArrowRight = false;
    });
}

if (jumpBtn) {
    jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys.Space = true;
        if (!gameRunning) {
            resetGame();
        }
    });
    jumpBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys.Space = false;
    });
}

function updatePlayer() {
    // Horizontal movement
    if (keys.ArrowLeft) {
        player.velocityX = -player.speed;
    } else if (keys.ArrowRight) {
        player.velocityX = player.speed;
    } else {
        player.velocityX = 0;
    }

    // Jump
    if (keys.Space && player.grounded) {
        player.velocityY = player.jumpPower;
        player.grounded = false;
    }

    // Apply gravity
    player.velocityY += player.gravity;

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Screen boundaries with scrolling
    if (player.x < 0) player.x = 0;
    if (player.x > mapWidth - player.width) player.x = mapWidth - player.width;
    
    // Camera follows player
    if (player.x < cameraX + 200) {
        cameraX = player.x - 200;
    }
    if (player.x > cameraX + canvas.width - 200) {
        cameraX = player.x - (canvas.width - 200);
    }
    if (cameraX < 0) cameraX = 0;
    if (cameraX > mapWidth - canvas.width) cameraX = mapWidth - canvas.width;

    // Check platform collision
    player.grounded = false;
    for (const platform of platforms) {
            if (player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y + player.height > platform.y &&
                player.y + player.height < platform.y + 20) {
            
            if (player.velocityY >= 0) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
            }
        }
    }

    // Check coin collection
    for (const coin of coins) {
        if (!coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            coin.collected = true;
            score += 100;
            scoreEl.textContent = `Score: ${score}`;
        }
    }

    // Check mushroom collection
    for (const mushroom of mushrooms) {
        if (!mushroom.collected &&
            player.x < mushroom.x + mushroom.width &&
            player.x + player.width > mushroom.x &&
            player.y < mushroom.y + mushroom.height &&
            player.y + player.height > mushroom.y) {
            mushroom.collected = true;
            const oldHeight = player.height;
            player.width = 45;
            player.height = 60;
            player.y += (player.height - oldHeight);
            playerSize = 1.5;
            score += 200;
            scoreEl.textContent = `Score: ${score}`;
        }
    }

    // Check enemy collision
    for (const enemy of enemies) {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            handlePlayerDeath();
        }
    }

    // Check flag (win condition)
    if (player.x < flag.x + flag.width &&
        player.x + player.width > flag.x &&
        player.y < flag.y + flag.height &&
        player.y + player.height > flag.y) {
        handleWin();
    }

    // Check fall death
    if (player.y > canvas.height) {
        handlePlayerDeath();
    }
}

function updateEnemies() {
    for (const enemy of enemies) {
        enemy.x += enemy.velocityX;
        if (enemy.x <= enemy.patrolStart || enemy.x + enemy.width >= enemy.patrolEnd) {
            enemy.velocityX *= -1;
        }
    }
}

function handlePlayerDeath() {
    lives--;
    livesEl.textContent = `Lives: ${lives}`;
    if (lives <= 0) {
        gameRunning = false;
        gameOverScreen.classList.remove('hidden');
    } else {
        resetPlayerPosition();
    }
}

function handleWin() {
    gameRunning = false;
    winScreen.classList.remove('hidden');
}

function resetPlayerPosition() {
    player.x = 100;
    player.y = 480;
    player.velocityX = 0;
    player.velocityY = 0;
    playerSize = 1;
    player.width = 30;
    player.height = 40;
}

function resetGame() {
    score = 0;
    lives = 3;
    playerSize = 1;
    scoreEl.textContent = `Score: ${score}`;
    livesEl.textContent = `Lives: ${lives}`;
    gameOverScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    gameRunning = true;
    
    resetPlayerPosition();
    
    coins.forEach(coin => coin.collected = false);
    mushrooms.forEach(mushroom => mushroom.collected = false);
}

function drawPlayer() {
    const screenX = player.x - cameraX;
    const scaledWidth = player.width * playerSize;
    const scaledHeight = player.height * playerSize;
    
    // Body
    ctx.fillStyle = player.color;
    ctx.fillRect(screenX, player.y, scaledWidth, scaledHeight);
    
    // Hat
    ctx.fillStyle = '#B22222';
    ctx.fillRect(screenX - 5, player.y - 5, scaledWidth + 10, 10);
    
    // Face
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(screenX + 5, player.y + 5, 20 * playerSize, 15 * playerSize);
    
    // Eyes
    ctx.fillStyle = 'black';
    ctx.fillRect(screenX + 8, player.y + 8, 4 * playerSize, 4 * playerSize);
    ctx.fillRect(screenX + 18 * playerSize, player.y + 8, 4 * playerSize, 4 * playerSize);
}

function drawPlatforms() {
    for (const platform of platforms) {
        const screenX = platform.x - cameraX;
        ctx.fillStyle = platform.color;
        ctx.fillRect(screenX, platform.y, platform.width, platform.height);
        
        // Grass on top
        ctx.fillStyle = '#228B22';
        ctx.fillRect(screenX, platform.y, platform.width, 5);
    }
}

function drawCoins() {
    for (const coin of coins) {
        if (!coin.collected) {
            const screenX = coin.x - cameraX;
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(screenX + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#DAA520';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

function drawMushrooms() {
    for (const mushroom of mushrooms) {
        if (!mushroom.collected) {
            const screenX = mushroom.x - cameraX;
            // Stem
            ctx.fillStyle = '#FFB6C1';
            ctx.fillRect(screenX + 8, mushroom.y + 12, 9, 13);
            // Cap
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(screenX + 12, mushroom.y + 12, 12, Math.PI, 0);
            ctx.fill();
            // Spots
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(screenX + 8, mushroom.y + 8, 3, 0, Math.PI * 2);
            ctx.arc(screenX + 16, mushroom.y + 6, 3, 0, Math.PI * 2);
            ctx.arc(screenX + 20, mushroom.y + 10, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawEnemies() {
    for (const enemy of enemies) {
        const screenX = enemy.x - cameraX;
        ctx.fillStyle = enemy.color;
        ctx.fillRect(screenX, enemy.y, enemy.width, enemy.height);
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(screenX + 5, enemy.y + 5, 8, 8);
        ctx.fillRect(screenX + 17, enemy.y + 5, 8, 8);
        ctx.fillStyle = 'black';
        ctx.fillRect(screenX + 7, enemy.y + 7, 4, 4);
        ctx.fillRect(screenX + 19, enemy.y + 7, 4, 4);
    }
}

function drawFlag() {
    const screenX = flag.x - cameraX;
    // Pole
    ctx.fillStyle = flag.color;
    ctx.fillRect(screenX, flag.y, flag.width, flag.height);
    
    // Flag
    ctx.fillStyle = flag.flagColor;
    ctx.beginPath();
    ctx.moveTo(screenX + flag.width, flag.y + 20);
    ctx.lineTo(screenX + flag.width + 40, flag.y + 40);
    ctx.lineTo(screenX + flag.width, flag.y + 60);
    ctx.closePath();
    ctx.fill();
    
    // Base
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(screenX - 10, flag.y + flag.height - 20, flag.width + 20, 20);
}

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#87CEEB');
    gradient.addColorStop(0.6, '#228B22');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(100, 80, 30, 0, Math.PI * 2);
    ctx.arc(140, 70, 35, 0, Math.PI * 2);
    ctx.arc(180, 80, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(500, 100, 25, 0, Math.PI * 2);
    ctx.arc(530, 90, 30, 0, Math.PI * 2);
    ctx.arc(560, 100, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Bushes
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(300, 570, 40, 0, Math.PI * 2);
    ctx.arc(340, 570, 35, 0, Math.PI * 2);
    ctx.arc(380, 570, 40, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(700, 570, 35, 0, Math.PI * 2);
    ctx.arc(740, 560, 30, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    if (gameRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBackground();
        drawPlatforms();
        drawCoins();
        drawMushrooms();
        drawFlag();
        drawEnemies();
        drawPlayer();
        
        updatePlayer();
        updateEnemies();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();

// Audio controls
if (muteBtn) {
    muteBtn.addEventListener('click', () => {
        if (bgm.paused || bgm.muted) {
            bgm.play().catch(() => {});
            muteBtn.textContent = '🔊';
            bgm.muted = false;
        } else {
            bgm.pause();
            muteBtn.textContent = '🔇';
            bgm.muted = true;
        }
    });
    
    document.addEventListener('click', () => {
        if (bgm.paused) {
            bgm.play().catch(() => {});
        }
    });
    
    document.addEventListener('keydown', () => {
        if (bgm.paused) {
            bgm.play().catch(() => {});
        }
    });
}