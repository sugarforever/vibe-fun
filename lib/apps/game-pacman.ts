import { buildAppHtml } from "./bridge";
import type { AppCatalogEntry } from "./types";

const TEXTURE = "UklGRugEAABXRUJQVlA4INwEAABwGACdASqAAIAAPsFeo04npSMiJpTsEPAYCWNmcA7XDb+3feM5U47Rfr9+D6Vf/vuq+eZ9LHRU+p90U3q8/4Xf/+dn9r3XjpNRmK3///caza6hWtOghrbjp+6VJjdi+Zy0YhDRwrkueTtKNDP3eJGmQfL07TY2chvcDObTGPdtYsGwZ/UI5WQJ0Ji1wWVa9R0VC0uXxt3gGpwCF7p43wR+8QKdzGOd12xkU5o8TV0E0CK2FmBtiF43SzZyHDShtGJ7NSONhMlAuKrq1AAA/vMumh3R1d7btfKeOr4Cywf4N85f4g7Rr9g/iFPjzbp70LCqZtt70pxXAajYvPMOyeGRKQSE0RM5DFqCPlqtOxHS803lhDZtGvSh+rAQzWc6vhX9j91WCpXXzCPk2ygN7w2l/dRSikVQoyJ9mi3/6IcYqpyJxb5la+/QNbgCpBVTxjxhFmKSWmCTb4GkWHRJuaQ1kr07+GsqPKHlhDZtGvSh+rCx0wR3S8DRYZkn8/l2f30unzprXfkvk5OUrkbr5Gp6zVvGRcEloBDMkogDL+j78Jv2w4RuCzBbrLQZpfD/VoU32J6sQpULwR16r0/GwKl6/fZhtLy/N8YDixOSjeO+jzYL/6Pr36GzjsATtJf+HkebPlM2qUhISv+X9JvsQrJxbmJL584Li6iz8Rhx+o0Mc6CnR94wvPcDLRHi2IhZuEJ1AfO0x9DLtBscENI2cHZaQKejFD2b16YR1nQTsNp1NsJhCTig6LDld+nlwdIMU5AFkdWa8CWoMoD5Liz4muYg/4aLObrbz8PleiZAgE3rLGJE3tcVOkgM0rdCyoQjTlUiRHD5cQDuFxadKPWwopAs4/zPPgzF3edLuVrZsWTrp6qVkzpIDmhxX5PxAWaBObdgy8ReLs094SM0TufTToXuZEjelZ7re8RO4Q34qe+KTDYALflH5a8kkz0zNcCB8LvOLb5xI1XCqj/QMMPvnfBilYweRUTjHSm2EKriqJar9RNNBA2VYq+rowK9SK+NYjIqCKbQFW/gQSFt4hzDRshDnQkoMgEnUJN1jk1yPQEVWISSzWG9oD4jIp6WeFp7Oe8OZR6ijX92u6r8EKYm10SnJx4VnUYrCoPO9r/6qLPZte4fZVtbd7D2tcvtocDLVx/JjnUeORDUoXwh7mZqAb/I/Q23ZWKj6ZBY8d4F6Xe7eXcqLpKOGwJzTCZB3Wj0qYyHgAniy/2VboiJ6hIYPVyr2reBTUCA9ywwn8Y51yBE7pF6phmY6mPgSbfgpzfD+KrGLCUFcg5+329hYqUaQBow06WawvLQ8ec+9cpfOfiwOYITao5Kkg2pleU3kr0att3C1LN/lyBVsaqdOxueUlB7lvMw8FnSZfmUMeiYwqDun97CQjczLABOd+4mMLdP5W1G4fA15wF64pJ+MsB8uD6tGqgGF7xzWUAO0QBG09YPm0X+k3rLn6LtPMyZ/P5YlS+CyWk2XhwNcO496xF33smGtRLI+SziTqgRE49ZXGJOYvl5Bf4QUPsoUwMAfRv3llQlZo/HUZK1JIlQcrpVo59kSaMDVCDXlhC/AcuZA7H/VPwq5C5s7pVqgKmnevloO+0bR3oTNqxq0nctuViVnsizZn7AqOOQWCO/LCGCQgWgRsZ2k9MKaU5Gp/cAAA=";

