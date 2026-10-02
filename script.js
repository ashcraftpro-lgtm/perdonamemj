const screens = {
  loading: document.getElementById('loading'),
  inicio: document.getElementById('inicio'),
  introGirasoles: document.getElementById('introGirasoles'),
  girasoles: document.getElementById('girasoles'),
  introRetro: document.getElementById('introRetro'),
  retroGame: document.getElementById('retroGame'),
  introMaze: document.getElementById('introMaze'),
  mazeGame: document.getElementById('mazeGame'),
  quiz1: document.getElementById('quiz1'),
  quiz2: document.getElementById('quiz2'),
  final: document.getElementById('final'),
  forgive: document.getElementById('forgive')
};

function showScreen(name){
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

/* MUSIC BUTTON */
const musicToggle = document.getElementById('musicToggle');
let musicOn = false;
musicToggle.addEventListener('click', () => {
  musicOn = !musicOn;
  musicToggle.textContent = musicOn ? '♫' : '♪';
  musicToggle.style.transform = musicOn ? 'scale(1.08)' : 'scale(1)';
});

/* LOADING */
const loadingFill = document.getElementById('loadingFill');
let load = 0;
const loadInterval = setInterval(() => {
  load += 5;
  loadingFill.style.width = `${load}%`;
  if (load >= 100){
    clearInterval(loadInterval);
    showScreen('inicio');
  }
}, 45);

/* START */
document.getElementById('btnImagenInicio').addEventListener('click', () => {
  showScreen('introGirasoles');
});

/* GAME 1 */
const btnIniciarGirasoles = document.getElementById('btnIniciarGirasoles');
const sunGameArea = document.getElementById('sunGameArea');
const sunScoreEl = document.getElementById('sunScore');

let sunScore = 0;
let sunflowerEl = null;
let sunMoveTimer = null;

btnIniciarGirasoles.addEventListener('click', startSunflowerGame);

function startSunflowerGame(){
  sunScore = 0;
  sunScoreEl.textContent = '0';
  showScreen('girasoles');

  if (sunflowerEl) sunflowerEl.remove();
  clearInterval(sunMoveTimer);

  createSunflower();
  sunMoveTimer = setInterval(() => {
    if (sunScore < 10) moveSunflower();
  }, 850);
}

function createSunflower(){
  if (sunflowerEl) sunflowerEl.remove();

  sunflowerEl = document.createElement('button');
  sunflowerEl.className = 'sunflower-target';
  sunflowerEl.setAttribute('aria-label', 'Girasol');
  sunflowerEl.textContent = '🌻';

  sunflowerEl.addEventListener('click', catchSunflower);
  sunflowerEl.addEventListener('touchstart', (e) => {
    e.preventDefault();
    catchSunflower();
  }, {passive:false});

  sunGameArea.appendChild(sunflowerEl);
  moveSunflower();
}

function moveSunflower(){
  if (!sunflowerEl) return;

  const size = 82;
  const padding = 16;
  const topSafe = 90;
  const bottomSafe = 150;

  const maxX = Math.max(padding, window.innerWidth - size - padding);
  const maxY = Math.max(topSafe, window.innerHeight - bottomSafe);

  const x = Math.floor(Math.random() * (maxX - padding) + padding);
  const y = Math.floor(Math.random() * (maxY - topSafe) + topSafe);

  sunflowerEl.style.left = `${x}px`;
  sunflowerEl.style.top = `${y}px`;
}

function catchSunflower(){
  if (!sunflowerEl || sunflowerEl.classList.contains('sun-hit')) return;

  sunflowerEl.classList.add('sun-hit');
  sunScore++;
  sunScoreEl.textContent = sunScore;

  if (sunScore >= 10){
    clearInterval(sunMoveTimer);
    setTimeout(() => {
      if (sunflowerEl) sunflowerEl.remove();
      sunflowerEl = null;
      showScreen('introRetro');
    }, 300);
    return;
  }

  setTimeout(() => createSunflower(), 230);
}

/* GAME 2 */
const btnIniciarRetro = document.getElementById('btnIniciarRetro');
const canvas = document.getElementById('retroCanvas');
const ctx = canvas.getContext('2d');

const killsEl = document.getElementById('kills');
const livesEl = document.getElementById('lives');
const coinsEl = document.getElementById('coins');

let retroRunning = false;
let animationId = null;
let keys = {};
let bullets = [];
let enemyBullets = [];
let particles = [];
let enemies = [];
let stars = [];
let kills = 0;
let lives = 3;
let coins = 323;
let lastShot = 0;
let enemyDir = 1;
let enemyMoveCounter = 0;
let shootHoldTimer = null;

const player = {
  x: canvas.width/2 - 18,
  y: canvas.height - 62,
  w: 36,
  h: 28,
  speed: 4.8
};

btnIniciarRetro.addEventListener('click', () => {
  startRetroGame();
  showScreen('retroGame');
});

window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key === ' ') e.preventDefault();

  if (screens.mazeGame.classList.contains('active')){
    if (['ArrowUp','w','W'].includes(e.key)) moveMazePlayer(0,-1);
    if (['ArrowDown','s','S'].includes(e.key)) moveMazePlayer(0,1);
    if (['ArrowLeft','a','A'].includes(e.key)) moveMazePlayer(-1,0);
    if (['ArrowRight','d','D'].includes(e.key)) moveMazePlayer(1,0);
  }
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

