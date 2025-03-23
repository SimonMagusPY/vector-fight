// Import modules
import { player, handlePlayerInput, updatePlayerAnimation, drawPlayer } from './player.js';
import { updateCamera } from './camera.js';
import { drawBackground } from './background.js';
import { setupEventListeners } from './input.js';
import { loadAssets } from './assets.js';
import { boar, initBoar, updateBoar, drawBoar, loadBoarAssets } from './boar.js';

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
    controls: {
        attack1: false,
        attack2: false,
        left: false,
        right: false,
        jump: false,
        shift: false  // Add shift control for running
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

// Initialize game
async function init() {
    try {
        // Load game assets
        const assetsLoaded = await loadAssets(game);
        if (!assetsLoaded) {
            throw new Error('Failed to load assets');
        }
        
        // Initialize boar enemy
        await loadBoarAssets(game);
        initBoar(game);
        
        // Set up event listeners
        setupEventListeners(game, player);
        
        // Start the game loop once assets are loaded
        game.isRunning = true;
        requestAnimationFrame(gameLoop);
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

// Game loop
function gameLoop() {
    if (!game.isRunning) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, game.width, game.height);
    
    // Draw background
    drawBackground(ctx, game);
    
    // Handle input and update player state
    handlePlayerInput(game, () => updateCamera(game, player));
    
    // Update player animation
    updatePlayerAnimation();
    
    // Update boar enemy
    updateBoar(game, player);
    
    // Draw player
    drawPlayer(ctx, game);
    
    // Draw boar
    drawBoar(ctx, game);
    
    // Continue the loop
    requestAnimationFrame(gameLoop);
}

// Start the game when page loads
window.addEventListener('load', init);

console.log('Game.js loaded');