const CSS = `
  body { width:100%; overflow-x:hidden; background:#050816; color:#fff; padding:12px; }
  .app { width:100%; max-width:620px; display:grid; gap:10px; }
  .hud { display:flex; align-items:center; justify-content:space-between; gap:10px; }
  .brand { color:#ffd84d; font-size:clamp(28px,7vw,38px); font-weight:950; letter-spacing:-2px; }
  .stats { display:flex; gap:7px; }
  .stat { min-width:70px; padding:5px 9px; border:2px solid #2952ff; border-radius:8px; background:#08133c; text-align:center; }
  .stat span { display:block; color:#9eb5ff; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; }
  .stat strong { font-size:18px; font-variant-numeric:tabular-nums; }
  .toolbar { max-width:none; }
  .hint { color:#aab8e8; }
  .game-shell { position:relative; width:min(100%,520px); margin:auto; border:3px solid #2952ff; border-radius:14px; overflow:hidden; background:#02040b; box-shadow:6px 6px 0 #172b8f; }
  canvas { display:block; width:100%; height:auto; aspect-ratio:19/19; touch-action:none; background:#02040b; }
  .overlay { position:absolute; inset:0; display:grid; place-items:center; padding:20px; background:rgba(2,4,11,.78); backdrop-filter:blur(3px); }
  .overlay[hidden] { display:none; }
  .panel { width:min(320px,90%); padding:22px; border:3px solid #ffd84d; border-radius:12px; background:#08133c; box-shadow:6px 6px 0 #172b8f; text-align:center; }
  .panel h2 { margin:0 0 8px; color:#ffd84d; font-size:28px; }
  .panel p { margin:0 0 16px; color:#c7d1f5; }
  .pad { display:grid; grid-template-columns:repeat(3,48px); grid-template-rows:repeat(2,42px); gap:6px; justify-content:center; }
  .pad button { padding:0; min-width:0; background:#16245d; color:#fff; border-color:#4167ff; box-shadow:2px 2px 0 #091747; touch-action:manipulation; }
  .pad [data-dir="up"] { grid-column:2; } .pad [data-dir="left"] { grid-column:1; grid-row:2; }
  .pad [data-dir="down"] { grid-column:2; grid-row:2; } .pad [data-dir="right"] { grid-column:3; grid-row:2; }
  @media (min-width:700px) { .pad { display:none; } }
  @media (max-width:460px) { .stat { min-width:57px; padding:4px 6px; } .stat strong{font-size:16px} .hint{font-size:11px} }
  @media (prefers-reduced-motion:reduce) { * { animation:none!important; transition:none!important; } }
`;

const BODY = `
<main class="app">
  <div class="hud"><div class="brand">PACMAN</div><div class="stats" aria-label="Game status"><div class="stat"><span>Score</span><strong id="score">0</strong></div><div class="stat"><span>High</span><strong id="high">0</strong></div><div class="stat"><span>Lives</span><strong id="lives">●●●</strong></div></div></div>
  <div class="toolbar"><span class="hint" id="message" aria-live="polite">Arrows / WASD / swipe to move</span><button id="pause">Pause</button><button id="new">New</button></div>
  <div class="game-shell"><canvas id="game" width="570" height="570" aria-label="Pacman maze" role="img"></canvas><div class="overlay" id="overlay"><div class="panel"><h2 id="overlay-title">Ready!</h2><p id="overlay-copy">Clear the maze. Power pellets turn the tables.</p><button id="start">Start game</button></div></div></div>
  <div class="pad" aria-label="Direction controls"><button data-dir="up" aria-label="Move up">▲</button><button data-dir="left" aria-label="Move left">◀</button><button data-dir="down" aria-label="Move down">▼</button><button data-dir="right" aria-label="Move right">▶</button></div>
</main>`;