function holdLeft(start){ keys['ArrowLeft'] = start; }
function holdRight(start){ keys['ArrowRight'] = start; }
function startShootHold(){
  shoot();
  clearInterval(shootHoldTimer);
  shootHoldTimer = setInterval(shoot, 220);
}
function stopShootHold(){ clearInterval(shootHoldTimer); }

const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const shootBtn = document.getElementById('shootBtn');

leftBtn.addEventListener('touchstart', e => { e.preventDefault(); holdLeft(true); }, {passive:false});
leftBtn.addEventListener('touchend', () => holdLeft(false));
leftBtn.addEventListener('touchcancel', () => holdLeft(false));
rightBtn.addEventListener('touchstart', e => { e.preventDefault(); holdRight(true); }, {passive:false});
rightBtn.addEventListener('touchend', () => holdRight(false));
rightBtn.addEventListener('touchcancel', () => holdRight(false));
shootBtn.addEventListener('touchstart', e => { e.preventDefault(); startShootHold(); }, {passive:false});
shootBtn.addEventListener('touchend', stopShootHold);
shootBtn.addEventListener('touchcancel', stopShootHold);

function startRetroGame(){
  retroRunning = true;
  kills = 0;
  lives = 3;
  coins = 323;
  bullets = [];
  enemyBullets = [];
  particles = [];
  player.x = canvas.width/2 - 18;
  keys = {};
  lastShot = 0;
  enemyDir = 1;
  enemyMoveCounter = 0;
  killsEl.textContent = kills;
  livesEl.textContent = lives;
  coinsEl.textContent = coins;

  makeStars();
  createEnemies();

  cancelAnimationFrame(animationId);
  loop();
}

function makeStars(){
  stars = [];
  for(let i = 0; i < 80; i++){
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      s: Math.random() * 2 + 1,
      sp: Math.random() * .25 + .12
    });
  }
}

function createEnemies(){
  enemies = [];
  const rows = 4;
  const cols = 5;
  const startX = 72;
  const startY = 78;
  const gapX = 120;
  const gapY = 62;

  for(let r = 0; r < rows; r++){
    for(let c = 0; c < cols; c++){
      enemies.push({x: startX + c * gapX, y: startY + r * gapY, w: 38, h: 28, alive: true});
    }
  }
}

function shoot(){
  const now = performance.now();
  if (now - lastShot < 210) return;
  lastShot = now;
  bullets.push({x: player.x + player.w/2 - 2, y: player.y, w: 4, h: 12, speed: 7.6});
}

function enemyShoot(){
  const aliveEnemies = enemies.filter(e => e.alive);
  if (!aliveEnemies.length) return;
  const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
  enemyBullets.push({x: shooter.x + shooter.w/2 - 2, y: shooter.y + shooter.h, w: 4, h: 10, speed: 3.4});
}

