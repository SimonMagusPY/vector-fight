// Player properties and functions
export const player = {
    x: 400,           // Starting position (center of canvas)
    y: 520,           // Position on ground level
    width: 128,       // Character width
    height: 128,      // Character height
    frameX: 0,        // Current frame in the sprite sheet
    frameY: 0,        // Row in sprite sheet
    frameCount: 7,    // Total frames in idle animation
    frameDelay: 8,    // Frames to wait before next animation frame
    frameCounter: 0,  // Counter for animation timing
    state: 'idle',    // Current animation state
    attackTimer: 0,   // Timer for attack animation
    isAttacking: false, // Flag for attack state
    speed: 3,         // Walking speed in pixels per frame
    direction: 1,     // 1 for right, -1 for left
    isWalking: false, // Flag for walking state
    isJumping: false,
    jumpTimer: 0,
    jumpFrameCount: 5, // Jump animation has 5 frames
    jumpHeight: 150,   // Maximum height of jump in pixels
    jumpSpeed: 8,      // Initial jump velocity
    gravity: 0.5,      // Gravity pulling player down
    velocityY: 0,      // Vertical velocity
    groundY: 520,      // Ground position
    isRunning: false,
    runSpeed: 6,       // Running is faster than walking
    runFrameCount: 8,  // Assuming 8 frames in the run animation
    
    // Combat properties
    attackDamage: 25,       // Damage dealt with each attack
    attackHitboxWidth: 80,  // Width of attack hitbox in front of player
    attackHitboxHeight: 100, // Height of attack hitbox
    hasHitTarget: false,    // Flag to prevent multiple hits in one attack
};

// Start attack animation
export function startAttack(attackType) {
    player.isAttacking = true;
    player.state = attackType;
    player.frameX = 0;  // Reset to first frame
    player.frameCount = 6;  // Both attack animations have 6 frames
    player.attackTimer = 0; // Reset attack timer
    player.hasHitTarget = false; // Reset hit flag for new attack
}

// Start jump animation and physics
export function startJump() {
    if (!player.isJumping) {
        player.isJumping = true;
        player.state = 'jump';
        player.frameX = 0;  // Reset to first frame
        player.frameCount = player.jumpFrameCount;
        player.jumpTimer = 0;
        
        // Apply initial upward velocity
        player.velocityY = -player.jumpSpeed;
    }
}

// Handle player input and movement
export function handlePlayerInput(game, updateCamera) {
    // Handle jump input
    if (game.controls.jump && !player.isJumping && !player.isAttacking) {
        startJump();
    }
    
    // Handle movement (but not while attacking)
    if (!player.isAttacking) {
        let isMoving = false;
        
        // Determine if player is running
        const isRunning = game.controls.shift && (game.controls.left || game.controls.right);
        const currentSpeed = isRunning ? player.runSpeed : player.speed;
        
        // Move left
        if (game.controls.left) {
            player.x -= currentSpeed;
            player.direction = -1; // Face left
            isMoving = true;
        }
        
        // Move right
        if (game.controls.right) {
            player.x += currentSpeed;
            player.direction = 1; // Face right
            isMoving = true;
        }
        
        // Update player state
        if (isMoving) {
            // Set animation state based on whether running or walking
            if (isRunning && !player.isJumping) {
                player.state = 'run';
                player.frameCount = player.runFrameCount;
            } else if (!player.isJumping) {
                player.state = 'walk';
                player.frameCount = 8; // Walk animation has 8 frames
            }
        } else if (!player.isJumping) {
            // Reset to idle if not moving or jumping
            player.state = 'idle';
            player.frameCount = 7; // Idle animation has 7 frames
        }
    }
    
    // Handle first attack input
    if (game.controls.attack1 && !player.isAttacking) {
        startAttack('attack1');
    }
    // Handle second attack input
    else if (game.controls.attack2 && !player.isAttacking) {
        startAttack('attack2');
    }
    
    // Apply jump physics if player is jumping
    if (player.isJumping) {
        // Apply gravity to velocity
        player.velocityY += player.gravity;
        
        // Move player vertically based on velocity
        player.y += player.velocityY;
        
        // Check if player has landed
        if (player.y >= player.groundY) {
            player.y = player.groundY;
            player.velocityY = 0;
        }
    }
    
    // Update camera position based on player position
    updateCamera();
    
    // Keep player within the world bounds (not just screen bounds)
    if (player.x < 0) player.x = 0;
    if (player.x > game.world.width) player.x = game.world.width;
}

