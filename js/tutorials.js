// بيانات الدروس المحدثة
const tutorials = {
    basics: {
        title: "Drawing Basics",
        difficulty: "Beginner",
        rating: 4.8,
        steps: [
            {
                title: "Getting Started",
                description: "Learn how to hold your drawing tools and set up your workspace.",
                image: "https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg",
                tips: [
                    "Hold your pencil lightly for better control",
                    "Keep your workspace clean and organized",
                    "Ensure good lighting for better visibility"
                ],
                exercise: {
                    type: "free",
                    hint: "Try drawing straight lines and circles"
                }
            },
            {
                title: "Basic Shapes",
                description: "Master drawing fundamental shapes: circles, squares, and triangles.",
                image: "https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg",
                tips: [
                    "Start with light, sketchy lines",
                    "Practice drawing shapes in different sizes",
                    "Focus on proportion and symmetry"
                ],
                exercise: {
                    type: "shapes",
                    target: ["circle", "square", "triangle"]
                }
            },
            {
                title: "Shading Techniques",
                description: "Learn different shading methods to add depth to your drawings.",
                image: "https://images.pexels.com/photos/6177607/pexels-photo-6177607.jpeg",
                tips: [
                    "Practice consistent pressure for even shading",
                    "Experiment with different pencil grades",
                    "Build up shadows gradually"
                ],
                exercise: {
                    type: "shading",
                    technique: "cross-hatching"
                }
            }
        ]
    },
    portraits: {
        title: "Portrait Drawing",
        difficulty: "Intermediate",
        rating: 4.6,
        steps: [
            {
                title: "Face Proportions",
                description: "Understanding the basic proportions of the human face.",
                image: "https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg",
                tips: [
                    "Start with basic guidelines",
                    "Divide the face into thirds",
                    "Pay attention to eye spacing"
                ],
                exercise: {
                    type: "proportions",
                    elements: ["eyes", "nose", "mouth"]
                }
            },
            {
                title: "Eyes and Expression",
                description: "Techniques for drawing realistic eyes and capturing expressions.",
                image: "https://images.pexels.com/photos/6976943/pexels-photo-6976943.jpeg",
                tips: [
                    "Observe light reflections in the eyes",
                    "Pay attention to eyelid structure",
                    "Add subtle details for realism"
                ],
                exercise: {
                    type: "eyes",
                    count: 2
                }
            },
            {
                title: "Hair and Texture",
                description: "Methods for drawing different hair types and textures.",
                image: "https://images.pexels.com/photos/7290715/pexels-photo-7290715.jpeg",
                tips: [
                    "Draw hair in sections, not individual strands",
                    "Focus on light and shadow patterns",
                    "Use varying line weights"
                ],
                exercise: {
                    type: "hair",
                    style: "curly"
                }
            }
        ]
    },
    landscapes: {
        title: "Landscape Drawing",
        difficulty: "Intermediate",
        rating: 4.7,
        steps: [
            {
                title: "Perspective Basics",
                description: "Understanding perspective in landscape drawing.",
                image: "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg",
                tips: [
                    "Establish your horizon line",
                    "Use perspective guidelines",
                    "Consider atmospheric perspective"
                ],
                exercise: {
                    type: "perspective",
                    lines: 3
                }
            },
            {
                title: "Trees and Vegetation",
                description: "Techniques for drawing various types of trees and plants.",
                image: "https://images.pexels.com/photos/5428277/pexels-photo-5428277.jpeg",
                tips: [
                    "Start with basic shapes",
                    "Layer foliage details",
                    "Vary your mark making"
                ],
                exercise: {
                    type: "trees",
                    count: 3
                }
            },
            {
                title: "Water and Reflections",
                description: "Methods for drawing water and creating realistic reflections.",
                image: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg",
                tips: [
                    "Observe water patterns",
                    "Keep reflections simple",
                    "Use horizontal strokes"
                ],
                exercise: {
                    type: "water",
                    effect: "reflection"
                }
            }
        ]
    },
    digital: {
        title: "Digital Art",
        difficulty: "Advanced",
        rating: 4.5,
        steps: [
            {
                title: "Layers Basics",
                description: "Learn how to use layers for complex artwork.",
                image: "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg",
                tips: [
                    "Use separate layers for sketch/colors",
                    "Adjust opacity for blending",
                    "Organize layers with names"
                ],
                exercise: {
                    type: "layers",
                    count: 3
                }
            }
        ]
    }
};