function overlap(a,b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function addExplosion(x, y, colorA = '#ffd05a', colorB = '#ff7fa8'){
  for(let i = 0; i < 10; i++){
    particles.push({
      x, y,
      vx: (Math.random() - .5) * 3.2,
      vy: (Math.random() - .5) * 3.2,
      life: 22 + Math.random() * 8,
      c: Math.random() > .5 ? colorA : colorB,
      s: Math.random() * 3 + 2
    });
  }
}

function updateParticles(){
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.life -= 1;
  });
  particles = particles.filter(p => p.life > 0);
}

function update(){
  if (!retroRunning) return;

  if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x -= player.speed;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x += player.speed;
  if (keys[' '] || keys['Spacebar']) shoot();

  player.x = Math.max(10, Math.min(canvas.width - player.w - 10, player.x));

  bullets.forEach(b => b.y -= b.speed);
  bullets = bullets.filter(b => b.y + b.h > 0);

  enemyBullets.forEach(b => b.y += b.speed);
  enemyBullets = enemyBullets.filter(b => b.y < canvas.height + 20);

  enemyMoveCounter++;
  if (enemyMoveCounter % 26 === 0){
    let hitEdge = false;
    enemies.forEach(e => {
      if (!e.alive) return;
      e.x += 12 * enemyDir;
      if (e.x < 20 || e.x + e.w > canvas.width - 20) hitEdge = true;
    });

    if (hitEdge){
      enemyDir *= -1;
      enemies.forEach(e => { if (e.alive) e.y += 18; });
    }
    if (Math.random() < .75) enemyShoot();
  }

  bullets.forEach(b => {
    enemies.forEach(e => {
      if (e.alive && overlap(b,e)){
        e.alive = false;
        b.y = -999;
        kills++; coins += 3;
        killsEl.textContent = kills; coinsEl.textContent = coins;
        addExplosion(e.x + 12, e.y + 10);
      }
    });
  });

  enemyBullets.forEach(b => {
    if (overlap(b, player)){
      b.y = canvas.height + 100;
      lives--;
      livesEl.textContent = lives;
      addExplosion(player.x + 14, player.y + 12, '#8ce6ff', '#ffffff');
    }
  });

  enemies.forEach(e => {
    if (e.alive && e.y + e.h >= player.y){
      lives = 0;
      livesEl.textContent = lives;
    }
  });

  updateParticles();

  if (kills >= 10){
    retroRunning = false;
    stopShootHold();
    setTimeout(() => showScreen('introMaze'), 350);
  }

  if (lives <= 0){
    retroRunning = false;
    stopShootHold();
    setTimeout(() => {
      alert('¡Inténtalo de nuevo! ☁️');
      showScreen('introRetro');
    }, 150);
  }
}

function drawGradientBackground(){
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#2b194a');
  grad.addColorStop(.55, '#1a0f2f');
  grad.addColorStop(1, '#120a20');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,231,155,0.18)';
  ctx.beginPath();
  ctx.arc(660, 88, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,.45)';
  stars.forEach(s => {
    ctx.fillRect(s.x, s.y, s.s, s.s);
    s.y += s.sp;
    if (s.y > canvas.height){ s.y = -2; s.x = Math.random() * canvas.width; }
  });
}

function drawPlayer(x, y){
  const p = 4;
  const pattern = [
    "00011000","00111100","01111110","11100111","10111101","00111100","00100100"
  ];
  for(let row = 0; row < pattern.length; row++){
    for(let col = 0; col < pattern[row].length; col++){
      if (pattern[row][col] === '1'){
        const px = x + col * p, py = y + row * p;
        if (row < 2) ctx.fillStyle = '#8ce6ff';
        else if (row < 5) ctx.fillStyle = '#6a8cff';
        else ctx.fillStyle = '#ffcf69';
        ctx.fillRect(px, py, p, p);
      }
    }
  }
  ctx.fillStyle = '#ff8aac';
  ctx.fillRect(x + 10, y + 28, 4, 6);
  ctx.fillRect(x + 18, y + 28, 4, 6);
}

