# Vector Brawl

Vector Brawl is a fast-paced, competitive 2D fighting game inspired by classics like Street Fighter and Mortal Kombat. Players can select from a variety of uniquely designed vector art characters and engage in one-on-one battles in dynamic arenas.

## Project Structure

- **index.html**: The main entry point for the game, setting up the HTML structure and including references to CSS and JavaScript files.
- **css/style.css**: Contains styles for the game, including layout, colors, and fonts.
- **js/game.js**: The main game loop that initializes the game engine, manages game state, and handles rendering.
- **js/engine/**: Contains core engine files:
  - **animator.js**: Manages animations for characters and UI elements.
  - **collision.js**: Handles collision detection between game objects.
  - **input.js**: Manages user input from keyboard and mouse.
  - **physics.js**: Manages physics simulation, including gravity and movement.
- **js/characters/**: Contains character definitions:
  - **character.js**: Base class for all characters, defining common properties and methods.
  - **fighter1.js**: Specific properties and methods for the first fighter.
  - **fighter2.js**: Specific properties and methods for the second fighter.
- **js/scenes/**: Manages different game scenes:
  - **mainMenu.js**: Manages the main menu scene.
  - **characterSelect.js**: Manages the character selection scene.
  - **fightScene.js**: Manages the fighting mechanics.
  - **resultScreen.js**: Displays the outcome of the fight.
- **js/ui/**: Handles UI elements:
  - **hud.js**: Manages the heads-up display.
  - **menu.js**: Handles UI for various menus.
- **assets/**: Contains game assets:
  - **audio/**: Background music and sound effects.
  - **sprites/**: Image files for backgrounds, characters, and UI elements.

## Setup Instructions

1. Clone the repository.
2. Open `index.html` in a web browser to start the game.
3. Use the keyboard to navigate menus and control characters during fights.

## Gameplay Mechanics

- Players select their characters from the character selection screen.
- Engage in one-on-one battles with unique moves and abilities.
- The game features health management, win/loss conditions, and a result screen.

## Credits

- Developed by [Your Name]
- Inspired by classic fighting games.