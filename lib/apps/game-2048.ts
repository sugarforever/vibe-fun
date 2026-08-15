import { buildAppHtml } from "./bridge";
import type { AppCatalogEntry } from "./types";

const CSS = `
  .board-wrap { position: relative; width: min(92vw, 480px); }
  .grid {
    display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr);
    gap: 7px; background: var(--ink); border: 3px solid var(--ink); border-radius: 12px;
    padding: 7px; aspect-ratio: 1 / 1; box-shadow: 6px 6px 0 var(--ink);
    touch-action: none; user-select: none;
  }
  .tile {
    display: flex; align-items: center; justify-content: center;
    border-radius: 5px; background: #f2ede4; color: var(--ink);
    font-weight: 900; line-height: 1; transition: transform .08s ease;
    min-width: 0; min-height: 0; overflow: hidden;
  }
  .tile.pop { animation: pop .16s ease; }
  @keyframes pop { 0% { transform: scale(.7); } 60% { transform: scale(1.08); } 100% { transform: scale(1); } }
  .tile[data-val="0"] { color: transparent; background: #eeeae1; }
  .tile[data-val="2"] { background: #ffffff; }
  .tile[data-val="4"] { background: #fff3cf; }
  .tile[data-val="8"] { background: #ffd54a; }
  .tile[data-val="16"] { background: #ffb020; }
  .tile[data-val="32"] { background: #ff8f45; }
  .tile[data-val="64"] { background: #ff6b45; color: #fff; }
  .tile[data-val="128"] { background: #fdc800; }
  .tile[data-val="256"] { background: #ff5c8a; color: #fff; }
  .tile[data-val="512"] { background: #b892ff; color: #1c293c; }
  .tile[data-val="1024"] { background: #7c5cff; color: #fff; }
  .tile[data-val="2048"] { background: #432dd7; color: #fff; }
  .tile[data-big="1"] { background: #1c293c; color: #fdc800; }
  .overlay {
    position: absolute; inset: 0; border-radius: 12px;
    background: rgba(251, 251, 249, .9);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  }
  .overlay[hidden] { display: none; }
  .overlay-msg { font-size: 32px; font-weight: 900; color: var(--ink); letter-spacing: -1px; }
  .overlay-actions { display: flex; gap: 10px; }
`;

const BODY = `
  <div class="header">
    <div class="title">2048</div>
    <div class="scores">
      <div class="score-box"><div class="label">Score</div><div class="val" id="score">0</div></div>
      <div class="score-box"><div class="label">Best</div><div class="val" id="best">0</div></div>
    </div>
  </div>
  <div class="toolbar">
    <div class="hint">Arrows / WASD / swipe &middot; join tiles to reach 2048</div>
    <button id="new">New Game</button>
  </div>
  <div class="board-wrap">
    <div class="grid" id="grid" aria-label="2048 board"></div>
    <div class="overlay" id="overlay" hidden>
      <div class="overlay-msg" id="overlay-msg"></div>
      <div class="overlay-actions">
        <button id="keep" hidden>Keep going</button>
        <button id="restart">New Game</button>
      </div>
    </div>
  </div>
`;

