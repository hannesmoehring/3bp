const canvas = document.getElementById('simulation');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const trails = [];
const popup = document.getElementById('popup');
const startButton = document.getElementById('start-button');

console.log("Script loaded");
console.log("Variables declared");

const G = 6.67430e-11;
let isRunning = false;
let animationFrame;
let isDragging = false;
let selectedBody = null;
const radiusFactor = 0.001; // Scaling factor for the sphere size based on mass

const bodies = [
  { x: 800, y: 800, vx: 0.0, vy: 0.0, mass: 1e12, color: 'red', trail: [] },
  { x: 700, y: 400, vx: 0.0, vy: 0.0, mass: 1e12, color: 'blue', trail: [] },
  { x: 300, y: 300, vx: 0.0, vy: 0.0, mass: 1e12, color: 'green', trail: [] }
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
    const radius = Math.cbrt(body.mass) * radiusFactor;
    return Math.sqrt(dx * dx + dy * dy) < radius;
  });
}

// Mouse event handlers for dragging bodies
canvas.addEventListener('mousedown', (event) => {
  if (isRunning) return;
  const mouseX = event.offsetX;
  const mouseY = event.offsetY;
  selectedBody = getBodyAtPosition(mouseX, mouseY);

  if (selectedBody) isDragging = true;
});

canvas.addEventListener('mousemove', (event) => {
  if (isDragging && selectedBody) {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;
    selectedBody.x = mouseX;
    selectedBody.y = mouseY;
    drawBodies();
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
        const collisionThreshold = 30; // Adjust this value as needed
      if (distance < collisionThreshold) {
        // Remove the smaller body
        if (bodyA.mass < bodyB.mass) {
          bodies.splice(i, 1); // Remove bodyA
          i--; // Adjust index after deletion
        } else {
          bodies.splice(j, 1); // Remove bodyB
        }
      }
        const force = G * (bodyA.mass * bodyB.mass) / (distance * distance);
        const angle = Math.atan2(dy, dx);
        bodyA.ax += (force / bodyA.mass) * Math.cos(angle);
        bodyA.ay += (force / bodyA.mass) * Math.sin(angle);
      }
    });
  });
}

// Update positions and add trails
function updatePositions() {
  bodies.forEach(body => {
    body.vx += body.ax;
    body.vy += body.ay;
    body.x += body.vx;
    body.y += body.vy;

    // Add current position to the trail
    body.trail.push({ x: body.x, y: body.y });

    // Limit the length of the trail to avoid performance issues
    if (body.trail.length > 15000) body.trail.shift();
  });
}

// Draw bodies and trails
function drawBodies() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bodies.forEach(body => {
    // Draw the trail
    ctx.beginPath();
    ctx.strokeStyle = body.color;
    ctx.lineWidth = 1;
    for (let i = 1; i < body.trail.length; i++) {
      ctx.moveTo(body.trail[i - 1].x, body.trail[i - 1].y);
      ctx.lineTo(body.trail[i].x, body.trail[i].y);
    }
    ctx.stroke();

    // Draw the body
    const radius = Math.cbrt(body.mass) * radiusFactor;
    ctx.beginPath();
    ctx.arc(body.x, body.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = body.color;
    ctx.fill();
  });
}

// Animate the simulation
function animate() {
  if (isRunning) {
    calculateForces();
    updatePositions();
    drawBodies();
    animationFrame = requestAnimationFrame(animate);
  }
}

// Toggle simulation on Start button click
function toggleSimulation() {
  console.log("Start button clicked");
  popup.style.display = 'none';
  canvas.style.display = 'block';
  isRunning = true;
  animate();
}

startButton.addEventListener('click', toggleSimulation);

// Initialize and draw bodies initially
canvas.style.display = 'block';
updateMasses();
drawBodies();