function drawStormCloud(x, y){
  ctx.fillStyle = '#b8c1d8';
  ctx.fillRect(x + 8, y + 8, 24, 12);
  ctx.fillRect(x + 4, y + 12, 30, 10);
  ctx.fillRect(x + 12, y + 4, 12, 8);
  ctx.fillRect(x + 0, y + 12, 8, 8);
  ctx.fillRect(x + 30, y + 12, 8, 8);
  ctx.fillStyle = '#8c96b4';
  ctx.fillRect(x + 4, y + 18, 28, 6);
  ctx.fillStyle = '#2b194a';
  ctx.fillRect(x + 10, y + 12, 4, 4);
  ctx.fillRect(x + 24, y + 12, 4, 4);
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(x + 16, y + 22, 4, 6);
  ctx.fillRect(x + 20, y + 26, 4, 6);
  ctx.fillRect(x + 14, y + 28, 4, 6);
}

function drawBullets(){
  bullets.forEach(b => { ctx.fillStyle = '#ffe59b'; ctx.fillRect(b.x, b.y, b.w, b.h); });
  enemyBullets.forEach(b => { ctx.fillStyle = '#ffb26b'; ctx.fillRect(b.x, b.y, b.w, b.h); });
}
function drawParticles(){
  particles.forEach(p => { ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s); });
}
function draw(){
  drawGradientBackground();
  drawBullets();
  enemies.forEach(e => { if (e.alive) drawStormCloud(e.x, e.y); });
  drawParticles();
  drawPlayer(player.x, player.y);
}
function loop(){
  update(); draw();
  if (retroRunning) animationId = requestAnimationFrame(loop);
}

/* GAME 3 */
const btnIniciarMaze = document.getElementById('btnIniciarMaze');
const mazeBoard = document.getElementById('mazeBoard');

const mazeMap = [
  [0,0,1,0,0,0,0,0],
  [1,0,1,0,1,1,1,0],
  [1,0,0,0,0,0,1,0],
  [1,1,1,1,1,0,1,0],
  [0,0,0,0,1,0,1,0],
  [0,1,1,0,1,0,0,0],
  [0,1,0,0,0,1,1,0],
  [0,0,0,1,0,0,0,0]
];

let playerMaze = {x:0,y:0};
const goalMaze = {x:7,y:7};

btnIniciarMaze.addEventListener('click', () => {
  playerMaze = {x:0,y:0};
  renderMaze();
  showScreen('mazeGame');
});

function renderMaze(){
  mazeBoard.innerHTML = '';
  for (let y=0; y<mazeMap.length; y++){
    for (let x=0; x<mazeMap[y].length; x++){
      const cell = document.createElement('div');
      cell.className = 'cell ' + (mazeMap[y][x] === 1 ? 'wall' : 'path');

      if (playerMaze.x === x && playerMaze.y === y){
        cell.classList.add('player');
        cell.textContent = '🧍';
      } else if (goalMaze.x === x && goalMaze.y === y){
        cell.classList.add('goal');
        cell.textContent = '🏁';
      } else if (mazeMap[y][x] === 1){
        cell.textContent = '⬛';
      }
      mazeBoard.appendChild(cell);
    }
  }
}

function moveMazePlayer(dx,dy){
  if (!screens.mazeGame.classList.contains('active')) return;
  const nx = playerMaze.x + dx, ny = playerMaze.y + dy;
  if (nx < 0 || ny < 0 || ny >= mazeMap.length || nx >= mazeMap[0].length) return;
  if (mazeMap[ny][nx] === 1) return;
  playerMaze = {x:nx, y:ny};
  renderMaze();
  if (playerMaze.x === goalMaze.x && playerMaze.y === goalMaze.y){
    setTimeout(() => showScreen('quiz1'), 250);
  }
}

document.getElementById('mazeUp').addEventListener('click', () => moveMazePlayer(0,-1));
document.getElementById('mazeDown').addEventListener('click', () => moveMazePlayer(0,1));
document.getElementById('mazeLeft').addEventListener('click', () => moveMazePlayer(-1,0));
document.getElementById('mazeRight').addEventListener('click', () => moveMazePlayer(1,0));

