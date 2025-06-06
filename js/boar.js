// Boar enemy character implementation

// Boar properties and state
export const boar = {
    x: 700,            // Moved slightly further to be visible at start
    y: 520,            // Match player's ground level
    width: 50,        // Match player's width
    height: 50,       // Match player's height (increased from 100)
    frameX: 0,
    frameY: 0,
    frameCount: 4,     // 4 frames in idle animation
    frameDelay: 8,     // Match player's animation timing
    frameCounter: 0,
    state: 'idle',
    direction: -1,     // Facing left initially
    speed: 2,
    isActive: true,
    health: 100,
    attackDamage: 20,
    detectionRange: 300,
    attackRange: 50,
    isAggressive: false,
    walkFrameCount: 6,    // Walk animation has 6 frames
    isWalking: false,     // Flag for walking state
    maxHealth: 100,       // Maximum health
    damageFlashTimer: 0,  // Timer for damage visual feedback
    knockbackSpeed: 0,    // Current knockback velocity
    knockbackDirection: 0, // Direction of knockback
    hitFrameCount: 4,      // Update to 4 frames in hit animation
    isHit: false,          // Flag for hit state
    hitTimer: 0,           // Timer for hit animation
    hitDuration: 30        // Slightly increased duration to show all frames
};

// Initialize the boar
export function initBoar(game) {
    // Reset boar position and state if needed
    boar.x = 600;
    boar.y = 520;
    boar.frameX = 0;
    boar.state = 'idle';
    boar.direction = -1;
    boar.isActive = true;
    boar.health = 100;
    boar.isAggressive = false;
    
    // Load boar assets if not already loaded
    if (!game.assets.boarIdle) {
        loadBoarAssets(game);
    }
}

// Load boar related assets
export async function loadBoarAssets(game) {
    return new Promise((resolve, reject) => {
        // Load idle animation
        const idleImg = new Image();
        idleImg.onload = () => {
            game.assets.boarIdle = idleImg;
            
            // Load walk animation
            const walkImg = new Image();
            walkImg.onload = () => {
                game.assets.boarWalk = walkImg;
                
                // Load hit animation
                const hitImg = new Image();
                hitImg.onload = () => {
                    game.assets.boarHit = hitImg;
                    resolve(true);
                };
                hitImg.onerror = () => reject(new Error('Failed to load boar hit assets'));
                hitImg.src = 'assets/sprites/boar/hit.png';
            };
            walkImg.onerror = () => reject(new Error('Failed to load boar walk assets'));
            walkImg.src = 'assets/sprites/boar/walk.png';
        };
        idleImg.onerror = () => reject(new Error('Failed to load boar idle assets'));
        idleImg.src = 'assets/sprites/boar/idle.png';
    });
}

// Update boar animation frames
export function updateBoarAnimation() {
    // Slow down animation by using frameDelay
    boar.frameCounter++;
    if (boar.frameCounter >= boar.frameDelay) {
        boar.frameCounter = 0;
        
        // Advance to next frame
        boar.frameX = (boar.frameX + 1) % boar.frameCount;
    }
}

// Update boar state and behavior
export function updateBoar(game, player) {
    if (!boar.isActive) return;
    
    // Handle hit animation
    if (boar.isHit) {
        boar.hitTimer++;
        
        // Keep the hit animation going for the hit duration
        if (boar.hitTimer >= boar.hitDuration) {
            boar.isHit = false;
            boar.hitTimer = 0;
            boar.state = 'idle';
            boar.frameCount = 4; // Reset to idle frame count
            boar.frameX = 0;
        }
        
        // Handle knockback
        if (boar.knockbackSpeed > 0) {
            boar.x += boar.knockbackDirection * boar.knockbackSpeed;
            boar.knockbackSpeed *= 0.8; // Reduce knockback over time
            
            if (boar.knockbackSpeed < 0.5) {
                boar.knockbackSpeed = 0;
            }
            
            // Keep boar within world bounds
            if (boar.x < 0) boar.x = 0;
            if (boar.x > game.world.width) boar.x = game.world.width;
        }
        
        // Update hit animation frame - slower to see all frames
        boar.frameCounter++;
        if (boar.frameCounter >= boar.frameDelay/2) { // Make hit animation slightly faster
            boar.frameCounter = 0;
            
            // Progress through all 4 frames
            boar.frameX = (boar.frameX + 1) % boar.hitFrameCount;
        }
        
        return; // Skip normal movement while in hit state
    }
    
    // Handle knockback (if not in hit state)
    if (boar.knockbackSpeed > 0) {
        boar.x += boar.knockbackDirection * boar.knockbackSpeed;
        boar.knockbackSpeed *= 0.8; // Reduce knockback over time
        
        if (boar.knockbackSpeed < 0.5) {
            boar.knockbackSpeed = 0;
        }
        
        // Keep boar within world bounds
        if (boar.x < 0) boar.x = 0;
        if (boar.x > game.world.width) boar.x = game.world.width;
        
        // Decrease damage flash timer
        if (boar.damageFlashTimer > 0) {
            boar.damageFlashTimer--;
        }
        
        return; // Skip normal movement while in knockback
    }
    
    // Calculate distance to player
    const distanceToPlayer = Math.abs(player.x - boar.x);
    
    // Check if player is in detection range
    if (distanceToPlayer < boar.detectionRange) {
        boar.isAggressive = true;
        boar.isWalking = true; // Start walking when aggressive
        
        // Determine direction to player
        boar.direction = player.x < boar.x ? -1 : 1;
        
        // Move toward player if not in attack range
        if (distanceToPlayer > boar.attackRange) {
            boar.x += boar.direction * boar.speed;
            boar.state = 'walk'; // Set state to walk
            boar.frameCount = boar.walkFrameCount; // Use walk frame count
        } else {
            // In attack range - would implement attack logic here
            // For now, just stop walking
            boar.isWalking = false;
            boar.state = 'idle';
            boar.frameCount = 4; // Reset to idle frame count
        }
    } else {
        // Player out of range, return to idle
        boar.isAggressive = false;
        boar.isWalking = false;
        boar.state = 'idle';
        boar.frameCount = 4; // Reset to idle frame count
    }
    
    // Update animation
    updateBoarAnimation();
}

