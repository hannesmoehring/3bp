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
    { x: 1288 + (Math.random() - 0.5) * 200, y: 781 + (Math.random() - 0.5) * 200, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, mass: 1e12, color: 'red', trail: [] },
    { x: 600 + (Math.random() - 0.5) * 200, y: 393 + (Math.random() - 0.5) * 200, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, mass: 1e12, color: 'blue', trail: [] },
    { x: 717 + (Math.random() - 0.5) * 200, y: 747 + (Math.random() - 0.5) * 200, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, mass: 1e13, color: 'green', trail: [] }
];

console.log("Bodies created: ", bodies);

const mass1Slider = document.getElementById('mass1');
const mass2Slider = document.getElementById('mass2');
const mass3Slider = document.getElementById('mass3');
const mass1Value = document.getElementById('mass1-value');
const mass2Value = document.getElementById('mass2-value');
const mass3Value = document.getElementById('mass3-value');

// Find the heaviest body
function findHeaviestBody() {
    return bodies.reduce((heaviest, current) => 
        current.mass > heaviest.mass ? current : heaviest
    , bodies[0]);
}

// Convert world coordinates to screen coordinates
function worldToScreen(x, y, centerX, centerY) {
    return {
        x: x - centerX + canvas.width / 2,
        y: y - centerY + canvas.height / 2
    };
}

function updateMasses() {
    bodies[0].mass = parseFloat(mass1Slider.value) * (1+Math.random()*0.001);
    bodies[1].mass = parseFloat(mass2Slider.value) * (1+Math.random()*0.001);
    bodies[2].mass = parseFloat(mass3Slider.value) * (1+Math.random()*0.001);

    mass1Value.textContent = mass1Slider.value;
    mass2Value.textContent = mass2Slider.value;
    mass3Value.textContent = mass3Slider.value;

    drawBodies();
}

mass1Slider.addEventListener('input', updateMasses);
mass2Slider.addEventListener('input', updateMasses);
mass3Slider.addEventListener('input', updateMasses);

function calculateDistance(body1, body2) {
    const dx = body2.x - body1.x;
    const dy = body2.y - body1.y;
    return Math.sqrt(dx * dx + dy * dy).toFixed(0);
}

const previousDistances = {
    'red-blue': null,
    'red-green': null,
    'blue-green': null
};

function calculateVelocity(body) {
    return Math.sqrt(body.vx * body.vx + body.vy * body.vy).toFixed(2);
}

function updateDistanceTable() {
    const tbody = document.getElementById('distance-tbody');
    tbody.innerHTML = '';
    
    const red = bodies.find(b => b.color === 'red');
    const blue = bodies.find(b => b.color === 'blue');
    const green = bodies.find(b => b.color === 'green');
    
    // Add velocity rows for existing bodies
    bodies.forEach(body => {
        const row = tbody.insertRow();
        row.innerHTML = `<td>${body.color.charAt(0).toUpperCase() + body.color.slice(1)} velocity</td>
                        <td>${calculateVelocity(body)}</td>`;
    });
    
    // Add separator row
    const separatorRow = tbody.insertRow();
    separatorRow.innerHTML = '<td colspan="2"><hr style="border-color: rgba(255,255,255,0.2)"></td>';
    
    // Add distance rows
    if (red && blue) {
        const currentDistance = calculateDistance(red, blue);
        const color = getDistanceColor(currentDistance, previousDistances['red-blue']);
        previousDistances['red-blue'] = currentDistance;
        const row = tbody.insertRow();
        row.innerHTML = `<td>Red ↔ Blue</td><td style="color: ${color}">${currentDistance}</td>`;
    }
    
    if (red && green) {
        const currentDistance = calculateDistance(red, green);
        const color = getDistanceColor(currentDistance, previousDistances['red-green']);
        previousDistances['red-green'] = currentDistance;
        const row = tbody.insertRow();
        row.innerHTML = `<td>Red ↔ Green</td><td style="color: ${color}">${currentDistance}</td>`;
    }
    
    if (blue && green) {
        const currentDistance = calculateDistance(blue, green);
        const color = getDistanceColor(currentDistance, previousDistances['blue-green']);
        previousDistances['blue-green'] = currentDistance;
        const row = tbody.insertRow();
        row.innerHTML = `<td>Blue ↔ Green</td><td style="color: ${color}">${currentDistance}</td>`;
    }
}

function getDistanceColor(current, previous) {
    if (previous === null) return 'white';
    return current > previous ? '#4ade80' : '#ef4444';
}

function getBodyAtPosition(x, y) {
    const heaviestBody = findHeaviestBody();
    
    return bodies.find(body => {
        const screenPos = worldToScreen(body.x, body.y, heaviestBody.x, heaviestBody.y);
        const dx = screenPos.x - x;
        const dy = screenPos.y - y;
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
        const heaviestBody = findHeaviestBody();
        const mouseX = event.offsetX - canvas.width / 2 + heaviestBody.x;
        const mouseY = event.offsetY - canvas.height / 2 + heaviestBody.y;
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
    
    // Find the heaviest body to center the view on
    const heaviestBody = findHeaviestBody();
    
    // Draw trails
    trails.forEach(trail => {
        ctx.beginPath();
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
        for (let i = 1; i < trail.length; i++) {
            const pos1 = worldToScreen(trail[i - 1].x, trail[i - 1].y, heaviestBody.x, heaviestBody.y);
            const pos2 = worldToScreen(trail[i].x, trail[i].y, heaviestBody.x, heaviestBody.y);
            ctx.moveTo(pos1.x, pos1.y);
            ctx.lineTo(pos2.x, pos2.y);
        }
        ctx.stroke();
    });

    bodies.forEach(body => {
        ctx.beginPath();
        ctx.strokeStyle = body.color;
        ctx.lineWidth = 1;
        for (let i = 1; i < body.trail.length; i++) {
            const pos1 = worldToScreen(body.trail[i - 1].x, body.trail[i - 1].y, heaviestBody.x, heaviestBody.y);
            const pos2 = worldToScreen(body.trail[i].x, body.trail[i].y, heaviestBody.x, heaviestBody.y);
            ctx.moveTo(pos1.x, pos1.y);
            ctx.lineTo(pos2.x, pos2.y);
        }
        ctx.stroke();

        const screenPos = worldToScreen(body.x, body.y, heaviestBody.x, heaviestBody.y);
        const radius = Math.cbrt(body.mass) * radiusFactor;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = body.color;
        ctx.fill();
    });

    updateDistanceTable();
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
    console.log("Starting simulation");
    popup.style.display = 'none';
    canvas.style.display = 'block';
    isRunning = true;
    animate();
}

startButton.addEventListener('click', toggleSimulation);

canvas.style.display = 'block';
updateMasses();
drawBodies();