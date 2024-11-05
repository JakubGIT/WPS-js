const COLOURS = [
  '#ffb3ba',
  '#ffdfba',
  '#ffffba',
  '#baffc9',
  '#bae1ff',
] as const;

const SHAPES = [
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1],
    [1, 0],
    [1, 0],
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [1, 0],
    [1, 1],
    [0, 1],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 0],
  ],
  [
    [0, 1],
    [1, 1],
    [1, 0],
  ],
  [[1], [1], [1], [1]],
] as const;

class Board {
  width: number;
  height: number;
  grid: ((typeof COLOURS)[number] | '')[][];
  blockSize: number;
  currentPiece: Piece;
  gameOver = false;

  constructor(width: number, height: number, blockSize: number) {
    this.width = width;
    this.height = height;
    this.blockSize = blockSize;
    this.grid = Array.from({ length: height }, () => Array(width).fill(0));
    this.currentPiece = new Piece(4, 0);
  }

  // Draw the grid and the current piece
  draw(context: CanvasRenderingContext2D) {
    // Draw the grid with borders
    this.drawGrid(context);

    if (this.checkCollision()) {
      this.gameOver = true;
      this.drawGameOver(context);
      // TODO: render only a part of the piece to avoid overlapping
    }

    // Draw the current piece
    this.currentPiece.draw(context, this.blockSize);
  }

  // Draw the grid (including borders)
  private drawGrid(context: CanvasRenderingContext2D) {
    context.fillStyle = '#808080'; // Border color
    context.fillRect(
      0,
      0,
      this.width * this.blockSize + 2,
      this.height * this.blockSize + 2
    );

    context.clearRect(
      1,
      1,
      this.width * this.blockSize,
      this.height * this.blockSize
    );

    context.strokeStyle = '#B0B0B0'; // Light gray lines inside the board
    context.lineWidth = 0.5;

    // Draw vertical grid lines
    for (let x = 0; x <= this.width; ++x) {
      context.beginPath();
      context.moveTo(x * this.blockSize + 1, 1);
      context.lineTo(x * this.blockSize + 1, this.height * this.blockSize + 1);
      context.stroke();
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= this.height; ++y) {
      context.beginPath();
      context.moveTo(1, y * this.blockSize + 1);
      context.lineTo(this.width * this.blockSize + 1, y * this.blockSize + 1);
      context.stroke();
    }

    // Draw the placed pieces
    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        if (this.grid[row][col]) {
          context.fillStyle = this.grid[row][col];
          context.fillRect(
            col * this.blockSize + 1,
            row * this.blockSize + 1,
            this.blockSize,
            this.blockSize
          );
        }
      }
    }
  }

  private drawGameOver(context: CanvasRenderingContext2D) {
    if (!context) {
      return;
    }

    context.fillStyle = '#ff0000'; // Red color for the text
    context.font = '40px Arial'; // Set font size and style
    context.textAlign = 'center'; // Center the text horizontally
    context.textBaseline = 'middle'; // Center the text vertically

    // Draw "GAME OVER" in the center of the canvas
    context.fillText(
      'GAME OVER',
      (this.width * this.blockSize) / 2,
      (this.height * this.blockSize) / 2
    );
  }

  // Check if the current piece collides with the grid (e.g., the bottom or other pieces)
  checkCollision(): boolean {
    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (
          this.currentPiece.shape[row][col] === 1 &&
          (this.currentPiece.y + row >= this.height || // Hits the bottom
            this.grid[this.currentPiece.y + row]?.[this.currentPiece.x + col]) // Collides with other pieces
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // Place the current piece onto the board
  placePiece() {
    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col] === 1) {
          this.grid[this.currentPiece.y + row][this.currentPiece.x + col] =
            this.currentPiece.color;
        }
      }
    }
  }

  // Spawn a new piece at the top of the board
  spawnNewPiece() {
    this.currentPiece = new Piece(4, 0);
  }

  // Soft drop the current piece (move down)
  softDrop() {
    if (this.gameOver) {
      return;
    }
    this.currentPiece.moveDown();
    if (this.checkCollision()) {
      this.currentPiece.y -= 1; // Undo the move if a collision occurred
      this.placePiece();
      this.spawnNewPiece();
    }
  }

  hardDrop() {
    if (this.gameOver) {
      return;
    }
    const currentPieceBackup = this.currentPiece;
    while (currentPieceBackup === this.currentPiece) {
      this.softDrop();
    }
  }
}

class Piece {
  // Properties of the piece
  x: number;
  y: number;
  color: (typeof COLOURS)[number];
  shape: (typeof SHAPES)[number];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.color = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  }

  // Draw the piece on the canvas
  draw(context: CanvasRenderingContext2D, blockSize: number) {
    context.fillStyle = this.color;

    // Draw each block of the piece
    for (let row = 0; row < this.shape.length; row++) {
      for (let col = 0; col < this.shape[row].length; col++) {
        if (this.shape[row][col] === 1) {
          context.fillRect(
            (this.x + col) * blockSize + 1,
            (this.y + row) * blockSize + 1,
            blockSize,
            blockSize
          );
        }
      }
    }
  }

  // Move the piece down
  moveDown() {
    this.y += 1;
  }

  // Move the piece left
  moveLeft() {
    this.x -= 1;
  }

  // Move the piece right
  moveRight() {
    this.x += 1;
  }
}

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

// Create the game board
const board = new Board(BOARD_WIDTH, BOARD_HEIGHT, BLOCK_SIZE);

// Handle key presses to move the piece
function handleKeyPress(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowLeft':
      if (board.currentPiece.x > 0) {
        board.currentPiece.moveLeft();
      }
      break;
    case 'ArrowRight':
      if (board.currentPiece.x < BOARD_WIDTH - 2) {
        board.currentPiece.moveRight();
      }
      break;
    case 'ArrowDown':
      board.softDrop();
      break;
    case ' ':
      board.hardDrop();
  }
  draw(); // Redraw the board and piece
}

// Draw everything (board + piece)
function draw() {
  if (!context) {
    return;
  }
  board.draw(context);
}

// Set up event listener for keypress
document.addEventListener('keydown', handleKeyPress);

// Initial draw
draw();