// Draw boar on canvas
export function drawBoar(ctx, game) {
    if (!boar.isActive) return;
    
    // Get the appropriate sprite sheet based on state
    let spriteSheet;
    if (boar.isHit) {
        spriteSheet = game.assets.boarHit;
    } else {
        spriteSheet = boar.state === 'walk' ? game.assets.boarWalk : game.assets.boarIdle;
    }
    
    if (!spriteSheet) return;
    
    // Calculate the single frame width
    const frameWidth = spriteSheet.width / (boar.isHit ? boar.hitFrameCount : boar.frameCount);
    const frameHeight = spriteSheet.height;
    
    // Calculate boar's position on screen (relative to camera)
    const screenX = boar.x - game.camera.x;
    
    // Skip drawing if offscreen
    if (screenX < -boar.width || screenX > game.width) return;
    
    // Save context state before applying transformations
    ctx.save();
    
    // Remove the red box damage flash effect - the hit animation already provides visual feedback
    // Only keep a subtle alpha flash if needed
    if (boar.damageFlashTimer > 0 && !boar.isHit) {
        // Just use alpha for a subtle flash, no red rectangle
        ctx.globalAlpha = boar.damageFlashTimer % 2 === 0 ? 0.7 : 1;
    }
    
    // If facing right (opposite of player), flip the sprite
    if (boar.direction === 1) {
        ctx.translate(screenX * 2, 0);
        ctx.scale(-1, 1);
    }
    
    // Draw the current frame
    ctx.drawImage(
        spriteSheet,
        boar.frameX * frameWidth, // Source X (current frame)
        boar.frameY * frameHeight, // Source Y (current row)
        frameWidth,  // Source width (single frame)
        frameHeight, // Source height
        boar.direction === -1 ? screenX - boar.width / 2 : screenX - boar.width / 2, // Destination X
        boar.y - boar.height / 2, // Destination Y
        boar.width,  // Destination width
        boar.height  // Destination height
    );
    
    // Restore context state
    ctx.restore();
    
    // Draw health bar (optional)
    if (boar.isAggressive || boar.health < boar.maxHealth) {  // Always show health if damaged
        const healthBarWidth = 80;
        const healthBarHeight = 8;
        const healthPercentage = boar.health / boar.maxHealth;
        
        // Health bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(
            screenX - healthBarWidth / 2,
            boar.y - boar.height / 2 - 20,
            healthBarWidth,
            healthBarHeight
        );
        
        // Health bar fill
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(
            screenX - healthBarWidth / 2,
            boar.y - boar.height / 2 - 20,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );
    }
}

// Check for collision between boar and player
export function checkBoarCollision(player) {
    if (!boar.isActive) return false;
    
    // Simple rectangle collision
    const boarHitbox = {
        x: boar.x - boar.width / 3,  // Make hitbox smaller than visual size
        y: boar.y - boar.height / 3,
        width: boar.width * 2/3,
        height: boar.height * 2/3
    };
    
    const playerHitbox = {
        x: player.x - player.width / 3,
        y: player.y - player.height / 3,
        width: player.width * 2/3,
        height: player.height * 2/3
    };
    
    return (
        boarHitbox.x < playerHitbox.x + playerHitbox.width &&
        boarHitbox.x + boarHitbox.width > playerHitbox.x &&
        boarHitbox.y < playerHitbox.y + playerHitbox.height &&
        boarHitbox.y + boarHitbox.height > playerHitbox.y
    );
}

// Handle boar taking damage
export function damageBoar(amount) {
    if (!boar.isActive) return;
    
    // Reduce health
    boar.health -= amount;
    
    // Set hit state
    boar.isHit = true;
    boar.hitTimer = 0;
    boar.frameX = 0; // Start at first frame of hit animation
    boar.state = 'hit';
    
    // No need for damageFlashTimer since we're using the hit animation
    // boar.damageFlashTimer = 10; // Flash for 10 frames
    
    // Add knockback
    boar.knockbackSpeed = 8;
    boar.knockbackDirection = -boar.direction; // Knocked back in opposite direction of facing
    
    // Check if boar is defeated
    if (boar.health <= 0) {
        defeatBoar();
    }
}

// Add function to handle boar defeat
export function defeatBoar() {
    boar.isActive = false;
    // You could add death animation or effects here
    console.log("Boar defeated!");
}