const JS = `
var MAZE = [
 '###################','#o.......#.......o#','#.###.##.#.##.###.#','#.................#','#.###.#.###.#.###.#','#.....#..#..#.....#','#####.##.#.##.#####','#.....#.....#.....#','#.###.#.###.#.###.#','#.................#','#.###.##.#.##.###.#','#.....#..#..#.....#','#####.##.#.##.#####','#o....#.....#....o#','#.###.#.###.#.###.#','#.................#','#.###.##.#.##.###.#','#........#........#','###################'
];
var W=19,H=19,TILE=30, STEP=1/60, canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
var scoreEl=document.getElementById('score'),highEl=document.getElementById('high'),livesEl=document.getElementById('lives'),messageEl=document.getElementById('message');
var overlay=document.getElementById('overlay'),overlayTitle=document.getElementById('overlay-title'),overlayCopy=document.getElementById('overlay-copy');
var DIR={left:{x:-1,y:0,a:Math.PI},right:{x:1,y:0,a:0},up:{x:0,y:-1,a:-Math.PI/2},down:{x:0,y:1,a:Math.PI/2}};
var score=0,high=0,lives=3,level=1,status='ready',pellets={},pelletCount=0,frightenedUntil=0,last=0,acc=0,elapsed=0,saveClock=0,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
var player,ghosts=[],texture=new Image(),textureReady=false;
texture.onload=function(){textureReady=true;}; texture.src='data:image/webp;base64,${TEXTURE}';
function validateMaze(){ if(MAZE.length!==H) throw new Error('Invalid maze height'); for(var y=0;y<H;y++) if(MAZE[y].length!==W) throw new Error('Invalid maze width at '+y); }
function open(x,y){ if(x<0||x>=W||y<0||y>=H)return false; return MAZE[y].charAt(x)!=='#'; }
function key(x,y){return x+','+y;}
function entity(x,y,dir,color){return{x:x,y:y,dir:dir,next:dir,progress:0,color:color,homeX:x,homeY:y};}
function resetActors(){player=entity(9,17,'left','#ffd84d');ghosts=[entity(9,9,'left','#ff4d6d'),entity(8,9,'up','#ff8bd1'),entity(10,9,'right','#52d9ff'),entity(9,11,'down','#ffad42')];}
function seedPellets(){pellets={};pelletCount=0;for(var y=0;y<H;y++)for(var x=0;x<W;x++)if(open(x,y)&&!(x===9&&y===17)&&!(y===9&&x>=8&&x<=10)){pellets[key(x,y)]=MAZE[y].charAt(x)==='o'?'powerPellet':'pellet';pelletCount++;}}
function updateHud(){scoreEl.textContent=String(score);highEl.textContent=String(high);livesEl.textContent=new Array(lives+1).join('●');}
function canTurn(e,name){var d=DIR[name];return d&&open(e.x+d.x,e.y+d.y);}
function moveEntity(e,speed){if(e.progress<=0.0001){e.progress=0;if(canTurn(e,e.next))e.dir=e.next;if(!canTurn(e,e.dir))return;var d=DIR[e.dir];e.x+=d.x;e.y+=d.y;e.progress=1;}e.progress=Math.max(0,e.progress-speed*STEP);}
function playerSpeed(){return 4.4+(level-1)*.08;}
function ghostSpeed(){return 3.2+(level-1)*.07;}
function frightenedSpeed(){return 2.55+(level-1)*.05;}
function drawPos(e){var d=DIR[e.dir];return{x:(e.x-d.x*e.progress+.5)*TILE,y:(e.y-d.y*e.progress+.5)*TILE};}
function chooseGhostDirection(g,index){var names=['left','right','up','down'],op={left:'right',right:'left',up:'down',down:'up'},valid=[];for(var i=0;i<names.length;i++)if(names[i]!==op[g.dir]&&canTurn(g,names[i]))valid.push(names[i]);if(!valid.length)return op[g.dir];if(elapsed<frightenedUntil)return valid[Math.floor(Math.random()*valid.length)];var target=index===0?player:{x:player.x+DIR[player.dir].x*(index+1),y:player.y+DIR[player.dir].y*(index+1)};valid.sort(function(a,b){var da=DIR[a],db=DIR[b];return Math.abs(g.x+da.x-target.x)+Math.abs(g.y+da.y-target.y)-Math.abs(g.x+db.x-target.x)-Math.abs(g.y+db.y-target.y);});return Math.random()<.18?valid[Math.floor(Math.random()*valid.length)]:valid[0];}
function eat(){var k=key(player.x,player.y),p=pellets[k];if(!p)return;delete pellets[k];pelletCount--;score+=p==='powerPellet'?50:10;if(p==='powerPellet'){frightenedUntil=elapsed+7;messageEl.textContent='Power mode! Chase the ghosts.';}if(score>high)high=score;if(!pelletCount)levelComplete();updateHud();}
function collide(){var pp=drawPos(player);for(var i=0;i<ghosts.length;i++){var gp=drawPos(ghosts[i]);if(Math.hypot(pp.x-gp.x,pp.y-gp.y)<TILE*.55){if(elapsed<frightenedUntil){score+=200;ghosts[i]=entity(ghosts[i].homeX,ghosts[i].homeY,'up',ghosts[i].color);updateHud();}else{loseLife();}return;}}}
function loseLife(){lives--;updateHud();if(lives<=0){status='over';showOverlay('Game over','Score '+score+'. The maze remembers your high score.','Play again');}else{status='ready';resetActors();showOverlay('Ready!','Two lives left. Watch the corners.','Continue');}persist();}
function levelComplete(){level++;score+=500;status='ready';seedPellets();resetActors();showOverlay('Maze cleared!','Level '+level+' is faster.','Next level');persist();}
function fixedUpdate(){if(status!=='playing')return;elapsed+=STEP;saveClock+=STEP;moveEntity(player,playerSpeed());if(player.progress===0)eat();for(var i=0;i<ghosts.length;i++){if(ghosts[i].progress===0)ghosts[i].next=chooseGhostDirection(ghosts[i],i);moveEntity(ghosts[i],elapsed<frightenedUntil?frightenedSpeed():ghostSpeed());}collide();if(saveClock>2){saveClock=0;persist();}}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function drawMaze(){ctx.fillStyle='#02040b';ctx.fillRect(0,0,W*TILE,H*TILE);if(textureReady){ctx.globalAlpha=.1;var p=ctx.createPattern(texture,'repeat');ctx.fillStyle=p;ctx.fillRect(0,0,W*TILE,H*TILE);ctx.globalAlpha=1;}for(var y=0;y<H;y++)for(var x=0;x<W;x++){if(MAZE[y].charAt(x)==='#'){ctx.fillStyle='#10237a';roundRect(x*TILE+2,y*TILE+2,TILE-4,TILE-4,7);ctx.fill();ctx.strokeStyle='#4167ff';ctx.lineWidth=2;ctx.stroke();}else{var p=pellets[key(x,y)];if(p){ctx.fillStyle='#ffe8a3';ctx.beginPath();ctx.arc((x+.5)*TILE,(y+.5)*TILE,p==='powerPellet'?5:2.2,0,Math.PI*2);ctx.fill();}}}}
function drawPlayer(){var p=drawPos(player),a=DIR[player.dir].a,m=reduced?.18:.18+Math.abs(Math.sin(elapsed*11))*.2;ctx.fillStyle='#ffd84d';ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.arc(p.x,p.y,TILE*.4,a+m,a+Math.PI*2-m);ctx.closePath();ctx.fill();}
function drawGhost(g){var p=drawPos(g),fright=elapsed<frightenedUntil;ctx.fillStyle=fright?'#4167ff':g.color;ctx.beginPath();ctx.arc(p.x,p.y-2,TILE*.36,Math.PI,0);ctx.lineTo(p.x+TILE*.36,p.y+TILE*.35);ctx.lineTo(p.x+TILE*.12,p.y+TILE*.2);ctx.lineTo(p.x-TILE*.12,p.y+TILE*.35);ctx.lineTo(p.x-TILE*.36,p.y+TILE*.2);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';for(var s=-1;s<=1;s+=2){ctx.beginPath();ctx.arc(p.x+s*7,p.y-3,4.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#142257';ctx.beginPath();ctx.arc(p.x+s*7+DIR[g.dir].x*2,p.y-3+DIR[g.dir].y*2,2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';}}
function render(){drawMaze();drawPlayer();for(var i=0;i<ghosts.length;i++)drawGhost(ghosts[i]);}
function frame(t){var dt=Math.min(.05,(t-last)/1000||0);last=t;acc+=dt;while(acc>=STEP){fixedUpdate();acc-=STEP;}render();requestAnimationFrame(frame);}
function resize(){var dpr=Math.min(devicePixelRatio||1,2),size=Math.min(570,Math.max(300,canvas.clientWidth));canvas.width=Math.round(size*dpr);canvas.height=Math.round(size*dpr);ctx.setTransform(canvas.width/(W*TILE),0,0,canvas.height/(H*TILE),0,0);mcpApp.resize(Math.ceil(document.body.scrollWidth),Math.ceil(document.body.scrollHeight));}
function setDir(name){if(DIR[name])player.next=name;}
function showOverlay(title,copy,label){overlayTitle.textContent=title;overlayCopy.textContent=copy;document.getElementById('start').textContent=label;overlay.hidden=false;}
function start(){if(status==='over')newGame();status='playing';overlay.hidden=true;messageEl.textContent='Level '+level+' · clear '+pelletCount+' pellets';}
function togglePause(){if(status==='playing'){status='paused';showOverlay('Paused','Take a breath. The ghosts will wait.','Resume');}else if(status==='paused')start();}
function newGame(){score=0;lives=3;level=1;elapsed=0;frightenedUntil=0;seedPellets();resetActors();updateHud();status='ready';persist();}
function persist(){mcpApp.save({score:score,high:high,lives:lives,level:level,pellets:pellets});}
function restore(s){if(!s||typeof s.high!=='number')return;high=s.high;if(s.pellets&&typeof s.score==='number'){score=s.score;lives=Math.max(1,s.lives||3);level=s.level||1;pellets=s.pellets;pelletCount=Object.keys(pellets).length;}updateHud();}
window.addEventListener('keydown',function(e){var keys={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};var n=keys[e.key]||keys[e.key.toLowerCase()];if(n){e.preventDefault();setDir(n);if(status==='ready')start();}else if(e.key===' '){e.preventDefault();togglePause();}});
var sx=0,sy=0;canvas.addEventListener('pointerdown',function(e){sx=e.clientX;sy=e.clientY;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',function(e){var dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))>18){setDir(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));if(status==='ready')start();}});
document.querySelectorAll('[data-dir]').forEach(function(b){b.addEventListener('pointerdown',function(e){e.preventDefault();setDir(b.getAttribute('data-dir'));if(status==='ready')start();});});
document.getElementById('start').addEventListener('click',start);document.getElementById('pause').addEventListener('click',togglePause);document.getElementById('new').addEventListener('click',function(){newGame();showOverlay('Ready!','Clear the maze. Power pellets turn the tables.','Start game');});window.addEventListener('resize',resize);
validateMaze();newGame();resize();requestAnimationFrame(frame);mcpApp.ready().then(function(){return mcpApp.load();}).then(restore);
`;

