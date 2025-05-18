const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('textInput');

let isDrawing = false;
let isWriting = false;
let lastX = 0;
let lastY = 0;
let shapeStartX = 0;
let shapeStartY = 0;
let shapeStyle = 'fill';

const history = [];
let historyIndex = -1;
const maxHistory = 20;

let currentTool = 'pencil';
let currentColor = '#000000';
let currentSize = 5;
let currentFont = '16px Poppins';

const toolButtons = document.querySelectorAll('.tool-btn');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const clearBtn = document.getElementById('clear');
const saveBtn = document.getElementById('save');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');

const toolShortcuts = {
    'p': 'pencil',
    'b': 'brush',
    'm': 'marker',
    'e': 'eraser',
    's': 'spray',
    't': 'text',
    'g': 'bucket',
    'r': 'rectangle',
    'c': 'circle',
    'l': 'line',
    'a': 'arrow'
};

let pixelStack = [];
const tolerance = 32;

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function getPixelColor(x, y) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return rgbToHex(pixel[0], pixel[1], pixel[2]);
}

function floodFill(x, y, targetColor, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const targetRgb = hexToRgb(targetColor);
    const fillRgb = hexToRgb(fillColor);
    
    const getPixelIndex = (x, y) => (y * canvas.width + x) * 4;
    const matchColor = (pixelIndex) => {
        const r = pixels[pixelIndex];
        const g = pixels[pixelIndex + 1];
        const b = pixels[pixelIndex + 2];
        const a = pixels[pixelIndex + 3];
        
        return (
            Math.abs(r - targetRgb.r) <= tolerance &&
            Math.abs(g - targetRgb.g) <= tolerance &&
            Math.abs(b - targetRgb.b) <= tolerance &&
            a > 0
        );
    };
    
    const pixelIndex = getPixelIndex(Math.round(x), Math.round(y));
    if (!matchColor(pixelIndex)) return;
    
    pixelStack.push([x, y]);
    const width = canvas.width;
    const height = canvas.height;
    
    while (pixelStack.length) {
        const [x, y] = pixelStack.pop();
        const currentPixel = getPixelIndex(Math.round(x), Math.round(y));
        
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        if (!matchColor(currentPixel)) continue;
        
        pixels[currentPixel] = fillRgb.r;
        pixels[currentPixel + 1] = fillRgb.g;
        pixels[currentPixel + 2] = fillRgb.b;
        pixels[currentPixel + 3] = 255;
        
        pixelStack.push([x + 1, y]);
        pixelStack.push([x - 1, y]);
        pixelStack.push([x, y + 1]);
        pixelStack.push([x, y - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function adjustBrushSize(increase) {
    let newSize = increase ? currentSize + 1 : currentSize - 1;
    newSize = Math.max(1, Math.min(50, newSize));
    if (newSize !== currentSize) {
        currentSize = newSize;
        brushSize.value = currentSize;
        brushSizeValue.textContent = `${currentSize}px`;
    }
}

function startDrawing(e) {
    if (currentTool === 'text') {
        startTextInput(e);
        return;
    }
    
    if (currentTool === 'bucket') {
        const [x, y] = getPosition(e);
        const pixelColor = getPixelColor(x, y);
        floodFill(x, y, pixelColor, currentColor);
        saveState();
        return;
    }
    
    isDrawing = true;
    [shapeStartX, shapeStartY] = getPosition(e);
    
    if (!['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)) {
        [lastX, lastY] = [shapeStartX, shapeStartY];
        ctx.beginPath();
    }
    
    saveState();
}

function draw(e) {
    if (!isDrawing) return;
    
    if (['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)) {
        drawShape(e);
        return;
    }

    const [x, y] = getPosition(e);
    
    switch(currentTool) {
        case 'pencil':
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = currentSize;
            ctx.strokeStyle = currentColor;
            ctx.lineCap = 'round';
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
        case 'brush':
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = currentSize * 2;
            ctx.strokeStyle = currentColor;
            ctx.lineCap = 'round';
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
        case 'marker':
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = currentSize * 1.5;
            ctx.strokeStyle = `${currentColor}80`;
            ctx.lineCap = 'square';
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
        case 'eraser':
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = currentSize * 2;
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.lineCap = 'round';
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
        case 'spray':
            sprayPaint(x, y);
            break;
    }

    [lastX, lastY] = [x, y];
}

function drawShape(e) {
    if (!isDrawing) return;
    
    const [x, y] = getPosition(e);
    
    if (historyIndex >= 0) {
        ctx.putImageData(history[historyIndex], 0, 0);
    }
    
    ctx.beginPath();
    ctx.lineWidth = currentSize;
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    
    switch(currentTool) {
        case 'rectangle':
            if (shapeStyle === 'fill') {
                ctx.fillRect(shapeStartX, shapeStartY, x - shapeStartX, y - shapeStartY);
            } else {
                ctx.strokeRect(shapeStartX, shapeStartY, x - shapeStartX, y - shapeStartY);
            }
            break;
            
        case 'circle':
            const radius = Math.sqrt(Math.pow(x - shapeStartX, 2) + Math.pow(y - shapeStartY, 2));
            ctx.arc(shapeStartX, shapeStartY, radius, 0, Math.PI * 2);
            if (shapeStyle === 'fill') {
                ctx.fill();
            } else {
                ctx.stroke();
            }
            break;
            
        case 'line':
            ctx.moveTo(shapeStartX, shapeStartY);
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
            
        case 'arrow':
            drawArrow(shapeStartX, shapeStartY, x, y);
            break;
    }
}

function drawArrow(fromX, fromY, toX, toY) {
    const headLength = currentSize * 3;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineWidth = currentSize;
    ctx.strokeStyle = currentColor;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineWidth = currentSize;
    ctx.strokeStyle = currentColor;
    ctx.stroke();
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        
        if (['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)) {
            saveState();
        }
    }
}

function startTextInput(e) {
    const [x, y] = getPosition(e);
    textInput.style.display = 'block';
    textInput.style.left = `${x}px`;
    textInput.style.top = `${y}px`;
    textInput.style.fontSize = `${currentSize}px`;
    textInput.style.color = currentColor;
    textInput.focus();
    
    textInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            addTextToCanvas(x, y, textInput.value);
            textInput.value = '';
            textInput.style.display = 'none';
        } else if (e.key === 'Escape') {
            textInput.value = '';
            textInput.style.display = 'none';
        }
    };
}

function addTextToCanvas(x, y, text) {
    ctx.font = currentFont;
    ctx.fillStyle = currentColor;
    ctx.fillText(text, x, y);
    saveState();
}

function sprayPaint(x, y) {
    ctx.globalCompositeOperation = 'source-over';
    const density = currentSize * 5;
    for (let i = 0; i < density; i++) {
        const radius = Math.random() * currentSize;
        const angle = Math.random() * Math.PI * 2;
        const sprayX = x + Math.cos(angle) * radius;
        const sprayY = y + Math.sin(angle) * radius;
        ctx.fillStyle = currentColor;
        ctx.fillRect(sprayX, sprayY, 1, 1);
    }
}

function saveAs(format) {
    if (confirm("هل تريد حفظ الرسمة في السحابة؟")) {
        saveToFirebase(format);
    } else {
        const link = document.createElement('a');
        link.download = `drawing.${format}`;
        const quality = 0.92;
        
        switch(format) {
            case 'png':
                link.href = canvas.toDataURL('image/png');
                break;
            case 'jpg':
                link.href = canvas.toDataURL('image/jpeg', quality);
                break;
            case 'webp':
                link.href = canvas.toDataURL('image/webp', quality);
                break;
            default:
                link.href = canvas.toDataURL();
        }
        link.click();
    }
}

document.addEventListener('keydown', (e) => {
    if (textInput.style.display === 'block') return;

    if (!e.ctrlKey && !e.metaKey && toolShortcuts[e.key]) {
        e.preventDefault();
        const toolId = toolShortcuts[e.key];
        document.getElementById(toolId).click();
    }
    
    if (e.key === '[') {
        e.preventDefault();
        adjustBrushSize(false);
    } else if (e.key === ']') {
        e.preventDefault();
        adjustBrushSize(true);
    }
    
    if (e.key === 'f') {
        e.preventDefault();
        document.getElementById('fillShape').click();
    } else if (e.key === 'k') {
        e.preventDefault();
        document.getElementById('strokeShape').click();
    }
    
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'z':
                e.preventDefault();
                undoBtn.click();
                break;
            case 'y':
                e.preventDefault();
                redoBtn.click();
                break;
            case 's':
                e.preventDefault();
                saveBtn.click();
                break;
        }
    } else if (e.key === 'Delete' || e.key === 'Del') {
        e.preventDefault();
        clearBtn.click();
    }
    
    if (e.key === 'Escape') {
        if (isDrawing) {
            isDrawing = false;
            if (historyIndex >= 0) {
                ctx.putImageData(history[historyIndex], 0, 0);
            }
        }
    }
});

function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return [
        (e.clientX || e.touches[0].clientX) - rect.left,
        (e.clientY || e.touches[0].clientY) - rect.top
    ];
}

function saveState() {
    history.splice(historyIndex + 1);
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (history.length > maxHistory) history.shift();
    historyIndex = history.length - 1;
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
}

function init() {
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth - 32;
        canvas.height = window.innerHeight * 0.7;
        if (history.length > 0) ctx.putImageData(history[historyIndex], 0, 0);
    }

    function setupEvents() {
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startDrawing(e.touches[0]);
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            draw(e.touches[0]);
        }, { passive: false });
        
        canvas.addEventListener('touchend', stopDrawing);

        toolButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                toolButtons.forEach(b => b.classList.remove('tool-active'));
                btn.classList.add('tool-active');
                currentTool = btn.id;
                
                if (currentTool === 'text') {
                    canvas.style.cursor = 'text';
                } else if (currentTool === 'bucket') {
                    canvas.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"%23000\" d=\"M19 11h-2V9h2v2m0-4h-2V3h2v4m-4 0h-2V3h2v4m-4 0h-2V3h2v4m6 8h-2v-2h2v2m-4 0h-2v-2h2v2m-4 0h-2v-2h2v2m-4 0H7v-2h2v2m-4 0H3v-2h2v2m16 4h-2v-2h2v2m-4 0h-2v-2h2v2m-4 0h-2v-2h2v2m-4 0H7v-2h2v2m-4 0H3v-2h2v2m4-12H5V3h2v4m12 12h-2v-2h2v2m-4 0h-2v-2h2v2m-4 0h-2v-2h2v2m-4 0H7v-2h2v2m-4 0H3v-2h2v2m16-8h-2V7h2v2m-4 0h-2V7h2v2m-4 0h-2V7h2v2m-4 0H7V7h2v2m-4 0H3V7h2v2z\"/></svg>') 0 24, auto";
                } else {
                    canvas.style.cursor = 'crosshair';
                }
            });
        });

        document.getElementById('fillShape').addEventListener('click', () => {
            shapeStyle = 'fill';
            document.getElementById('fillShape').classList.add('tool-active');
            document.getElementById('strokeShape').classList.remove('tool-active');
        });

        document.getElementById('strokeShape').addEventListener('click', () => {
            shapeStyle = 'stroke';
            document.getElementById('strokeShape').classList.add('tool-active');
            document.getElementById('fillShape').classList.remove('tool-active');
        });

        colorPicker.addEventListener('input', (e) => {
            currentColor = e.target.value;
        });

        brushSize.addEventListener('input', (e) => {
            currentSize = parseInt(e.target.value);
            brushSizeValue.textContent = `${currentSize}px`;
        });

        undoBtn.addEventListener('click', () => {
            if (historyIndex > 0) {
                historyIndex--;
                ctx.putImageData(history[historyIndex], 0, 0);
                updateUndoRedoButtons();
            }
        });

        redoBtn.addEventListener('click', () => {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                ctx.putImageData(history[historyIndex], 0, 0);
                updateUndoRedoButtons();
            }
        });

        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the canvas?')) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                saveState();
            }
        });

        document.getElementById('savePng').addEventListener('click', () => saveAs('png'));
        document.getElementById('saveJpg').addEventListener('click', () => saveAs('jpg'));
        document.getElementById('saveWebp').addEventListener('click', () => saveAs('webp'));
        document.getElementById('saveSvg').addEventListener('click', () => saveAs('svg'));
        saveBtn.addEventListener('click', () => saveAs('png'));
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupEvents();
    saveState();
}

window.addEventListener('DOMContentLoaded', init);
