// Update camera position based on player position
export function updateCamera(game, player) {
    // Calculate the center of the screen
    const screenCenterX = game.width / 2;
    
    // Calculate the dead zone boundaries
    const deadZoneLeft = screenCenterX - game.camera.deadZoneWidth / 2;
    const deadZoneRight = screenCenterX + game.camera.deadZoneWidth / 2;
    
    // Calculate player's position relative to the camera
    const playerScreenX = player.x - game.camera.x;
    
    // Update camera if player is outside the dead zone
    if (playerScreenX < deadZoneLeft) {
        game.camera.x = player.x - deadZoneLeft;
    } else if (playerScreenX > deadZoneRight) {
        game.camera.x = player.x - deadZoneRight;
    }
    
    // Keep camera within world bounds
    if (game.camera.x < game.world.bounds.left) {
        game.camera.x = game.world.bounds.left;
    } else if (game.camera.x > game.world.bounds.right - game.width) {
        game.camera.x = game.world.bounds.right - game.width;
    }
}