export const htmlPacman = buildAppHtml({ appId: "pacman", title: "Pacman", css: CSS, body: BODY, js: JS });

export const appPacman: AppCatalogEntry = {
  id: "pacman",
  name: "Pacman",
  description: "Clear the maze, dodge four distinct ghosts, and turn the chase around with power pellets.",
  seo: {
    title: "Play Pacman Online Free | vibe-fun",
    description: "Play a fast, responsive Pacman maze game free in your browser or AI assistant, with four ghosts, power pellets, persistent high scores, and keyboard, swipe, and touch controls.",
    intro: "This compact Pacman-inspired maze chase keeps the classic arcade rhythm: sweep up every pellet, read the ghosts as they approach each junction, protect your remaining lives, and use each limited power pellet at the right moment. Every cleared board starts a quicker level, while your best score stays saved on the device or in the connected MCP host.",
    sections: [
      { heading: "How to play", body: "Use arrow keys or WASD on a keyboard, swipe directly on the maze, or tap the mobile direction pad. Pacman remembers your requested turn and takes it at the next open junction, so you can plan one corner ahead. Clear every small pellet and power pellet to advance to the next level." },
      { heading: "Power pellets", body: "The four large corner pellets briefly frighten every ghost and make them vulnerable. Catch frightened ghosts during that window for bonus points, but keep moving: they recover after several seconds and immediately resume the chase. Saving a power pellet can create a safe escape route late in the level." },
      { heading: "Built for speed", body: "The maze, pellets, player, and ghosts share one high-DPI canvas, backed by a fixed-step game loop that stays consistent across fast and slow screens. A tiny optimized embedded texture adds arcade atmosphere without another network request, while reduced-motion support, capped pixel density, and zero per-frame DOM creation keep play responsive." },
    ],
  },
  version: "1.0.1",
  updatedAt: "2026-08-16",
  toolName: "play_pacman",
  uiResourceUri: "ui://apps/pacman",
  suggestedSize: { width: 620, height: 760 },
  maxHtmlBytes: 96 * 1024,
  html: htmlPacman,
};
