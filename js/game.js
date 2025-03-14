// Get the canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize the canvas
canvas.width = 800;  // Make canvas wider
canvas.height = 600; // Make canvas taller

// Game state
const game = {
    width: canvas.width,
    height: canvas.height,
    isRunning: false,
    assets: {},
    player: {
        x: 400,  // Starting position (center of canvas)
        y: 520,  // Adjust this to place character on ground level
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
        isWalking: false,  // Flag for walking state
        isJumping: false,
        jumpTimer: 0,
        jumpFrameCount: 5, // Jump animation has 5 frames
        jumpHeight: 150,      // Maximum height of jump in pixels
        jumpSpeed: 8,         // Initial jump velocity
        gravity: 0.5,         // Gravity pulling player down
        velocityY: 0,         // Vertical velocity
        groundY: 520          // Ground position (same as initial y, adjust based on background)
    },
    controls: {
        attack1: false,  
        attack2: false,   
        left: false,
        right: false,
        jump: false 
    },
    camera: {
        x: 0,           // Camera's x position in the world
        deadZoneWidth: 200,  // Player can move freely within this width without scrolling
    },
    world: {
        width: 2400,    // Total world width (3x canvas width)
        bounds: {
            left: 0,
            right: 2400
        }
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
        game.assets.background = await loadImage('assets/sprites/night_bg_2.jpg');
        game.assets.idle = await loadImage('assets/sprites/idle.png');
        game.assets.attack1 = await loadImage('assets/sprites/ATTACK 1.png');
        game.assets.attack2 = await loadImage('assets/sprites/ATTACK 3.png');
        game.assets.walk = await loadImage('assets/sprites/WALK.png');
        game.assets.jump = await loadImage('assets/sprites/JUMP.png'); // Add jump sprite
        
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
        if (e.code === 'Space' && !game.player.isJumping) {
            game.controls.jump = true;
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
        if (e.code === 'Space') {
            game.controls.jump = false;
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
    // Handle jump input
    if (game.controls.jump && !game.player.isJumping && !game.player.isAttacking) {
        startJump();
    }
    
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
    
    // Apply jump physics if player is jumping
    if (game.player.isJumping) {
        // Apply gravity to velocity
        game.player.velocityY += game.player.gravity;
        
        // Move player vertically based on velocity
        game.player.y += game.player.velocityY;
        
        // Check if player has landed
        if (game.player.y >= game.player.groundY) {
            game.player.y = game.player.groundY;
            game.player.velocityY = 0;
        }
    }
    
    // Update camera position based on player position
    updateCamera();
    
    // Keep player within the world bounds (not just screen bounds)
    if (game.player.x < 0) game.player.x = 0;
    if (game.player.x > game.world.width) game.player.x = game.world.width;
}

// Start attack animation
function startAttack(attackType) {
    game.player.isAttacking = true;
    game.player.state = attackType;
    game.player.frameX = 0;  // Reset to first frame
    game.player.frameCount = 6;  // Both attack animations have 6 frames
    game.player.attackTimer = 0; // Reset attack timer
}

// Modify the startJump function to add physics
function startJump() {
    if (!game.player.isJumping) {
        game.player.isJumping = true;
        game.player.state = 'jump';
        game.player.frameX = 0;  // Reset to first frame
        game.player.frameCount = game.player.jumpFrameCount;
        game.player.jumpTimer = 0;
        
        // Apply initial upward velocity
        game.player.velocityY = -game.player.jumpSpeed;
    }
}

// Draw the background
function drawBackground() {
    // Get background image dimensions
    const imgWidth = game.assets.background.width;
    const imgHeight = game.assets.background.height;
    
    // Calculate aspect ratio of the image
    const imgAspect = imgWidth / imgHeight;
    
    // Calculate dimensions to maintain aspect ratio while filling canvas height
    let drawHeight = game.height;
    let drawWidth = game.height * imgAspect;
    
    // Calculate position to center the image vertically
    const y = 0;
    
    // Apply camera position (parallax effect)
    // Multiply by 0.8 for a slight parallax effect (background moves slower than foreground)
    const cameraOffset = game.camera.x * 0.8;
    
    // Draw multiple background images to cover the entire level width
    const numBackgrounds = Math.ceil(game.world.width / drawWidth) + 1;
    const startIndex = Math.floor(cameraOffset / drawWidth);
    
    for (let i = 0; i < numBackgrounds; i++) {
        const x = i * drawWidth - (cameraOffset % drawWidth);
        
        if (x < -drawWidth || x > game.width) continue; // Skip if offscreen
        
        ctx.drawImage(game.assets.background, x, y, drawWidth, drawHeight);
    }
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
        
        // Handle jump completion - only reset state when player has landed
        if (game.player.isJumping) {
            game.player.jumpTimer++;
            
            // If we've gone through all jump frames AND player has landed, return to idle
            if (game.player.jumpTimer >= game.player.frameCount && game.player.y >= game.player.groundY) {
                game.player.isJumping = false;
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
    
    // Calculate player's position on screen (relative to camera)
    const screenX = game.player.x - game.camera.x;
    
    // Save context state before applying transformations
    ctx.save();
    
    // If facing left, flip the character
    if (game.player.direction === -1) {
        ctx.translate(screenX * 2, 0);
        ctx.scale(-1, 1);
    }
    
    // Draw the current frame
    ctx.drawImage(
        spriteSheet,
        game.player.frameX * frameWidth, // Source X (current frame)
        game.player.frameY * frameHeight, // Source Y (current row)
        frameWidth,  // Source width (single frame)
        frameHeight, // Source height
        game.player.direction === 1 ? screenX - game.player.width / 2 : screenX - game.player.width / 2, // Destination X (centered)
        game.player.y - game.player.height / 2, // Destination Y (centered)
        game.player.width,  // Destination width
        game.player.height  // Destination height
    );
    
    // Restore context state
    ctx.restore();
}

// Add a new function to update the camera position
function updateCamera() {
    // Calculate the center of the screen
    const screenCenterX = game.width / 2;
    
    // Calculate the dead zone boundaries
    const deadZoneLeft = screenCenterX - game.camera.deadZoneWidth / 2;
    const deadZoneRight = screenCenterX + game.camera.deadZoneWidth / 2;
    
    // Calculate player's position relative to the camera
    const playerScreenX = game.player.x - game.camera.x;
    
    // Update camera if player is outside the dead zone
    if (playerScreenX < deadZoneLeft) {
        game.camera.x = game.player.x - deadZoneLeft;
    } else if (playerScreenX > deadZoneRight) {
        game.camera.x = game.player.x - deadZoneRight;
    }
    
    // Keep camera within world bounds
    if (game.camera.x < game.world.bounds.left) {
        game.camera.x = game.world.bounds.left;
    } else if (game.camera.x > game.world.bounds.right - game.width) {
        game.camera.x = game.world.bounds.right - game.width;
    }
}

// Start the game when page loads
window.addEventListener('load', init);

console.log('Game.js loaded');