// Visitor ID Management
function generateVisitorId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MAGA-${timestamp}-${randomStr}`;
}

function getOrCreateVisitorId() {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
        visitorId = generateVisitorId();
        localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
}

// Multiplier System
const SPINS_FOR_MULTIPLIER = 10;
const HOUR_IN_MS = 3600000; // 1 hour in milliseconds

function getMultiplierData() {
    const defaultData = {
        multiplier: 1,
        lastSpinTime: Date.now(),
        hoursActive: 0,
        spinsThisHour: 0
    };
    
    const stored = localStorage.getItem('multiplierData');
    if (!stored) return defaultData;
    
    const data = JSON.parse(stored);
    const hoursSinceLastSpin = (Date.now() - data.lastSpinTime) / HOUR_IN_MS;
    
    // Reset spins count if more than an hour has passed
    if (hoursSinceLastSpin >= 1) {
        data.spinsThisHour = 0;
        data.hoursActive = Math.min(data.hoursActive + Math.floor(hoursSinceLastSpin), 24);
    }
    
    return data;
}

function updateMultiplier() {
    const data = getMultiplierData();
    data.lastSpinTime = Date.now();
    data.spinsThisHour++;
    
    // Check if we've hit the spins threshold for this hour
    if (data.spinsThisHour >= SPINS_FOR_MULTIPLIER) {
        data.multiplier = 2 * (1 + data.hoursActive);
    }
    
    localStorage.setItem('multiplierData', JSON.stringify(data));
    updateMultiplierDisplay(data.multiplier);
    return data.multiplier;
}

function updateMultiplierDisplay(multiplier) {
    const multiplierElement = document.getElementById('current-multiplier');
    multiplierElement.textContent = `${multiplier}x`;
}

// Spin Counter Management
function getSpinCount() {
    return parseInt(localStorage.getItem('spinCount') || '0');
}

function incrementSpinCount() {
    const currentCount = getSpinCount();
    const multiplier = updateMultiplier();
    const pointsToAdd = multiplier;
    const newCount = currentCount + pointsToAdd;
    
    localStorage.setItem('spinCount', newCount.toString());
    updateSpinCountDisplay();
    return newCount;
}

function updateSpinCountDisplay() {
    const spinCountElement = document.getElementById('spin-count');
    spinCountElement.textContent = getSpinCount();
}

// Set initial values
document.getElementById('id-number').textContent = getOrCreateVisitorId();
updateSpinCountDisplay();
updateMultiplierDisplay(getMultiplierData().multiplier);

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const resultDiv = document.getElementById('result');
const trumpPopup = document.getElementById('trump-popup');

const BURST_EMOJIS = ['🇺🇸', '🎉', '🦅', '🚀', '🎈'];

function createEmojiBurst(x, y) {
    const emoji = BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)];
    const burstElement = document.createElement('div');
    burstElement.className = 'emoji-burst';
    burstElement.textContent = emoji;
    burstElement.style.left = `${x}px`;
    burstElement.style.top = `${y}px`;
    document.body.appendChild(burstElement);
    
    // Remove the element after animation
    setTimeout(() => {
        burstElement.remove();
    }, 1000);
}

// Wheel segments configuration
const segments = [
    { text: 'Trump', color: '#FF0000' },
    { text: 'Lost', color: '#0000FF' },
    { text: 'Liberal', color: '#00FF00' },
    { text: 'Nancy Pelosi', color: '#FF00FF' },
    { text: 'Milady', color: '#FFFF00' },
    { text: 'Anatoly', color: '#00FFFF' },
    { text: 'Trump Jr', color: '#FF8800' },
    { text: 'Melania', color: '#8800FF' }
];

let currentRotation = 0;
let isSpinning = false;
let currentSpinSpeed = 0;
let spinBoostCount = 0;

function showTrumpCelebration() {
    trumpPopup.classList.add('active');
    setTimeout(() => {
        trumpPopup.classList.remove('active');
    }, 3000);
}

function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const segmentAngle = (2 * Math.PI) / segments.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    segments.forEach((segment, i) => {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, i * segmentAngle + currentRotation, (i + 1) * segmentAngle + currentRotation);
        ctx.closePath();
        
        ctx.fillStyle = segment.color;
        ctx.fill();
        ctx.stroke();
        
        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(i * segmentAngle + segmentAngle / 2 + currentRotation);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(segment.text, radius - 20, 5);
        ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.stroke();
}

function spin(event) {
    // Increment spin count
    const currentSpins = incrementSpinCount();
    
    // Create emoji burst at button location
    const rect = spinBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    createEmojiBurst(centerX, centerY);
    
    spinBoostCount++;
    const baseSpeed = 8; // Base number of rotations
    const speedBoost = Math.min(spinBoostCount * 2, 8); // Max 8 additional rotations
    const totalRotations = baseSpeed + speedBoost + Math.random() * 4;
    
    if (!isSpinning) {
        startNewSpin(totalRotations);
    } else {
        boostCurrentSpin(totalRotations);
    }
    
    // Update button text to show boost count
    spinBtn.textContent = `SPIN FASTER! (${spinBoostCount}x)`;
}

function startNewSpin(totalRotations) {
    isSpinning = true;
    spinBoostCount = 1;
    const spinDuration = 5000; // 5 seconds
    const startTime = Date.now();
    const startRotation = currentRotation;
    const endRotation = startRotation + (totalRotations * 2 * Math.PI);
    
    animate(startTime, startRotation, endRotation, spinDuration);
}

function boostCurrentSpin(additionalRotations) {
    const currentTime = Date.now();
    const remainingRotation = additionalRotations * 2 * Math.PI;
    const boostDuration = 3000; // 3 seconds for boost
    
    animate(currentTime, currentRotation, currentRotation + remainingRotation, boostDuration);
}

function animate(startTime, startRotation, endRotation, duration) {
    function step() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth deceleration
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        
        currentRotation = startRotation + (endRotation - startRotation) * easeOut(progress);
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            isSpinning = false;
            spinBtn.textContent = 'SPIN';
            spinBoostCount = 0;
            
            // Calculate winner
            const normalizedRotation = currentRotation % (2 * Math.PI);
            const segmentAngle = (2 * Math.PI) / segments.length;
            const winningIndex = Math.floor(((2 * Math.PI) - normalizedRotation) / segmentAngle) % segments.length;
            
            const winner = segments[winningIndex].text;
            if (winner === 'Trump') {
                resultDiv.textContent = `Winner: ${winner}!`;
                showTrumpCelebration();
            } else {
                resultDiv.textContent = '🦅 🇺🇸 Spin Again Patriot! 🇺🇸 🦅';
            }
        }
    }
    
    step();
}

// Initial draw
drawWheel();

// Event listeners
spinBtn.addEventListener('click', spin);

// Close popup when clicked
trumpPopup.addEventListener('click', () => {
    trumpPopup.classList.remove('active');
});
