// Get the canvas element and its context
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const context = canvas.getContext('2d');

// Set up constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30; // Size of each block in pixels

// Set canvas dimensions based on the board size
canvas.width = BOARD_WIDTH * BLOCK_SIZE + 2; // Extra space for border
canvas.height = BOARD_HEIGHT * BLOCK_SIZE + 2; // Extra space for border

// Define colors
const BORDER_COLOUR = '#808080';
const PIECE_COLOUR = 'yellow';

// Initial position of the "O" piece
const piece = { x: 3, y: 0 }; // Starting at (3, 0), top-center of the grid

// Draw the grid with borders
function drawGrid() {
  if (!context) {
    return;
  }

  // Draw the border
  context.fillStyle = BORDER_COLOUR;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the inner grid

  context.clearRect(1, 1, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);

  // Draw grid lines
  context.strokeStyle = '#B0B0B0'; // Light gray lines inside the board
  context.lineWidth = 0.5;

  for (let x = 0; x <= BOARD_WIDTH; ++x) {
    context.beginPath();
    context.moveTo(x * BLOCK_SIZE + 1, 1);
    context.lineTo(x * BLOCK_SIZE + 1, BOARD_HEIGHT * BLOCK_SIZE + 1);
    context.stroke();
  }

  for (let y = 0; y <= BOARD_HEIGHT; ++y) {
    context.beginPath();
    context.moveTo(1, y * BLOCK_SIZE + 1);
    context.lineTo(BOARD_WIDTH * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1);
    context.stroke();
  }
}

// Draw the "O" piece
function drawPiece() {
  if (context) {
    context.fillStyle = PIECE_COLOUR;
    // Draw the 2x2 block (O piece) at (piece.x, piece.y)
    context.fillRect(
      piece.x * BLOCK_SIZE + 1,
      piece.y * BLOCK_SIZE + 1,
      BLOCK_SIZE,
      BLOCK_SIZE
    );
    context.fillRect(
      (piece.x + 1) * BLOCK_SIZE + 1,
      piece.y * BLOCK_SIZE + 1,
      BLOCK_SIZE,
      BLOCK_SIZE
    );
    context.fillRect(
      piece.x * BLOCK_SIZE + 1,
      (piece.y + 1) * BLOCK_SIZE + 1,
      BLOCK_SIZE,
      BLOCK_SIZE
    );
    context.fillRect(
      (piece.x + 1) * BLOCK_SIZE + 1,
      (piece.y + 1) * BLOCK_SIZE + 1,
      BLOCK_SIZE,
      BLOCK_SIZE
    );
  }
}

// Handle key presses to move the piece
function handleKeyPress(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowLeft':
      if (piece.x > 0) {
        piece.x -= 1;
      }
      break;
    case 'ArrowRight':
      if (piece.x < BOARD_WIDTH - 2) {
        // Ensure piece stays within bounds
        piece.x += 1;
      }
      break;
    case 'ArrowDown':
      if (piece.y < BOARD_HEIGHT - 2) {
        // Ensure piece stays within bounds
        piece.y += 1;
      }
      break;
  }
  draw(); // Redraw the board and piece
}

// Draw everything (board + piece)
function draw() {
  drawGrid();
  drawPiece();
}

// Set up event listener for keypress
document.addEventListener('keydown', handleKeyPress);

// Initial draw
draw();
