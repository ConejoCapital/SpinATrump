const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const resultDiv = document.getElementById('result');
const trumpPopup = document.getElementById('trump-popup');

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

function spin() {
    if (isSpinning) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    resultDiv.textContent = '';
    
    const spinDuration = 5000; // 5 seconds
    const startTime = Date.now();
    const startRotation = currentRotation;
    const totalRotations = 8 + Math.random() * 4; // Between 8 and 12 rotations
    const endRotation = startRotation + (totalRotations * 2 * Math.PI);
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Easing function for smooth deceleration
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);
        
        currentRotation = startRotation + (endRotation - startRotation) * easeOut(progress);
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            spinBtn.disabled = false;
            
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
    
    animate();
}

// Initial draw
drawWheel();

// Event listeners
spinBtn.addEventListener('click', spin);

// Close popup when clicked
trumpPopup.addEventListener('click', () => {
    trumpPopup.classList.remove('active');
});
