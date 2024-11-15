const canvas = document.getElementById('simulation');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const popup = document.getElementById('popup');
const startButton = document.getElementById('start-button');

console.log("Script loaded");
console.log("Variables declared");

const G = 6.67430e-11;
let isRunning = false;
let animationFrame;
let isDragging = false;
let selectedBody = null;
const radius = 10; // Radius of each body for click detection


const bodies = [
  { x: 800, y: 800, vx: 0, vy: 0.2, mass: 1e12, color: 'red' },
  { x: 700, y: 400, vx: -0.2, vy: 0, mass: 1e12, color: 'blue' },
  { x: 300, y: 300, vx: 0.1, vy: -0.1, mass: 1e12, color: 'green' }
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

  // Redraw bodies when mass changes
  drawBodies();
}

mass1Slider.addEventListener('input', updateMasses);
mass2Slider.addEventListener('input', updateMasses);
mass3Slider.addEventListener('input', updateMasses);

// Function to detect if the mouse is over a body
function getBodyAtPosition(x, y) {
  return bodies.find(body => {
    const dx = body.x - x;
    const dy = body.y - y;
    return Math.sqrt(dx * dx + dy * dy) < radius;
  });
}

// Mouse event handlers
canvas.addEventListener('mousedown', (event) => {
  if (isRunning) return;

  const mouseX = event.offsetX;
  const mouseY = event.offsetY;
  selectedBody = getBodyAtPosition(mouseX, mouseY);

  if (selectedBody) {
    isDragging = true;
  }
});

canvas.addEventListener('mousemove', (event) => {
  if (isDragging && selectedBody) {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;
    selectedBody.x = mouseX;
    selectedBody.y = mouseY;
    drawBodies(); // Redraw as the body is being dragged
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  selectedBody = null;
});

// Calculate gravitational forces
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
      // Calculate the radius based on the mass
      const radius = Math.cbrt(body.mass) * 0.001; // Adjust the scaling factor as needed
  
      ctx.beginPath();
      ctx.arc(body.x, body.y, radius, 0, 2 * Math.PI);
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

  if (popup && canvas) {
    popup.style.display = 'none';
    canvas.style.display = 'block';
  }

  isRunning = true;
  animate();
}

// Attach event listener to the Start button
startButton.addEventListener('click', toggleSimulation);

// Initialize masses, draw bodies initially, and make canvas visible
canvas.style.display = 'block';
updateMasses();
drawBodies();