// عناصر واجهة المستخدم
const tutorialCategories = document.getElementById('tutorialCategories');
const tutorialContent = document.getElementById('tutorialContent');
const tutorialSteps = document.getElementById('tutorialSteps');
const progressBar = document.getElementById('progressBar');
const prevButton = document.getElementById('prevStep');
const nextButton = document.getElementById('nextStep');
const practiceCanvas = document.getElementById('practiceCanvas');
const clearCanvasBtn = document.getElementById('clearCanvas');
const savePracticeBtn = document.getElementById('savePractice');
const shareBtn = document.getElementById('shareBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const brushSizeBtn = document.getElementById('brushSizeBtn');
const brushSizeValue = document.getElementById('brushSizeValue');

// حالة التطبيق
let currentTutorial = null;
let currentStep = 0;
let currentTool = 'pencil';
let currentColor = '#000000';
let currentBrushSize = 5;
let drawingHistory = [];
let achievements = JSON.parse(localStorage.getItem('achievements')) || {};

// تهيئة لوحة الممارسة
function initPracticeCanvas() {
    const ctx = practiceCanvas.getContext('2d');
    
    function resizeCanvas() {
        const container = practiceCanvas.parentElement;
        practiceCanvas.width = container.clientWidth - 32;
        practiceCanvas.height = 500;
        redrawCanvas();
    }

    function redrawCanvas() {
        if (drawingHistory.length > 0) {
            ctx.putImageData(drawingHistory[drawingHistory.length - 1], 0, 0);
        }
    }

    // أحداث الرسم
    practiceCanvas.addEventListener('mousedown', startDrawing);
    practiceCanvas.addEventListener('mousemove', draw);
    practiceCanvas.addEventListener('mouseup', endDrawing);
    practiceCanvas.addEventListener('mouseout', endDrawing);

    // أحداث اللمس
    practiceCanvas.addEventListener('touchstart', handleTouch);
    practiceCanvas.addEventListener('touchmove', handleTouch);
    practiceCanvas.addEventListener('touchend', endDrawing);

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// وظائف الرسم
function startDrawing(e) {
    isDrawing = true;
    const pos = getPosition(e);
    const ctx = practiceCanvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // حفظ الحالة الأولية
    saveDrawingState();
}

function draw(e) {
    if (!isDrawing) return;
    
    const pos = getPosition(e);
    const ctx = practiceCanvas.getContext('2d');
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function endDrawing() {
    if (isDrawing) {
        isDrawing = false;
        saveDrawingState();
    }
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(
        e.type === 'touchstart' ? 'mousedown' : 'mousemove',
        {
            clientX: touch.clientX,
            clientY: touch.clientY
        }
    );
    practiceCanvas.dispatchEvent(mouseEvent);
}

function getPosition(e) {
    const rect = practiceCanvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (practiceCanvas.width / rect.width),
        y: (e.clientY - rect.top) * (practiceCanvas.height / rect.height)
    };
}

function saveDrawingState() {
    const ctx = practiceCanvas.getContext('2d');
    drawingHistory.push(ctx.getImageData(0, 0, practiceCanvas.width, practiceCanvas.height));
    
    // الحد الأقصى لسجل الرسم
    if (drawingHistory.length > 20) {
        drawingHistory.shift();
    }
}

// نظام الفلترة
function initFiltering() {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            renderTutorialCategories(category);
        });
    });
}

function renderTutorialCategories(filter = 'all') {
    tutorialCategories.innerHTML = '';
    
    Object.entries(tutorials).forEach(([id, tutorial]) => {
        if (filter !== 'all' && filter !== id) return;
        
        const tutorialCard = document.createElement('div');
        tutorialCard.className = 'bg-white rounded-lg shadow-lg overflow-hidden tutorial-category';
        tutorialCard.dataset.category = id;
        
        tutorialCard.innerHTML = `
            <img src="${tutorial.steps[0].image}" alt="${tutorial.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <div class="flex justify-between items-start mb-2">
                    <h2 class="text-2xl font-bold text-gray-900">${tutorial.title}</h2>
                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        ${tutorial.difficulty}
                    </span>
                </div>
                <div class="flex items-center mb-4">
                    ${renderStars(tutorial.rating)}
                    <span class="ml-1 text-gray-600">${tutorial.rating}</span>
                </div>
                <button onclick="showTutorial('${id}')" 
                        class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                    Start Learning
                </button>
            </div>
        `;
        
        tutorialCategories.appendChild(tutorialCard);
    });
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star text-yellow-400"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
        } else {
            stars += '<i class="far fa-star text-yellow-400"></i>';
        }
    }
    return stars;
}

// نظام الدروس
function showTutorial(tutorialId) {
    currentTutorial = tutorialId;
    currentStep = 0;
    tutorialContent.classList.remove('hidden');
    updateTutorialContent();
    scrollToElement(tutorialContent);
}

