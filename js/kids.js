
// Canvas and Context
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// Drawing State
let isDrawing = false;
let currentColor = '#ef4444'; // Default red color
let currentSize = 20;
let lastX = 0;
let lastY = 0;

// Drawing History
const history = [];
let historyIndex = -1;
const maxHistory = 10;

// UI Elements
const drawingArea = document.getElementById('drawingArea');
const templatesSection = document.getElementById('templates');
const colorButtons = document.querySelectorAll('.color-btn');
const brushSize = document.getElementById('brushSize');
const eraserBtn = document.getElementById('eraser');
const undoBtn = document.getElementById('undo');
const saveBtn = document.getElementById('save');
const newBtn = document.getElementById('new');

// Template Image
let templateImage = new Image();
let isTemplate = false;

// Initialize Canvas
function initCanvas() {
    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth - 32; // Adjust for padding
        canvas.height = window.innerHeight * 0.6; // 60% of viewport height

        // Redraw template and history if exists
        if (isTemplate) {
            drawTemplate();
        }
        if (history.length > 0 && historyIndex >= 0) {
            ctx.putImageData(history[historyIndex], 0, 0);
        }
    }

    // Initial resize
    resizeCanvas();

    // Resize canvas when window is resized
    window.addEventListener('resize', resizeCanvas);
}

// Template Functions
function loadTemplate(imageUrl) {
    templateImage.src = imageUrl;
    templateImage.onload = () => {
        isTemplate = true;
        templatesSection.classList.add('hidden');
        drawingArea.classList.remove('hidden');
        
        // Initialize canvas after template is loaded
        initCanvas();
        drawTemplate();
        saveState(); // Save initial state
    };
}

function drawTemplate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw template image maintaining aspect ratio
    const scale = Math.min(
        canvas.width / templateImage.width,
        canvas.height / templateImage.height
    );
    
    const x = (canvas.width - templateImage.width * scale) / 2;
    const y = (canvas.height - templateImage.height * scale) / 2;
    
    ctx.drawImage(
        templateImage,
        x, y,
        templateImage.width * scale,
        templateImage.height * scale
    );
}

// Drawing Functions
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getMousePos(e);
}

function draw(e) {
    if (!isDrawing) return;

    const [x, y] = getMousePos(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    
    // Set drawing style
    if (eraserBtn.classList.contains('active')) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = '#000000';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
    }
    
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.lineTo(x, y);
    ctx.stroke();

    [lastX, lastY] = [x, y];
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveState();
    }
}

// Helper Functions
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return [
        (e.clientX - rect.left) * (canvas.width / rect.width),
        (e.clientY - rect.top) * (canvas.height / rect.height)
    ];
}

function saveState() {
    // Remove any redo states
    history.splice(historyIndex + 1);
    
    // Add current state to history
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    // Remove oldest state if exceeding maxHistory
    if (history.length > maxHistory) {
        history.shift();
    }
    
    historyIndex = history.length - 1;
    
    // Update undo button
    undoBtn.disabled = historyIndex <= 0;
}

// Event Listeners
function initEventListeners() {
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e.touches[0]);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e.touches[0]);
    });
    canvas.addEventListener('touchend', stopDrawing);

    // Color selection
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            colorButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Set current color
            currentColor = btn.dataset.color;
            // Deactivate eraser
            eraserBtn.classList.remove('active');
        });
    });

    // Brush size
    brushSize.addEventListener('input', (e) => {
        currentSize = parseInt(e.target.value);
    });

    // Eraser
    eraserBtn.addEventListener('click', () => {
        eraserBtn.classList.toggle('active');
        // Deactivate color buttons if eraser is active
        if (eraserBtn.classList.contains('active')) {
            colorButtons.forEach(btn => btn.classList.remove('active'));
        } else {
            // Reactivate last color
            const lastColorBtn = document.querySelector(`[data-color="${currentColor}"]`);
            if (lastColorBtn) lastColorBtn.classList.add('active');
        }
    });

    // Undo
    undoBtn.addEventListener('click', () => {
        if (historyIndex > 0) {
            historyIndex--;
            ctx.putImageData(history[historyIndex], 0, 0);
            undoBtn.disabled = historyIndex <= 0;
        }
    });

    // Save drawing
    saveBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'my-coloring.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    // New picture
    newBtn.addEventListener('click', () => {
        if (confirm('Start a new picture? Your current drawing will not be saved!')) {
            drawingArea.classList.add('hidden');
            templatesSection.classList.remove('hidden');
            isTemplate = false;
            history.length = 0;
            historyIndex = -1;
        }
    });

    // Add fun sound effects
    const drawSound = new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==');
    canvas.addEventListener('mousedown', () => {
        drawSound.currentTime = 0;
        drawSound.play().catch(() => {}); // Ignore autoplay restrictions
    });
}

// Initialize everything
function init() {
    try {
        initEventListeners();
    } catch (error) {
        console.error('Error initializing kids drawing app:', error);
        alert('Oops! Something went wrong. Please try refreshing the page!');
    }
}

// Start the application
init();
