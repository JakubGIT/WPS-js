function shuffleArray<T extends unknown[]>(arr: T) {
  for (let i = arr.length - 1; i > 0; i--) {
    // Random index from 0 to i
    const randomIndex = Math.floor(Math.random() * (i + 1));

    // Swap elements at index i and randomIndex
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }
  return arr;
}

const COLOURS = [
  '#ffb3ba',
  '#ffdfba',
  '#ffffba',
  '#baffc9',
  '#bae1ff',
] as const;

const SHAPES = [
  // Shape 1: Square (no change in rotations)
  [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],

  // Shape 2: F-Shape
  [
    [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
    ],
  ],

  // Shape 3: Z-Shape
  [
    [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    [
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    [
      [0, 1, 1],
      [1, 1, 0],
    ],
  ],

  // Shape 4: K
  [
    [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    [
      [1, 1, 1],
      [0, 1, 0],
    ],
  ],

  // Shape 5: L-Shape
  [
    [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
    [
      [0, 0, 1],
      [1, 1, 1],
    ],
  ],

  // Shape 6: Reverse Z-Shape
  [
    [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
  ],

  // Shape 7: Line (I-Shape)
  [[[1], [1], [1], [1]], [[1, 1, 1, 1]], [[1], [1], [1], [1]], [[1, 1, 1, 1]]],
] as const;

const GRAVITY_SPEED_IN_MS = 1000;
const LEVEL_DECREASE_IN_MS = 400;
const MAX_SPEED_IN_MS = 100;

const penalties: { true: ''[]; false: ''[] } = {
  true: [],
  false: [],
};

class Board {
  width: number;
  height: number;
  grid: ((typeof COLOURS)[number] | '')[][];
  blockSize: number;
  currentPiece: Piece;
  gameOver = false;
  private removedRows = 0;
  private interval: number | undefined;
  private shapesIndexes: number[] = shuffleArray(
    Array.from({ length: SHAPES.length }, (_, i) => i)
  );
  score = 0;

  constructor(
    width: number,
    height: number,
    blockSize: number,
    private readonly context: CanvasRenderingContext2D,
    private readonly id: boolean
  ) {
    this.width = width;
    this.height = height;
    this.blockSize = blockSize;
    this.grid = Array.from({ length: height }, () => Array(width).fill(''));
    this.currentPiece = new Piece(4, 0, this.getNewShape());
  }

  private getNewShape = (): (typeof SHAPES)[number] => {
    const nextIndex = this.shapesIndexes.pop();

    if (nextIndex !== undefined) {
      return SHAPES[nextIndex];
    }

    this.shapesIndexes = shuffleArray(
      Array.from({ length: SHAPES.length }, (_, i) => i)
    );

    return SHAPES[this.shapesIndexes.pop()!];
  };

  // Draw the grid and the current piece
  draw() {
    // Draw the grid with borders
    this.drawGrid(this.context);

    if (this.checkCollision()) {
      this.gameOver = true;
      this.drawGameOver(this.context);
      // TODO: render only a part of the piece to avoid overlapping
    }

    // Draw the current piece
    this.currentPiece.draw(this.context, this.blockSize);
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
    const shape = this.currentPiece.getCurrentShape();
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (
          shape[row][col] === 1 &&
          (this.currentPiece.x + col >= this.width || // Right side out of bounds
            this.currentPiece.y + row >= this.height || // Hits the bottom
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
    for (let row = 0; row < this.currentPiece.getCurrentShape().length; row++) {
      for (
        let col = 0;
        col < this.currentPiece.getCurrentShape()[row].length;
        col++
      ) {
        if (this.currentPiece.getCurrentShape()[row][col] === 1) {
          this.grid[this.currentPiece.y + row][this.currentPiece.x + col] =
            this.currentPiece.color;
        }
      }
    }
    this.clearFullGridLines();
  }

  // Spawn a new piece at the top of the board
  spawnNewPiece() {
    let myPenalties = [];
    if (this.id) {
      myPenalties = penalties.true;
    } else {
      myPenalties = penalties.false;
    }
    while (myPenalties.pop() !== undefined) {
      this.addPenaltyLine();
    }
    this.currentPiece = new Piece(4, 0, this.getNewShape());
  }

  // Soft drop the current piece (move down)
  softDrop = (gravity?: boolean) => {
    if (this.gameOver) {
      return;
    }
    if (!gravity) {
      this.restartInterval();
    }
    this.currentPiece.moveDown();
    if (this.checkCollision()) {
      this.currentPiece.y -= 1; // Undo the move if a collision occurred
      this.placePiece();
      this.spawnNewPiece();
    }
  };

  hardDrop() {
    if (this.gameOver) {
      return;
    }
    const currentPieceBackup = this.currentPiece;
    while (currentPieceBackup === this.currentPiece) {
      this.softDrop();
    }
  }

  rotate() {
    if (this.gameOver) {
      return;
    }
    this.currentPiece.rotate(true);
    if (!this.checkCollision()) {
      return;
    }
    // try move right
    for (let i = 0; i < 3; ++i) {
      this.currentPiece.moveRight();
      if (!this.checkCollision()) {
        return;
      }
    }
    // undo moving right
    for (let i = 0; i < 3; ++i) {
      this.currentPiece.moveLeft();
    }
    // try move left
    for (let i = 0; i < 3; ++i) {
      this.currentPiece.moveLeft();
      if (!this.checkCollision()) {
        return;
      }
    }
    // undo moving left
    for (let i = 0; i < 3; ++i) {
      this.currentPiece.moveRight();
    }

    // no chance, undo
    this.currentPiece.rotate(false);
  }

  movePieceLeft() {
    if (this.gameOver || this.currentPiece.x <= 0) {
      return;
    }
    this.currentPiece.moveLeft();
    if (this.checkCollision()) {
      this.currentPiece.moveRight(); // Undo the movement
    }
  }
  movePieceRight() {
    if (this.gameOver || this.currentPiece.x >= this.width) {
      return;
    }
    this.currentPiece.moveRight();
    if (this.checkCollision()) {
      this.currentPiece.moveLeft(); // Undo the movement
    }
  }

  restartInterval = () => {
    clearInterval(this.interval);
    this.interval = setInterval(
      this.applyGravity,
      Math.max(
        GRAVITY_SPEED_IN_MS -
          Math.floor(this.removedRows / 10) * LEVEL_DECREASE_IN_MS,
        MAX_SPEED_IN_MS
      )
    );
  };

  pushPenaltyLine = () => {
    if (this.id) {
      penalties.false.push('');
    } else {
      penalties.true.push('');
    }
  };

  clearFullGridLines() {
    const nonFullRows = this.grid.filter((row) => row.includes(''));

    const newRowCount = this.grid.length - nonFullRows.length;

    let limit = 0;

    switch (newRowCount) {
      case 1:
        this.score += 40;
        break;
      case 2:
        this.score += 100;
        limit = 1;
        break;
      case 3:
        this.score += 300;
        limit = 2;
        break;
      case 4:
        this.score += 1200;
        limit = 4;
    }

    for (let i = 0; i < limit; ++i) {
      this.pushPenaltyLine();
    }

    this.removedRows += newRowCount;
    this.restartInterval();

    const newRow = new Array(this.grid[0].length).fill(''); // Create a new row filled with 0's
    for (let i = 0; i < newRowCount; i++) {
      nonFullRows.unshift(newRow); // Add the new row at the beginning
    }
    this.grid = nonFullRows;
  }

  getLevel() {
    return this.removedRows;
  }

  applyGravity = () => {
    this.softDrop(true);
    this.draw();
  };

  startGravity() {
    this.interval = setInterval(this.applyGravity, GRAVITY_SPEED_IN_MS);
  }

  addPenaltyLine = () => {
    this.grid.shift();
    const newRow: ((typeof COLOURS)[number] | '')[] = [];
    const randomHoleIndex = Math.floor(Math.random() * this.grid[0].length);
    for (let i = 0; i < this.grid[0].length; i++) {
      if (i === randomHoleIndex) {
        newRow.push('');
      } else {
        newRow.push(COLOURS[Math.floor(Math.random() * COLOURS.length)]);
      }
    }
    this.grid.push(newRow);
  };
}

class Piece {
  // Properties of the piece
  x: number;
  y: number;
  color: (typeof COLOURS)[number];

  private rotation: number = 0;

  constructor(
    x: number,
    y: number,
    private readonly shape: (typeof SHAPES)[number]
  ) {
    this.x = x;
    this.y = y;
    this.color = COLOURS[Math.floor(Math.random() * COLOURS.length)];
  }

  getCurrentShape = () => this.shape[this.rotation];

  // Draw the piece on the canvas
  draw(context: CanvasRenderingContext2D, blockSize: number) {
    context.fillStyle = this.color;

    // Draw each block of the piece
    for (let row = 0; row < this.shape[this.rotation].length; row++) {
      for (let col = 0; col < this.shape[this.rotation][row].length; col++) {
        if (this.getCurrentShape()[row][col] === 1) {
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

  rotate(clockwise: boolean) {
    this.rotation = (this.rotation + (clockwise ? 1 : -1) + 4) % 4;
  }
}

// Get the canvas element and its context
const myCanvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const myContext = myCanvas.getContext('2d');
const yourCanvas = document.getElementById('yourCanvas') as HTMLCanvasElement;
const yourContext = yourCanvas.getContext('2d');

if (!myContext || !yourContext) {
  throw new Error('fuck');
}

// Set up constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30; // Size of each block in pixels

// Set canvas dimensions based on the board size
myCanvas.width = BOARD_WIDTH * BLOCK_SIZE + 2; // Extra space for border
myCanvas.height = BOARD_HEIGHT * BLOCK_SIZE + 2; // Extra space for border
yourCanvas.width = BOARD_WIDTH * BLOCK_SIZE + 2; // Extra space for border
yourCanvas.height = BOARD_HEIGHT * BLOCK_SIZE + 2; // Extra space for border

// Create the game board
const myBoard = new Board(
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BLOCK_SIZE,
  myContext,
  true
);
const yourBoard = new Board(
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BLOCK_SIZE,
  yourContext,
  false
);

// Handle key presses to move the piece
function handleKeyPress(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowLeft':
      myBoard.movePieceLeft();
      break;
    case 'ArrowRight':
      myBoard.movePieceRight();

      break;
    case 'ArrowDown':
      myBoard.softDrop();
      break;
    case 'ArrowUp':
      myBoard.rotate();
      break;
    case ' ':
      myBoard.hardDrop();
      break;

    case 'a':
      yourBoard.movePieceLeft();
      break;
    case 'd':
      yourBoard.movePieceRight();

      break;
    case 's':
      yourBoard.softDrop();
      break;
    case 'w':
      yourBoard.rotate();
      break;
    case 'f':
      yourBoard.hardDrop();
      break;
  }
  draw(); // Redraw the board and piece
}

// Draw everything (board + piece)
function draw() {
  myBoard.draw();
  yourBoard.draw();

  document.getElementById('myScore')!.innerText = `Score: ${myBoard.score}`;
  document.getElementById('yourScore')!.innerText = `Score: ${yourBoard.score}`;
}

// Set up event listener for keypress
document.addEventListener('keydown', handleKeyPress);

myBoard.startGravity();
yourBoard.startGravity();
