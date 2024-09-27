
import Player from './Player.js';
import Projectile from './Projectile.js';
import Enemy from './Enemy.js';
import Particle from './Particle.js';

const canvas = document.querySelector('canvas');
const scoreEl = document.querySelector('#scoreEl');
const startGameEl = document.querySelector('#startGame');
const modalEl = document.querySelector('#modalEl');
const bigScore = document.querySelector('#bigScore');
const c = canvas.getContext('2d');


const CollisionSound= new Audio('./sound/gameOver.mp3');
const Shooting= new Audio('./sound/shooting.mp3');
const killEnemy= new Audio('./sound/kill.mp3');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player;
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;
let animationId;

function init() {
    player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScore.innerHTML = score;
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30 - 8) + 8;
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const color = `hsl(${Math.random() * 360},50%,50%)`;
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        const velocity = { x: Math.cos(angle), y: Math.sin(angle) };
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0,0,0,0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, index) => {
        particle.update();
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });

    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            }, 0);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if (dist - enemy.radius - player.radius < 1) {
            CollisionSound.currentTime = 0; 
            CollisionSound.play();
            cancelAnimationFrame(animationId);
            modalEl.style.display = 'flex';
            bigScore.innerHTML = score;
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - enemy.radius - projectile.radius < 1) {
                for (let i = 0; i < enemy.radius * 2; i++) {
                    killEnemy.currentTime = 0; 
                    killEnemy.play();
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6),
                    }));
                }

                if (enemy.radius - 10 > 5) {
                    score += 100;
                    scoreEl.innerHTML = score;
                    gsap.to(enemy, { radius: enemy.radius - 10 });
                    enemy.radius -= 10;
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                } else {
                    score += 250;
                    scoreEl.innerHTML = score;
                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
            }
        });
    });
}

window.addEventListener('click', (event) => {
    Shooting.currentTime = 0;
    Shooting.play();
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = { x: Math.cos(angle) * 5, y: Math.sin(angle) * 5 };
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity));
});


    init();
    animate();
    spawnEnemies();
    modalEl.style.display = 'none';


    document.getElementById('restartButton').addEventListener('click', () => {
        init(); 
        modalEl.style.display = 'none';
        animate(); 
        spawnEnemies(); 
    });
    