/* QUIZZES */
function setupQuiz(containerId, feedbackId, imgId, nextScreen){
  const container = document.getElementById(containerId);
  const feedback = document.getElementById(feedbackId);
  const feedbackImg = document.getElementById(imgId);
  const buttons = container.querySelectorAll('.option-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const correct = btn.dataset.correct === 'true';
      buttons.forEach(b => b.disabled = true);

      if (correct){
        btn.classList.add('correct');
        feedback.textContent = '¡Correcto! ✨';
        feedbackImg.src = 'assets/icon1.png';
        feedbackImg.classList.remove('hidden');
        setTimeout(() => {
          feedbackImg.classList.add('hidden');
          showScreen(nextScreen);
        }, 1100);
      } else {
        btn.classList.add('wrong');
        feedback.textContent = 'Casi... intenta de nuevo 💛';
        feedbackImg.src = 'assets/icon2.png';
        feedbackImg.classList.remove('hidden');
        setTimeout(() => {
          buttons.forEach(b => {
            b.disabled = false;
            b.classList.remove('wrong');
          });
          feedback.textContent = '';
          feedbackImg.classList.add('hidden');
        }, 1200);
      }
    });
  });
}
setupQuiz('quiz1Options', 'quiz1Feedback', 'quiz1Img', 'quiz2');
setupQuiz('quiz2Options', 'quiz2Feedback', 'quiz2Img', 'final');

/* LETTER TO FINAL QUESTION */
document.getElementById('btnToForgive').addEventListener('click', () => showScreen('forgive'));

const forgiveYes = document.getElementById('forgiveYes');
const forgiveNo = document.getElementById('forgiveNo');
const forgiveFeedback = document.getElementById('forgiveFeedback');
const forgiveImg = document.getElementById('forgiveImg');
const btnReiniciar = document.getElementById('btnReiniciar');

forgiveYes.addEventListener('click', () => {
  forgiveFeedback.textContent = 'Gracias... de verdad 💛';
  forgiveImg.src = 'assets/icon3.png';
  forgiveImg.classList.remove('hidden');
  createConfetti();
  btnReiniciar.classList.remove('hidden');
  forgiveYes.disabled = true;
  forgiveNo.disabled = true;
});

forgiveNo.addEventListener('click', () => {
  forgiveFeedback.textContent = 'Está bien... igual gracias por llegar hasta aquí 🥺';
  forgiveImg.src = 'assets/icon4.png';
  forgiveImg.classList.remove('hidden');
  btnReiniciar.classList.remove('hidden');
  forgiveYes.disabled = true;
  forgiveNo.disabled = true;
});

/* CONFETTI */
const confettiBox = document.getElementById('confetti');
function createConfetti(){
  confettiBox.innerHTML = '';
  const items = ['💛','✨','🌻','💌','🌸','💕'];
  for(let i = 0; i < 42; i++){
    const el = document.createElement('span');
    el.className = 'confetti';
    el.textContent = items[Math.floor(Math.random() * items.length)];
    el.style.left = `${Math.random()*100}vw`;
    el.style.animationDuration = `${4 + Math.random()*4}s`;
    el.style.animationDelay = `${Math.random()*2.5}s`;
    el.style.fontSize = `${14 + Math.random()*18}px`;
    confettiBox.appendChild(el);
  }
}

/* RESET */
btnReiniciar.addEventListener('click', () => {
  clearInterval(sunMoveTimer);
  cancelAnimationFrame(animationId);
  stopShootHold();
  retroRunning = false;
  confettiBox.innerHTML = '';
  sunScore = 0;
  playerMaze = {x:0,y:0};
  renderMaze();

  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('correct','wrong');
  });
  document.getElementById('quiz1Feedback').textContent = '';
  document.getElementById('quiz2Feedback').textContent = '';
  document.getElementById('quiz1Img').classList.add('hidden');
  document.getElementById('quiz2Img').classList.add('hidden');

  forgiveFeedback.textContent = '';
  forgiveImg.classList.add('hidden');
  forgiveYes.disabled = false;
  forgiveNo.disabled = false;
  btnReiniciar.classList.add('hidden');
  showScreen('inicio');
});

window.addEventListener('resize', () => {
  if (screens.girasoles.classList.contains('active') && sunflowerEl){
    moveSunflower();
  }
});

renderMaze();
