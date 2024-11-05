// Get the canvas element and its context
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

// Ensure canvas size is set
canvas.width = 500;
canvas.height = 500;

// Function to draw a rectangle
function drawRectangle() {
    if (ctx) {
        ctx.fillStyle = 'skyblue';
        ctx.fillRect(100, 100, 300, 300);
    }
}

// Call the drawRectangle function
drawRectangle();