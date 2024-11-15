const canvas = document.getElementById('simulation');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const trails = [];
const popup = document.getElementById('popup');
const startButton = document.getElementById('start-button');

console.log("Script loaded");


const G = 6.67430e-11;
let isRunning = false;
let animationFrame;
let isDragging = false;
let selectedBody = null;
const radiusFactor = 0.001; 

const bodies = [
    { x: 1288, y: 781, vx: (Math.random() - 0.5) / 1, vy: (Math.random() - 0.5) / 1, mass: 1e12, color: 'red', trail: [] },
    { x: 1400, y: 393, vx: (Math.random() - 0.5) / 1, vy: (Math.random() - 0.5) / 1, mass: 1e12, color: 'blue', trail: [] },
    { x: 717, y: 747, vx: (Math.random() - 0.5) / 1, vy: (Math.random() - 0.5) / 1, mass: 1e12, color: 'green', trail: [] }
];
console.log(bodies)
console.log("please log this");

const mass1Slider = document.getElementById('mass1');
const mass2Slider = document.getElementById('mass2');
const mass3Slider = document.getElementById('mass3');
const mass1Value = document.getElementById('mass1-value');
const mass2Value = document.getElementById('mass2-value');
const mass3Value = document.getElementById('mass3-value');

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

function getBodyAtPosition(x, y) {
  return bodies.find(body => {
    const dx = body.x - x;
    const dy = body.y - y;
    const radius = Math.cbrt(body.mass) * radiusFactor;
    return Math.sqrt(dx * dx + dy * dy) < radius;
  });
}

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

function calculateForces() {
    bodies.forEach((bodyA, i) => {
        //console.log(bodyA.mass);
        bodyA.ax = 0;
        bodyA.ay = 0;
        bodies.forEach((bodyB, j) => {
        if (i !== j) {
          const dx = bodyB.x - bodyA.x;
          const dy = bodyB.y - bodyA.y;
          const distance = Math.sqrt(dx * dx + dy * dy) + 1e-16;
          const collisionThreshold = 20;
  
          if (distance < collisionThreshold) {
            if (bodyA.mass < bodyB.mass) {
                bodies[j].vx /= 1000;
                bodies[j].vy /= 1000;
                bodies.splice(i, 1);
                i--;
            } else {
                trails.push(bodyB.trail); 
                bodies[i].vx /= 1000;
                bodies[i].vy /= 1000;

                bodies.splice(j, 1);
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

function updatePositions() {
    bodies.forEach(body => {
      body.vx += body.ax;
      body.vy += body.ay;
      body.x += body.vx;
      body.y += body.vy;
      body.mass = body.mass * (1 + ((Math.random() - 0.5) * 0.000001));
      body.trail.push({ x: body.x, y: body.y });
  
      if (body.trail.length > 20000) body.trail.shift();
    });
  }

function drawBodies() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    trails.forEach(trail => {
      ctx.beginPath();
      ctx.strokeStyle = 'gray'; 
      ctx.lineWidth = 1;
      for (let i = 1; i < trail.length; i++) {
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.stroke();
    });
  
    bodies.forEach(body => {
      ctx.beginPath();
      ctx.strokeStyle = body.color;
      ctx.lineWidth = 1;
      for (let i = 1; i < body.trail.length; i++) {
        ctx.moveTo(body.trail[i - 1].x, body.trail[i - 1].y);
        ctx.lineTo(body.trail[i].x, body.trail[i].y);
      }
      ctx.stroke();
  
      const radius = Math.cbrt(body.mass) * radiusFactor;
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
  console.log("Starting this shit");
  popup.style.display = 'none';
  canvas.style.display = 'block';
  isRunning = true;
  animate();
}

startButton.addEventListener('click', toggleSimulation);

canvas.style.display = 'block';
updateMasses();
drawBodies();