const canvas = document.getElementById('simulation');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

console.log("Script loaded");

const G = 6.67430e-11; // Gravitational constant (scaled)
const bodies = [
  { x: 300, y: 300, vx: 0, vy: 0.2, mass: 1e12, color: 'red' },
  { x: 500, y: 300, vx: -0.2, vy: 0, mass: 1e12, color: 'blue' },
  { x: 400, y: 500, vx: 0.1, vy: -0.1, mass: 1e12, color: 'green' }
];

function calculateForces() {
  bodies.forEach((bodyA, i) => {
    bodyA.ax = 0;
    bodyA.ay = 0;
    bodies.forEach((bodyB, j) => {
      if (i !== j) {
        const dx = bodyB.x - bodyA.x;
        const dy = bodyB.y - bodyA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = G * (bodyA.mass * bodyB.mass) / ((distance * distance) + 1e-6);
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
    ctx.arc(body.x, body.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = body.color;
    ctx.fill();
  });
}

function animate() {
  calculateForces();
  updatePositions();
  drawBodies();
  requestAnimationFrame(animate);
}

animate();