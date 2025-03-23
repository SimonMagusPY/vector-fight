// Asset loader
export function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
        img.src = path;
    });
}

// Load all game assets
export async function loadAssets(game) {
    try {
        // Load game assets
        game.assets.background = await loadImage('assets/sprites/night_bg_2.jpg');
        game.assets.idle = await loadImage('assets/sprites/knight/idle.png');
        game.assets.attack1 = await loadImage('assets/sprites/knight/attack_1.png');
        game.assets.attack2 = await loadImage('assets/sprites/knight/attack_2.png');
        game.assets.walk = await loadImage('assets/sprites/knight/WALK.png');
        game.assets.jump = await loadImage('assets/sprites/knight/JUMP.png');
        game.assets.run = await loadImage('assets/sprites/knight/RUN.PNG');
        
        return true;
    } catch (error) {
        console.error('Error loading assets:', error);
        return false;
    }
}