// NOTE: no backticks or ${...} allowed inside this script string.
const JS = `
  var SIZE = 4;
  var board = [];
  var prev = [];
  var score = 0;
  var best = 0;
  var won = false;
  var over = false;

  var gridEl = document.getElementById('grid');
  var scoreEl = document.getElementById('score');
  var bestEl = document.getElementById('best');
  var overlayEl = document.getElementById('overlay');
  var overlayMsg = document.getElementById('overlay-msg');
  var keepBtn = document.getElementById('keep');

  var tiles = [];
  (function buildTiles() {
    for (var i = 0; i < SIZE * SIZE; i++) {
      var t = document.createElement('div');
      t.className = 'tile';
      t.setAttribute('data-val', '0');
      gridEl.appendChild(t);
      tiles.push(t);
    }
  })();

  function emptyBoard() { var a = []; for (var i = 0; i < SIZE * SIZE; i++) a.push(0); return a; }
  function idx(r, c) { return r * SIZE + c; }

  function addRandom() {
    var free = [];
    for (var i = 0; i < board.length; i++) if (board[i] === 0) free.push(i);
    if (!free.length) return -1;
    var pos = free[Math.floor(Math.random() * free.length)];
    board[pos] = Math.random() < 0.9 ? 2 : 4;
    return pos;
  }

  function slide(line) {
    var arr = [];
    for (var i = 0; i < line.length; i++) if (line[i] !== 0) arr.push(line[i]);
    var res = [];
    var gained = 0;
    for (var j = 0; j < arr.length; j++) {
      if (j + 1 < arr.length && arr[j] === arr[j + 1]) {
        var merged = arr[j] * 2;
        res.push(merged);
        gained += merged;
        if (merged === 2048 && !won) won = true;
        j++;
      } else {
        res.push(arr[j]);
      }
    }
    while (res.length < SIZE) res.push(0);
    return { line: res, gained: gained };
  }

  function coord(dir, k, j) {
    if (dir === 0) return idx(k, j);
    if (dir === 1) return idx(k, SIZE - 1 - j);
    if (dir === 2) return idx(j, k);
    return idx(SIZE - 1 - j, k);
  }

  function move(dir) {
    if (over) return;
    var before = board.join(',');
    var gained = 0;
    for (var k = 0; k < SIZE; k++) {
      var line = [];
      for (var j = 0; j < SIZE; j++) line.push(board[coord(dir, k, j)]);
      var out = slide(line);
      gained += out.gained;
      for (var j2 = 0; j2 < SIZE; j2++) board[coord(dir, k, j2)] = out.line[j2];
    }
    if (board.join(',') === before) return;
    score += gained;
    if (score > best) best = score;
    var newPos = addRandom();
    render(newPos);
    persist();
    if (won && overlayEl.hidden && !over) showOverlay('You win!', true);
    if (isOver()) { over = true; showOverlay('Game over!', false); persist(); }
  }

  function isOver() {
    for (var i = 0; i < board.length; i++) if (board[i] === 0) return false;
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var v = board[idx(r, c)];
        if (c + 1 < SIZE && board[idx(r, c + 1)] === v) return false;
        if (r + 1 < SIZE && board[idx(r + 1, c)] === v) return false;
      }
    }
    return true;
  }

  function render(popPos) {
    for (var i = 0; i < tiles.length; i++) {
      var v = board[i];
      var t = tiles[i];
      t.setAttribute('data-val', String(v));
      t.setAttribute('data-big', v > 2048 ? '1' : '0');
      t.textContent = v ? String(v) : '';
      var len = String(v).length;
      t.style.fontSize = v ? (len >= 4 ? 'clamp(14px, 5.2vw, 26px)' : len === 3 ? 'clamp(18px, 6.4vw, 32px)' : 'clamp(22px, 8vw, 40px)') : '0';
      t.classList.remove('pop');
    }
    if (typeof popPos === 'number' && popPos >= 0) {
      var el = tiles[popPos];
      void el.offsetWidth;
      el.classList.add('pop');
    }
    scoreEl.textContent = String(score);
    bestEl.textContent = String(best);
    reportSize();
  }

  function showOverlay(msg, keepable) {
    overlayMsg.textContent = msg;
    keepBtn.hidden = !keepable;
    overlayEl.hidden = false;
  }
  function hideOverlay() { overlayEl.hidden = true; }

  function persist() {
    mcpApp.save({ board: board, score: score, best: best, won: won, over: over });
  }

  function newGame(keepBest) {
    board = emptyBoard();
    score = 0;
    if (!keepBest) best = 0;
    won = false;
    over = false;
    addRandom();
    addRandom();
    hideOverlay();
    render();
    persist();
  }

  var rafPending = false;
  function reportSize() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      mcpApp.resize(Math.ceil(document.body.scrollWidth), Math.ceil(document.body.scrollHeight));
    });
  }

  var DIRS = { ArrowLeft: 0, a: 0, A: 0, ArrowRight: 1, d: 1, D: 1, ArrowUp: 2, w: 2, W: 2, ArrowDown: 3, s: 3, S: 3 };
  window.addEventListener('keydown', function (e) {
    if (e.key in DIRS) { e.preventDefault(); move(DIRS[e.key]); }
  });

  var tsx = 0, tsy = 0, tracking = false;
  gridEl.addEventListener('touchstart', function (e) {
    if (!e.touches.length) return;
    tsx = e.touches[0].clientX; tsy = e.touches[0].clientY; tracking = true;
  }, { passive: true });
  gridEl.addEventListener('touchend', function (e) {
    if (!tracking) return;
    tracking = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - tsx, dy = t.clientY - tsy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : 0);
    else move(dy > 0 ? 3 : 2);
  }, { passive: true });

  document.getElementById('new').addEventListener('click', function () { newGame(true); });
  document.getElementById('restart').addEventListener('click', function () { newGame(true); });
  keepBtn.addEventListener('click', function () { hideOverlay(); });

  // A host may hand us a saved snapshot via tool-result structuredContent.
  mcpApp.onToolResult(function (p) {
    var sc = p && p.structuredContent;
    if (sc && sc.savedState && sc.savedState.board && sc.savedState.board.length === 16 && !board.length) {
      applyState(sc.savedState);
      render();
    }
  });

  function applyState(s) {
    board = s.board.slice();
    score = s.score || 0;
    best = s.best || 0;
    won = !!s.won;
    over = !!s.over;
    if (over) showOverlay('Game over!', false);
  }

  mcpApp.ready()
    .then(function () { return mcpApp.load(); })
    .then(function (state) {
      if (state && state.board && state.board.length === 16) { applyState(state); render(); }
      else { newGame(true); }
    })
    .catch(function () { newGame(true); });
`;

export const html2048 = buildAppHtml({
  appId: "2048",
  title: "2048",
  css: CSS,
  body: BODY,
  js: JS,
});

export const app2048: AppCatalogEntry = {
  id: "2048",
  name: "2048",
  description: "Slide numbered tiles to combine them and reach the 2048 tile.",
  seo: {
    title: "Play 2048 Online",
    description:
      "Play 2048 online for free in your browser or AI assistant. Slide and merge numbered tiles, save progress locally, and work toward the 2048 tile.",
    intro:
      "Play 2048 online with a clean board that works with a keyboard, touch gestures, or an AI assistant. Each move slides every tile in one direction; matching values merge and add to your score. The goal is to build the 2048 tile without filling the four-by-four grid.",
    sections: [
      {
        heading: "How to play 2048",
        body: "Use the arrow keys or WASD on a keyboard, or swipe on a touch screen. Every valid move adds a new tile. Plan several moves ahead, keep your largest tile near a corner, and avoid scattering high-value tiles across the board. You can start a fresh game at any time from the controls above.",
      },
      {
        heading: "Play in your browser or AI assistant",
        body: "The game runs as a self-contained MCP App. Browser progress stays in local storage, while a compatible AI host can render the same interactive game inside a conversation. There is no account, download, or external game service, and the open-source implementation can be self-hosted.",
      },
    ],
  },
  version: "1.0.0",
  toolName: "play_2048",
  uiResourceUri: "ui://apps/2048",
  suggestedSize: { width: 520, height: 640 },
  maxHtmlBytes: 64 * 1024,
  html: html2048,
};
