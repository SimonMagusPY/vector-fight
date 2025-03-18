// Set up event listeners for keyboard input
export function setupEventListeners(game, player) {
    // Keydown event
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyZ' && !player.isAttacking) {
            game.controls.attack1 = true;
        }
        if (e.code === 'KeyX' && !player.isAttacking) {
            game.controls.attack2 = true;
        }
        if (e.code === 'ArrowLeft') {
            game.controls.left = true;
        }
        if (e.code === 'ArrowRight') {
            game.controls.right = true;
        }
        if (e.code === 'Space' && !player.isJumping) {
            game.controls.jump = true;
        }
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            game.controls.shift = true;
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
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            game.controls.shift = false;
        }
    });
}