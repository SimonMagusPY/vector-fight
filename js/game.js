// Get the canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
const game = {
    width: canvas.width,
    height: canvas.height,
    isRunning: false,
    assets: {},
    player: {
        x: 400,  // Starting position (center of canvas)
        y: 450,  // Near bottom of canvas
        width: 128,  // Character width (adjust based on your sprite)
        height: 128, // Character height (adjust based on your sprite)
        frameX: 0,   // Current frame in the sprite sheet
        frameY: 0,   // Row in sprite sheet (if multiple actions in one sheet)
        frameCount: 7, // Total frames in idle animation
        frameDelay: 8, // Frames to wait before next animation frame
        frameCounter: 0, // Counter for animation timing
        state: 'idle',   // Current animation state
        attackTimer: 0,  // Timer for attack animation
        isAttacking: false, // Flag for attack state
        speed: 3,  // Walking speed in pixels per frame
        direction: 1,  // 1 for right, -1 for left
        isWalking: false  // Flag for walking state
    },
    controls: {
        attack1: false,  // First attack control flag
        attack2: false,   // Second attack control flag
        left: false,
        right: false
    }
};

// Asset loader
function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
        img.src = path;
    });
}

// Initialize game
async function init() {
    try {
        // Load game assets
        game.assets.background = await loadImage('assets/sprites/background.png');
        game.assets.idle = await loadImage('assets/sprites/idle.png');
        game.assets.attack1 = await loadImage('assets/sprites/ATTACK 1.png');
        game.assets.attack2 = await loadImage('assets/sprites/ATTACK 3.png');
        game.assets.walk = await loadImage('assets/sprites/WALK.png');
        
        // Set up event listeners
        setupEventListeners();
        
        // Start the game loop once assets are loaded
        game.isRunning = true;
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

// Update setupEventListeners
function setupEventListeners() {
    // Keydown event
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyZ' && !game.player.isAttacking) {
          game.controls.attack1 = true;
        }
        if (e.code === 'KeyX' && !game.player.isAttacking) {
          game.controls.attack2 = true;
        }
        if (e.code === 'ArrowLeft') {
            game.controls.left = true;
        }
        if (e.code === 'ArrowRight') {
            game.controls.right = true;
        }
    });
    
    // Keyup event
    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyZ') {
            game.controls.attack1 = false;
        }
        if (e.code === 'KeyX') {
            game.controls.attack2 = false;
        }
        if (e.code === 'ArrowLeft') {
            game.controls.left = false;
        }
        if (e.code === 'ArrowRight') {
            game.controls.right = false;
        }
    });
}

// Game loop
function gameLoop() {
    if (!game.isRunning) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, game.width, game.height);
    
    // Draw background
    drawBackground();
    
    // Handle input and update player state
    handlePlayerInput();
    
    // Update player animation
    updatePlayerAnimation();
    
    // Draw player
    drawPlayer();
    
    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Handle player input
function handlePlayerInput() {
    // Handle movement (but not while attacking)
    if (!game.player.isAttacking) {
        game.player.isWalking = false;
        
        if (game.controls.left) {
            game.player.x -= game.player.speed;
            game.player.direction = -1;
            game.player.isWalking = true;
        }
        
        if (game.controls.right) {
            game.player.x += game.player.speed;
            game.player.direction = 1;
            game.player.isWalking = true;
        }
        
        // Update player state to walking if moving
        if (game.player.isWalking && game.player.state !== 'walk') {
            game.player.state = 'walk';
            game.player.frameX = 0;
            game.player.frameCount = 8; // Walk animation has 8 frames
        }
        // Reset to idle if not walking or attacking
        else if (!game.player.isWalking && game.player.state !== 'idle') {
            game.player.state = 'idle';
            game.player.frameX = 0;
            game.player.frameCount = 7; // Idle has 7 frames
        }
    }
    
    // Handle first attack input
    if (game.controls.attack1 && !game.player.isAttacking) {
        startAttack('attack1');
    }
    // Handle second attack input
    else if (game.controls.attack2 && !game.player.isAttacking) {
        startAttack('attack2');
    }
    
    // Keep player within the screen bounds
    if (game.player.x < 0) game.player.x = 0;
    if (game.player.x > game.width) game.player.x = game.width;
}

// Start attack animation
function startAttack(attackType) {
    game.player.isAttacking = true;
    game.player.state = attackType;
    game.player.frameX = 0;  // Reset to first frame
    game.player.frameCount = 6;  // Both attack animations have 6 frames
    game.player.attackTimer = 0; // Reset attack timer
}

// Draw the background
function drawBackground() {
    const pattern = ctx.createPattern(game.assets.background, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, game.width, game.height);
}

// Update player animation frames
function updatePlayerAnimation() {
    // Slow down animation by using frameDelay
    game.player.frameCounter++;
    if (game.player.frameCounter >= game.player.frameDelay) {
        game.player.frameCounter = 0;
        
        // Advance to next frame
        game.player.frameX = (game.player.frameX + 1) % game.player.frameCount;
        
        // Handle attack completion
        if (game.player.isAttacking) {
            game.player.attackTimer++;
            
            // If we've gone through all attack frames, return to idle
            if (game.player.attackTimer >= game.player.frameCount) {
                game.player.isAttacking = false;
                game.player.state = 'idle';
                game.player.frameCount = 7; // Reset to idle frame count
                game.player.frameX = 0; // Reset animation frame
            }
        }
    }
}

// Update drawPlayer function to handle direction
function drawPlayer() {
    // Get the sprite sheet based on current state
    const spriteSheet = game.assets[game.player.state];
    
    if (!spriteSheet) return;
    
    // Calculate the single frame width (total width / number of frames)
    const frameWidth = spriteSheet.width / game.player.frameCount;
    const frameHeight = spriteSheet.height;
    
    // Save context state before applying transformations
    ctx.save();
    
    // If facing left, flip the character
    if (game.player.direction === -1) {
        ctx.translate(game.player.x * 2, 0);
        ctx.scale(-1, 1);
    }
    
    // Draw the current frame
    ctx.drawImage(
        spriteSheet,
        game.player.frameX * frameWidth, // Source X (current frame)
        game.player.frameY * frameHeight, // Source Y (current row)
        frameWidth,  // Source width (single frame)
        frameHeight, // Source height
        game.player.x - game.player.width / 2, // Destination X (centered)
        game.player.y - game.player.height / 2, // Destination Y (centered)
        game.player.width,  // Destination width
        game.player.height  // Destination height
    );
    
    // Restore context state
    ctx.restore();
}

// Start the game when page loads
window.addEventListener('load', init);

console.log('Game.js loaded');