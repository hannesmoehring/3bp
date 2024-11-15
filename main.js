const canvas = document.getElementById('simulation');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const popup = document.getElementById('popup');
const startButton = document.getElementById('start-button');

console.log("Script loaded");

const G = 6.67430e-11;
let isRunning = false;
let animationFrame;

const bodies = [
  { x: 300, y: 300, vx: 0, vy: 0.2, mass: 1e12, color: 'red' },
  { x: 500, y: 300, vx: -0.2, vy: 0, mass: 1e12, color: 'blue' },
  { x: 400, y: 500, vx: 0.1, vy: -0.1, mass: 1e12, color: 'green' }
];

// Get elements for sliders
const mass1Slider = document.getElementById('mass1');
const mass2Slider = document.getElementById('mass2');
const mass3Slider = document.getElementById('mass3');
const mass1Value = document.getElementById('mass1-value');
const mass2Value = document.getElementById('mass2-value');
const mass3Value = document.getElementById('mass3-value');

// Update mass values from sliders
function updateMasses() {
  bodies[0].mass = parseFloat(mass1Slider.value);
  bodies[1].mass = parseFloat(mass2Slider.value);
  bodies[2].mass = parseFloat(mass3Slider.value);

  mass1Value.textContent = mass1Slider.value;
  mass2Value.textContent = mass2Slider.value;
  mass3Value.textContent = mass3Slider.value;
}

mass1Slider.addEventListener('input', updateMasses);
mass2Slider.addEventListener('input', updateMasses);
mass3Slider.addEventListener('input', updateMasses);

function calculateForces() {
  bodies.forEach((bodyA, i) => {
    bodyA.ax = 0;
    bodyA.ay = 0;
    bodies.forEach((bodyB, j) => {
      if (i !== j) {
        const dx = bodyB.x - bodyA.x;
        const dy = bodyB.y - bodyA.y;
        const distance = Math.sqrt(dx * dx + dy * dy) + 1e-16;
        const force = G * (bodyA.mass * bodyB.mass) / (distance * distance);
        const angle = Math.atan2(dy, dx);
        bodyA.ax += (force / bodyA.mass) * Math.cos(angle);
        bodyA.ay += (force / bodyA.mass) * Math.sin(angle);
      }
    });
  });
}

function updatePositions() {
  bodies.forEach(body => {
    body.vx += body.ax;
    body.vy += body.ay;
    body.x += body.vx;
    body.y += body.vy;
  });
}

function drawBodies() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bodies.forEach(body => {
    ctx.beginPath();
    ctx.arc(body.x, body.y, 0, 0, 2 * Math.PI);
    ctx.fillStyle = body.color;
    ctx.fill();
  });
}

function animate() {
  if (isRunning) {
    calculateForces();
    updatePositions();
    drawBodies();
    animationFrame = requestAnimationFrame(animate);
  }
}

function toggleSimulation() {
    console.log("Start button clicked");
  
    // Check if elements are found
    console.log("Popup element:", popup);
    console.log("Canvas element:", canvas);
  
    if (popup && canvas) {
      popup.style.display = 'none';
      canvas.style.display = 'block';
    } else {
      console.error("Popup or Canvas element not found");
    }
  
    isRunning = true;
    animate();
  }

// Attach event listener to the Start button
startButton.addEventListener('click', toggleSimulation);

// Initialize masses
updateMasses();