// Update player animation frames
export function updatePlayerAnimation() {
    // Slow down animation by using frameDelay
    player.frameCounter++;
    if (player.frameCounter >= player.frameDelay) {
        player.frameCounter = 0;
        
        // Advance to next frame
        player.frameX = (player.frameX + 1) % player.frameCount;
        
        // Handle attack completion
        if (player.isAttacking) {
            player.attackTimer++;
            
            // If we've gone through all attack frames, return to idle
            if (player.attackTimer >= player.frameCount) {
                player.isAttacking = false;
                player.state = 'idle';
                player.frameCount = 7; // Reset to idle frame count
                player.frameX = 0; // Reset animation frame
            }
        }
        
        // Handle jump completion - only reset state when player has landed
        if (player.isJumping) {
            player.jumpTimer++;
            
            // If we've gone through all jump frames AND player has landed, return to idle
            if (player.jumpTimer >= player.frameCount && player.y >= player.groundY) {
                player.isJumping = false;
                player.state = 'idle';
                player.frameCount = 7; // Reset to idle frame count
                player.frameX = 0; // Reset animation frame
            }
        }
    }
}

// Draw player on canvas
export function drawPlayer(ctx, game) {
    // Get the sprite sheet based on current state
    const spriteSheet = game.assets[player.state];
    
    if (!spriteSheet) return;
    
    // Calculate the single frame width (total width / number of frames)
    const frameWidth = spriteSheet.width / player.frameCount;
    const frameHeight = spriteSheet.height;
    
    // Calculate player's position on screen (relative to camera)
    const screenX = player.x - game.camera.x;
    
    // Save context state before applying transformations
    ctx.save();
    
    // If facing left, flip the character
    if (player.direction === -1) {
        ctx.translate(screenX * 2, 0);
        ctx.scale(-1, 1);
    }
    
    // Draw the current frame
    ctx.drawImage(
        spriteSheet,
        player.frameX * frameWidth, // Source X (current frame)
        player.frameY * frameHeight, // Source Y (current row)
        frameWidth,  // Source width (single frame)
        frameHeight, // Source height
        player.direction === 1 ? screenX - player.width / 2 : screenX - player.width / 2, // Destination X (centered)
        player.y - player.height / 2, // Destination Y (centered)
        player.width,  // Destination width
        player.height  // Destination height
    );
    
    // Restore context state
    ctx.restore();
}

// Add this function to player.js
export function getPlayerAttackHitbox() {
    // Attack hitbox is offset in front of the player based on direction
    const hitboxOffsetX = player.direction === 1 ? player.width / 4 : -player.width / 4 - player.attackHitboxWidth;
    
    return {
        x: player.x + hitboxOffsetX,
        y: player.y - player.attackHitboxHeight / 2,
        width: player.attackHitboxWidth,
        height: player.attackHitboxHeight
    };
}

// Optional: Function to draw the attack hitbox (for debugging)
export function drawPlayerAttackHitbox(ctx, game) {
    if (!player.isAttacking) return;
    
    // Only show hitbox in attack frames 2-4 (when sword is swinging)
    if (player.frameX < 1 || player.frameX > 4) return;
    
    const hitbox = getPlayerAttackHitbox();
    const screenX = hitbox.x - game.camera.x;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    
    ctx.fillRect(screenX, hitbox.y, hitbox.width, hitbox.height);
    ctx.strokeRect(screenX, hitbox.y, hitbox.width, hitbox.height);
    
    ctx.restore();
}