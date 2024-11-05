// Get the canvas element and its context
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

// Set up constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30; // Size of each block in pixels

// Set canvas dimensions based on the board size
canvas.width = BOARD_WIDTH * BLOCK_SIZE + 2; // Extra space for border
canvas.height = BOARD_HEIGHT * BLOCK_SIZE + 2; // Extra space for border

// Define colors
const BORDER_COLOR = "#808080";
const PIECE_COLOR = "yellow";

// Initial position of the "O" piece
let piece = { x: 3, y: 0 }; // Starting at (3, 0), top-center of the grid

// Draw the grid with borders
function drawGrid() {
  if (!ctx) return;

  // Draw the border
  ctx.fillStyle = BORDER_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the inner grid
  ctx.clearRect(1, 1, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);

  // Draw grid lines
  ctx.strokeStyle = "#B0B0B0"; // Light gray lines inside the board
  ctx.lineWidth = 1;

  for (let x = 0; x <= BOARD_WIDTH; x++) {
    ctx.beginPath();
    ctx.moveTo(x * BLOCK_SIZE + 1, 1);
    ctx.lineTo(x * BLOCK_SIZE + 1, BOARD_HEIGHT * BLOCK_SIZE + 1);
    ctx.stroke();
  }

  for (let y = 0; y <= BOARD_HEIGHT; y++) {
    ctx.beginPath();
    ctx.moveTo(1, y * BLOCK_SIZE + 1);
    ctx.lineTo(BOARD_WIDTH * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1);
    ctx.stroke();
  }
}

// Draw the "O" piece
function drawPiece() {
  if (ctx) {
    ctx.fillStyle = PIECE_COLOR;
    // Draw the 2x2 block (O piece) at (piece.x, piece.y)
    ctx.fillRect(
      piece.x * BLOCK_SIZE + 1,
      piece.y * BLOCK_SIZE + 1,
      BLOCK_SIZE,
      BLOCK_SIZE
    );
    ctx.fillRect(
      (piece.x + 1) * BLOCK_SIZE + 1,
      piece.y * BLOCK_SIZE + 1,
      BLOCK_SIZE,
      BLOCK_SIZE
    );
    ctx.fillRect(
      piece.x * BLOCK_SIZE + 1,
      (piece.y + 1) * BLOCK_SIZE + 1,
      BLOCK_SIZE,
      BLOCK_SIZE
    );
    ctx.fillRect(
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
    case "ArrowLeft":
      if (piece.x > 0) {
        piece.x -= 1;
      }
      break;
    case "ArrowRight":
      if (piece.x < BOARD_WIDTH - 2) {
        // Ensure piece stays within bounds
        piece.x += 1;
      }
      break;
    case "ArrowDown":
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
document.addEventListener("keydown", handleKeyPress);

// Initial draw
draw();