function updateTutorialContent() {
    const tutorial = tutorials[currentTutorial];
    const step = tutorial.steps[currentStep];
    const progress = ((currentStep + 1) / tutorial.steps.length) * 100;

    progressBar.style.width = `${progress}%`;

    tutorialSteps.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden tutorial-step">
            <img src="${step.image}" alt="${step.title}" class="w-full h-64 object-cover">
            <div class="p-6">
                <h3 class="text-2xl font-bold text-gray-900 mb-4">${step.title}</h3>
                <p class="text-gray-600 mb-6">${step.description}</p>
                
                ${step.exercise ? `
                <div class="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
                    <h4 class="font-semibold text-yellow-800 mb-2">Exercise:</h4>
                    <p class="text-yellow-700">Try to: ${getExerciseDescription(step.exercise)}</p>
                </div>
                ` : ''}
                
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 class="font-semibold text-blue-900 mb-2">Pro Tips:</h4>
                    <ul class="list-disc list-inside text-blue-800 space-y-2">
                        ${step.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

    prevButton.disabled = currentStep === 0;
    nextButton.disabled = currentStep === tutorial.steps.length - 1;
}

function getExerciseDescription(exercise) {
    switch(exercise.type) {
        case 'shapes': return `Draw ${exercise.target.join(', ')}`;
        case 'eyes': return `Draw ${exercise.count} eyes with expression`;
        case 'trees': return `Draw ${exercise.count} different trees`;
        case 'layers': return `Create ${exercise.count} layers`;
        default: return exercise.hint || 'Practice the technique shown above';
    }
}

function nextStep() {
    if (currentStep < tutorials[currentTutorial].steps.length - 1) {
        currentStep++;
        updateTutorialContent();
        scrollToElement(tutorialContent);
    } else {
        unlockAchievement(currentTutorial);
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        updateTutorialContent();
        scrollToElement(tutorialContent);
    }
}

// نظام الإنجازات
function unlockAchievement(tutorialId) {
    if (!achievements[tutorialId]) {
        achievements[tutorialId] = {
            unlocked: true,
            date: new Date().toISOString()
        };
        localStorage.setItem('achievements', JSON.stringify(achievements));
        showAchievement(tutorials[tutorialId].title);
    }
}

function showAchievement(title) {
    const badge = document.getElementById('achievementBadge');
    const achievementText = document.getElementById('achievementText');
    
    achievementText.textContent = `Completed: ${title}`;
    badge.classList.remove('hidden');
    
    setTimeout(() => {
        badge.classList.add('hidden');
    }, 5000);
}

// أدوات الرسم
function initTools() {
    // اختيار الأداة
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
        });
    });
    
    // اختيار اللون
    document.getElementById('practiceColor').addEventListener('input', (e) => {
        currentColor = e.target.value;
    });
    
    // حجم الفرشاة
    brushSizeBtn.addEventListener('click', () => {
        const newSize = prompt('Enter brush size (1-50):', currentBrushSize);
        if (newSize && !isNaN(newSize) && newSize >= 1 && newSize <= 50) {
            currentBrushSize = parseInt(newSize);
            brushSizeValue.textContent = currentBrushSize;
        }
    });
    
    // مسح اللوحة
    clearCanvasBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            const ctx = practiceCanvas.getContext('2d');
            ctx.clearRect(0, 0, practiceCanvas.width, practiceCanvas.height);
            drawingHistory = [];
        }
    });
    
    // حفظ الرسم
    savePracticeBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `novart-drawing-${new Date().toISOString().slice(0,10)}.png`;
        link.href = practiceCanvas.toDataURL();
        link.click();
    });
    
    // مشاركة الرسم
    shareBtn.addEventListener('click', shareDrawing);
}

async function shareDrawing() {
    try {
        const canvas = document.getElementById('practiceCanvas');
        const dataUrl = canvas.toDataURL();
        
        if (navigator.share) {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            
            await navigator.share({
                title: 'My NovArt Drawing',
                text: 'Check out what I drew!',
                files: [new File([blob], 'drawing.png', { type: 'image/png' })]
            });
        } else {
            // Fallback للحواسيب
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'novart-drawing.png';
            link.click();
        }
    } catch (err) {
        console.error('Error sharing:', err);
        alert('Sharing failed. You can save the drawing instead.');
    }
}

// وظائف مساعدة
function scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// تهيئة التطبيق
function initApp() {
    initPracticeCanvas();
    initTools();
    initFiltering();
    renderTutorialCategories();
    
    // أحداث التنقل
    prevButton.addEventListener('click', prevStep);
    nextButton.addEventListener('click', nextStep);
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', initApp);
