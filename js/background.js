// Draw the background with parallax effect
export function drawBackground(ctx, game) {
    // Get background image dimensions
    const imgWidth = game.assets.background.width;
    const imgHeight = game.assets.background.height;
    
    // Calculate aspect ratio of the image
    const imgAspect = imgWidth / imgHeight;
    
    // Calculate dimensions to maintain aspect ratio while filling canvas height
    let drawHeight = game.height;
    let drawWidth = game.height * imgAspect;
    
    // Apply camera position (parallax effect)
    // Multiply by 0.8 for a slight parallax effect (background moves slower than foreground)
    const cameraOffset = game.camera.x * 0.8;
    
    // Draw multiple background images to cover the entire level width
    const numBackgrounds = Math.ceil(game.world.width / drawWidth) + 1;
    const startIndex = Math.floor(cameraOffset / drawWidth);
    
    for (let i = 0; i < numBackgrounds; i++) {
        const x = i * drawWidth - (cameraOffset % drawWidth);
        const y = 0; // Draw from top of canvas
        
        if (x < -drawWidth || x > game.width) continue; // Skip if offscreen
        
        ctx.drawImage(game.assets.background, x, y, drawWidth, drawHeight);
    }
}