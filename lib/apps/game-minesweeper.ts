import { buildAppHtml } from "./bridge";
import type { AppCatalogEntry } from "./types";

const CSS = `
  body { width: 100%; overflow-x: hidden; }
  .app { width: 100%; max-width: 760px; display: flex; flex-direction: column; gap: 12px; }
  .header { max-width: none; }
  .title { font-size: clamp(30px, 8vw, 40px); }
  .status-cards { display: flex; gap: 8px; }
  .status-card {
    min-width: 70px; padding: 6px 10px; color: #fff; background: var(--ink);
    border: 2px solid var(--ink); border-radius: 8px; text-align: center; box-shadow: var(--sh-sm);
  }
  .status-card span { display: block; font-size: 11px; font-weight: 800; opacity: .72; text-transform: uppercase; letter-spacing: .5px; }
  .status-card strong { display: block; font-size: 20px; font-variant-numeric: tabular-nums; }
  .controls { display: flex; flex-wrap: wrap; align-items: end; gap: 9px; }
  .field { display: flex; flex-direction: column; gap: 4px; }
  .field label { font-size: 11px; color: var(--muted); font-weight: 800; text-transform: uppercase; letter-spacing: .4px; }
  select, input {
    height: 40px; border: 2px solid var(--ink); border-radius: 8px; background: #fff;
    color: var(--ink); font: inherit; font-weight: 750; padding: 6px 9px; box-shadow: 2px 2px 0 var(--ink);
  }
  select:focus-visible, input:focus-visible { outline: 3px solid var(--violet); outline-offset: 2px; }
  input { width: 76px; }
  .custom-controls { display: flex; align-items: end; flex-wrap: wrap; gap: 8px; }
  .custom-controls[hidden] { display: none; }
  .error { width: 100%; min-height: 18px; margin: 0; color: #b42318; font-size: 13px; font-weight: 750; }
  .board-shell {
    position: relative; width: 100%; overflow-x: auto; padding: 3px 5px 8px 3px;
    scrollbar-color: var(--ink) transparent;
  }
  .board {
    --cell: 32px; display: grid; width: max-content; min-width: min(100%, 280px);
    grid-template-columns: repeat(var(--cols), var(--cell)); grid-auto-rows: var(--cell);
    gap: 2px; padding: 5px; margin: 0 auto; background: var(--ink); border: 3px solid var(--ink);
    border-radius: 10px; box-shadow: 5px 5px 0 var(--ink); user-select: none; touch-action: manipulation;
  }
  .cell {
    width: var(--cell); height: var(--cell); min-width: 0; padding: 0; border: 0; border-radius: 4px;
    background: #fff; box-shadow: inset -2px -2px 0 #c8ced8, inset 2px 2px 0 #fff;
    display: grid; place-items: center; font-size: calc(var(--cell) * .57); font-weight: 950;
    line-height: 1; cursor: pointer; transition: transform .08s ease, background .08s ease;
  }
  .cell:hover { transform: none; box-shadow: inset -2px -2px 0 #aeb7c4, inset 2px 2px 0 #fff; background: #fff8d7; }
  .cell:active { transform: scale(.94); }
  .cell.revealed { cursor: default; background: #e8ebef; box-shadow: none; }
  .cell.flagged { background: #fff2b0; color: #b42318; }
  .cell.mine { background: #ffdad6; }
  .cell.exploded { background: #ff665c; }
  .cell.wrong-flag { background: #ffd7d7; color: #b42318; }
  .cell[data-count="1"] { color: #2957c8; }
  .cell[data-count="2"] { color: #147443; }
  .cell[data-count="3"] { color: #cc3025; }
  .cell[data-count="4"] { color: #4a2ba8; }
  .cell[data-count="5"] { color: #8b241e; }
  .cell[data-count="6"] { color: #087c83; }
  .cell[data-count="7"] { color: #202a3b; }
  .cell[data-count="8"] { color: #687284; }
  .cell:focus-visible { position: relative; z-index: 1; outline: 3px solid var(--violet); outline-offset: 1px; }
  .message-row { min-height: 26px; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .message { margin: 0; font-weight: 850; color: var(--ink); }
  .help { margin: 0; color: var(--muted); font-size: 12px; font-weight: 650; }
  .overlay {
    position: absolute; inset: 3px 5px 8px 3px; display: flex; align-items: center; justify-content: center;
    border-radius: 10px; background: rgba(251,251,249,.88); backdrop-filter: blur(2px);
  }
  .overlay[hidden] { display: none; }
  .overlay-card {
    max-width: 330px; display: flex; flex-direction: column; align-items: center; gap: 11px;
    padding: 24px; background: #fff; border: 3px solid var(--ink); border-radius: 12px;
    box-shadow: 6px 6px 0 var(--ink); text-align: center;
  }
  .overlay-card h2 { margin: 0; font-size: 28px; }
  .overlay-card p { margin: 0; color: var(--muted); font-weight: 650; }
  .overlay-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 9px; }
  .ghost { background: #fff; }
  .share-result { white-space: pre-line; font-size: 13px; }
  @media (max-width: 520px) {
    body { padding: 12px 8px; }
    .header { align-items: flex-start; }
    .status-card { min-width: 60px; padding: 5px 7px; }
    .status-card strong { font-size: 18px; }
    .controls > .field:first-child { flex: 1; }
    select { width: 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .001ms !important; animation-duration: .001ms !important; }
  }
`;

const BODY = `
  <main class="app">
    <div class="header">
      <div class="title">Minesweeper</div>
      <div class="status-cards" aria-label="Game status">
        <div class="status-card"><span>Mines</span><strong id="mine-count">10</strong></div>
        <div class="status-card"><span>Time</span><strong id="timer">000</strong></div>
      </div>
    </div>

    <div class="controls">
      <div class="field">
        <label for="mode">Board</label>
        <select id="mode">
          <option value="beginner">Beginner · 9×9</option>
          <option value="intermediate">Intermediate · 16×16</option>
          <option value="expert">Expert · 30×16</option>
          <option value="custom">Custom</option>
          <option value="daily">Daily challenge</option>
        </select>
      </div>
      <div class="custom-controls" id="custom-controls" hidden>
        <div class="field"><label for="custom-width">Width</label><input id="custom-width" type="number" min="5" max="30" value="12" inputmode="numeric" /></div>
        <div class="field"><label for="custom-height">Height</label><input id="custom-height" type="number" min="5" max="30" value="12" inputmode="numeric" /></div>
        <div class="field"><label for="custom-mines">Mines</label><input id="custom-mines" type="number" min="1" value="24" inputmode="numeric" /></div>
        <button id="start-custom">Start</button>
      </div>
      <button id="new-game">New game</button>
      <p class="error" id="custom-error" role="alert"></p>
    </div>

    <div class="message-row">
      <p class="message" id="message" aria-live="polite">Choose a square to begin.</p>
      <span class="hint" id="daily-label"></span>
    </div>

    <div class="board-shell" id="board-shell">
      <div class="board" id="board" role="grid" aria-label="Minefield"></div>
      <div class="overlay" id="overlay" hidden>
        <div class="overlay-card">
          <h2 id="overlay-title">You cleared it!</h2>
          <p id="overlay-detail"></p>
          <p class="share-result" id="share-result" hidden></p>
          <div class="overlay-actions">
            <button id="share" hidden>Copy result</button>
            <button id="play-again">Play again</button>
          </div>
        </div>
      </div>
    </div>

    <p class="help">Tap or left-click to reveal · long-press or right-click to flag · arrow keys to move · F to flag</p>
  </main>
`;

// NOTE: no backticks or interpolation markers are allowed inside this script string.
const JS = `
  var PRESETS = {
    beginner: { width: 9, height: 9, mines: 10 },
    intermediate: { width: 16, height: 16, mines: 40 },
    expert: { width: 30, height: 16, mines: 99 },
    daily: { width: 16, height: 16, mines: 40 }
  };
  var modeEl = document.getElementById('mode');
  var customControlsEl = document.getElementById('custom-controls');
  var customWidthEl = document.getElementById('custom-width');
  var customHeightEl = document.getElementById('custom-height');
  var customMinesEl = document.getElementById('custom-mines');
  var customErrorEl = document.getElementById('custom-error');
  var boardEl = document.getElementById('board');
  var mineCountEl = document.getElementById('mine-count');
  var timerEl = document.getElementById('timer');
  var messageEl = document.getElementById('message');
  var dailyLabelEl = document.getElementById('daily-label');
  var overlayEl = document.getElementById('overlay');
  var overlayTitleEl = document.getElementById('overlay-title');
  var overlayDetailEl = document.getElementById('overlay-detail');
  var shareEl = document.getElementById('share');
  var shareResultEl = document.getElementById('share-result');

  var mode = 'beginner';
  var width = 9;
  var height = 9;
  var mineTotal = 10;
  var mines = [];
  var counts = [];
  var revealed = [];
  var flagged = [];
  var cells = [];
  var started = false;
  var status = 'ready';
  var elapsed = 0;
  var firstIndex = -1;
  var timerHandle = null;
  var dailyHistory = {};
  var focusIndex = 0;
  var longPressTimer = null;
  var longPressed = false;

  function todayKey() {
    var d = new Date();
    var y = String(d.getFullYear());
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function formatTime(value) { return String(Math.min(999, value)).padStart(3, '0'); }

  function neighbors(index) {
    var result = [];
    var row = Math.floor(index / width);
    var col = index % width;
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        var nr = row + dr;
        var nc = col + dc;
        if (nr >= 0 && nr < height && nc >= 0 && nc < width) result.push(nr * width + nc);
      }
    }
    return result;
  }

  function hashString(value) {
    var hash = 2166136261;
    for (var i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededRandom(seed) {
    var state = seed >>> 0;
    return function () {
      state += 0x6D2B79F5;
      var value = state;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function clearTimer() {
    if (timerHandle !== null) window.clearInterval(timerHandle);
    timerHandle = null;
  }

  function startTimer() {
    if (timerHandle !== null || status !== 'playing') return;
    timerHandle = window.setInterval(function () {
      elapsed = Math.min(999, elapsed + 1);
      timerEl.textContent = formatTime(elapsed);
      if (elapsed === 999) clearTimer();
      persist();
    }, 1000);
  }

  function blankArray(length, value) {
    var arr = [];
    for (var i = 0; i < length; i++) arr.push(value);
    return arr;
  }

  function configFor(selected) {
    if (selected === 'custom') {
      return {
        width: Number(customWidthEl.value),
        height: Number(customHeightEl.value),
        mines: Number(customMinesEl.value)
      };
    }
    return PRESETS[selected] || PRESETS.beginner;
  }

  function validateCustom(showMessage) {
    var w = Number(customWidthEl.value);
    var h = Number(customHeightEl.value);
    var m = Number(customMinesEl.value);
    var error = '';
    if (!Number.isInteger(w) || w < 5 || w > 30) error = 'Width must be a whole number from 5 to 30.';
    else if (!Number.isInteger(h) || h < 5 || h > 30) error = 'Height must be a whole number from 5 to 30.';
    else if (!Number.isInteger(m) || m < 1 || m > w * h - 9) error = 'Mines must be between 1 and ' + (w * h - 9) + '.';
    if (showMessage) customErrorEl.textContent = error;
    return error === '';
  }

  function newGame(selected) {
    mode = selected || mode;
    if (mode === 'custom' && !validateCustom(true)) return;
    clearTimer();
    var config = configFor(mode);
    width = config.width;
    height = config.height;
    mineTotal = config.mines;
    var size = width * height;
    mines = blankArray(size, false);
    counts = blankArray(size, 0);
    revealed = blankArray(size, false);
    flagged = blankArray(size, false);
    cells = [];
    started = false;
    status = 'ready';
    elapsed = 0;
    firstIndex = -1;
    focusIndex = 0;
    customErrorEl.textContent = '';
    overlayEl.hidden = true;
    shareEl.hidden = true;
    shareResultEl.hidden = true;
    messageEl.textContent = mode === 'daily' ? "Today's field is ready." : 'Choose a square to begin.';
    dailyLabelEl.textContent = mode === 'daily' ? todayKey() : '';
    modeEl.value = mode;
    customControlsEl.hidden = mode !== 'custom';
    buildBoard();
    render();
    persist();
  }

  function chooseCellSize() {
    var available = Math.max(280, Math.min(740, document.documentElement.clientWidth - 30));
    var ideal = Math.floor((available - 16 - (width - 1) * 2) / width);
    return Math.max(23, Math.min(40, ideal));
  }

  function buildBoard() {
    boardEl.innerHTML = '';
    boardEl.style.setProperty('--cols', String(width));
    boardEl.style.setProperty('--cell', chooseCellSize() + 'px');
    boardEl.setAttribute('aria-rowcount', String(height));
    boardEl.setAttribute('aria-colcount', String(width));
    for (var i = 0; i < width * height; i++) {
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('data-index', String(i));
      cell.tabIndex = i === focusIndex ? 0 : -1;
      boardEl.appendChild(cell);
      cells.push(cell);
    }
    requestSize();
  }

  function requestSize() {
    window.setTimeout(function () {
      var targetWidth = Math.min(780, Math.max(340, document.body.scrollWidth + 24));
      var targetHeight = Math.min(860, document.body.scrollHeight + 24);
      mcpApp.resize(targetWidth, targetHeight);
    }, 0);
  }

  function placeMines(first) {
    var safeZone = {};
    safeZone[first] = true;
    var near = neighbors(first);
    for (var i = 0; i < near.length; i++) safeZone[near[i]] = true;
    var candidates = [];
    for (var p = 0; p < width * height; p++) if (!safeZone[p]) candidates.push(p);
    var random = mode === 'daily' ? seededRandom(hashString(todayKey() + ':' + first)) : Math.random;
    for (var end = candidates.length - 1; end > 0; end--) {
      var swap = Math.floor(random() * (end + 1));
      var tmp = candidates[end];
      candidates[end] = candidates[swap];
      candidates[swap] = tmp;
    }
    for (var n = 0; n < mineTotal; n++) mines[candidates[n]] = true;
    for (var c = 0; c < counts.length; c++) {
      if (mines[c]) { counts[c] = -1; continue; }
      var around = neighbors(c);
      var total = 0;
      for (var a = 0; a < around.length; a++) if (mines[around[a]]) total++;
      counts[c] = total;
    }
    started = true;
    status = 'playing';
    firstIndex = first;
    messageEl.textContent = 'Game in progress.';
    startTimer();
  }

  function reveal(index) {
    if (status === 'won' || status === 'lost' || flagged[index]) return;
    if (!started) placeMines(index);
    if (revealed[index]) { chord(index); return; }
    if (mines[index]) { lose(index); return; }
    var queue = [index];
    var seen = {};
    while (queue.length) {
      var current = queue.shift();
      if (seen[current] || flagged[current] || revealed[current]) continue;
      seen[current] = true;
      revealed[current] = true;
      if (counts[current] === 0) {
        var around = neighbors(current);
        for (var i = 0; i < around.length; i++) if (!mines[around[i]]) queue.push(around[i]);
      }
    }
    checkWin();
    render();
    persist();
  }

  function toggleFlag(index) {
    if (status === 'won' || status === 'lost' || revealed[index]) return;
    flagged[index] = !flagged[index];
    render();
    persist();
  }

  function chord(index) {
    if (!revealed[index] || counts[index] <= 0 || status !== 'playing') return;
    var around = neighbors(index);
    var flags = 0;
    for (var i = 0; i < around.length; i++) if (flagged[around[i]]) flags++;
    if (flags !== counts[index]) {
      messageEl.textContent = 'That number needs ' + counts[index] + ' neighboring flags.';
      return;
    }
    for (var j = 0; j < around.length; j++) {
      var next = around[j];
      if (flagged[next] || revealed[next]) continue;
      if (mines[next]) { lose(next); return; }
      reveal(next);
    }
  }

  function checkWin() {
    var hiddenSafe = 0;
    for (var i = 0; i < mines.length; i++) if (!mines[i] && !revealed[i]) hiddenSafe++;
    if (hiddenSafe !== 0) return;
    status = 'won';
    clearTimer();
    for (var m = 0; m < mines.length; m++) if (mines[m]) flagged[m] = true;
    if (mode === 'daily') {
      var key = todayKey();
      var old = dailyHistory[key];
      dailyHistory[key] = { completed: true, bestTime: old && old.bestTime ? Math.min(old.bestTime, elapsed) : elapsed };
    }
    showEnd(true, -1);
  }

  function lose(exploded) {
    status = 'lost';
    clearTimer();
    for (var i = 0; i < mines.length; i++) if (mines[i]) revealed[i] = true;
    render(exploded);
    showEnd(false, exploded);
    persist();
  }

  function dailyShareText(won) {
    var result = won ? 'Cleared' : 'Uncleared';
    var marker = won ? '🟩' : '⬛';
    return 'Minesweeper Daily ' + todayKey() + String.fromCharCode(10) + marker + ' ' + result + ' in ' + formatTime(elapsed) + 's' + String.fromCharCode(10) + '💣 16×16 · 40 mines';
  }

  function showEnd(won) {
    render();
    overlayTitleEl.textContent = won ? 'Field cleared!' : 'Mine triggered!';
    overlayDetailEl.textContent = won ? 'Finished in ' + elapsed + ' seconds.' : 'The field will be waiting for another try.';
    shareEl.hidden = mode !== 'daily';
    shareResultEl.hidden = mode !== 'daily';
    if (mode === 'daily') shareResultEl.textContent = dailyShareText(won);
    overlayEl.hidden = false;
    messageEl.textContent = won ? 'You found every safe square.' : 'Game over.';
    persist();
    requestSize();
  }

  function flaggedCount() {
    var result = 0;
    for (var i = 0; i < flagged.length; i++) if (flagged[i]) result++;
    return result;
  }

  function cellLabel(index) {
    var row = Math.floor(index / width) + 1;
    var col = index % width + 1;
    var prefix = 'Row ' + row + ', column ' + col + ', ';
    if (status === 'lost' && flagged[index] && !mines[index]) return prefix + 'incorrect flag';
    if (flagged[index]) return prefix + 'flagged';
    if (!revealed[index]) return prefix + 'hidden';
    if (mines[index]) return prefix + 'mine';
    return prefix + (counts[index] === 0 ? 'empty' : counts[index] + ' neighboring mines');
  }

  function render(exploded) {
    mineCountEl.textContent = String(mineTotal - flaggedCount());
    timerEl.textContent = formatTime(elapsed);
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var isWrong = status === 'lost' && flagged[i] && !mines[i];
      var className = 'cell';
      var text = '';
      if (isWrong) { className += ' wrong-flag'; text = '×'; }
      else if (flagged[i]) { className += ' flagged'; text = '⚑'; }
      else if (revealed[i]) {
        className += ' revealed';
        if (mines[i]) { className += i === exploded ? ' exploded' : ' mine'; text = '✹'; }
        else if (counts[i] > 0) text = String(counts[i]);
      }
      cell.className = className;
      cell.textContent = text;
      cell.setAttribute('data-count', revealed[i] && counts[i] > 0 ? String(counts[i]) : '0');
      cell.setAttribute('aria-label', cellLabel(i));
      cell.setAttribute('aria-pressed', flagged[i] ? 'true' : 'false');
      cell.tabIndex = i === focusIndex ? 0 : -1;
    }
  }

  function persist() {
    mcpApp.save({
      schema: 1, mode: mode, width: width, height: height, mineTotal: mineTotal,
      mines: mines, counts: counts, revealed: revealed, flagged: flagged,
      started: started, status: status, elapsed: elapsed, firstIndex: firstIndex,
      custom: { width: Number(customWidthEl.value), height: Number(customHeightEl.value), mines: Number(customMinesEl.value) },
      dailyHistory: dailyHistory
    });
  }

  function validBooleanArray(value, length) {
    if (!Array.isArray(value) || value.length !== length) return false;
    for (var i = 0; i < value.length; i++) if (typeof value[i] !== 'boolean') return false;
    return true;
  }

  function restore(saved) {
    if (!saved || saved.schema !== 1 || typeof saved.mode !== 'string') return false;
    var w = saved.width;
    var h = saved.height;
    var total = saved.mineTotal;
    var length = w * h;
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < 5 || w > 30 || h < 5 || h > 30) return false;
    if (!Number.isInteger(total) || total < 1 || total > length - 9) return false;
    if (!validBooleanArray(saved.mines, length) || !validBooleanArray(saved.revealed, length) || !validBooleanArray(saved.flagged, length)) return false;
    if (!Array.isArray(saved.counts) || saved.counts.length !== length) return false;
    mode = PRESETS[saved.mode] || saved.mode === 'custom' ? saved.mode : 'beginner';
    width = w; height = h; mineTotal = total;
    mines = saved.mines; counts = saved.counts; revealed = saved.revealed; flagged = saved.flagged;
    started = saved.started === true;
    status = saved.status === 'playing' || saved.status === 'won' || saved.status === 'lost' ? saved.status : 'ready';
    elapsed = Number.isInteger(saved.elapsed) ? Math.max(0, Math.min(999, saved.elapsed)) : 0;
    firstIndex = Number.isInteger(saved.firstIndex) ? saved.firstIndex : -1;
    dailyHistory = saved.dailyHistory && typeof saved.dailyHistory === 'object' ? saved.dailyHistory : {};
    if (saved.custom) {
      customWidthEl.value = String(saved.custom.width || 12);
      customHeightEl.value = String(saved.custom.height || 12);
      customMinesEl.value = String(saved.custom.mines || 24);
    }
    modeEl.value = mode;
    customControlsEl.hidden = mode !== 'custom';
    dailyLabelEl.textContent = mode === 'daily' ? todayKey() : '';
    buildBoard();
    render();
    if (status === 'playing') { messageEl.textContent = 'Game in progress.'; startTimer(); }
    else if (status === 'won') showEnd(true);
    else if (status === 'lost') showEnd(false);
    else messageEl.textContent = 'Choose a square to begin.';
    return true;
  }

  function targetIndex(event) {
    var cell = event.target.closest('.cell');
    if (!cell || !boardEl.contains(cell)) return -1;
    return Number(cell.getAttribute('data-index'));
  }

  boardEl.addEventListener('click', function (event) {
    var index = targetIndex(event);
    if (index < 0) return;
    if (longPressed) { longPressed = false; return; }
    focusIndex = index;
    reveal(index);
  });
  boardEl.addEventListener('contextmenu', function (event) {
    var index = targetIndex(event);
    if (index < 0) return;
    event.preventDefault();
    focusIndex = index;
    toggleFlag(index);
  });
  boardEl.addEventListener('pointerdown', function (event) {
    var index = targetIndex(event);
    if (index < 0 || event.pointerType === 'mouse') return;
    longPressed = false;
    longPressTimer = window.setTimeout(function () {
      longPressed = true;
      focusIndex = index;
      toggleFlag(index);
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500);
  });
  function cancelLongPress() {
    if (longPressTimer !== null) window.clearTimeout(longPressTimer);
    longPressTimer = null;
  }
  boardEl.addEventListener('pointerup', cancelLongPress);
  boardEl.addEventListener('pointercancel', cancelLongPress);
  boardEl.addEventListener('pointermove', cancelLongPress);
  boardEl.addEventListener('keydown', function (event) {
    var index = targetIndex(event);
    if (index < 0) return;
    var next = index;
    if (event.key === 'ArrowLeft') next = Math.max(0, index - 1);
    else if (event.key === 'ArrowRight') next = Math.min(width * height - 1, index + 1);
    else if (event.key === 'ArrowUp') next = Math.max(0, index - width);
    else if (event.key === 'ArrowDown') next = Math.min(width * height - 1, index + width);
    else if (event.key === 'f' || event.key === 'F') { event.preventDefault(); toggleFlag(index); return; }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); reveal(index); return; }
    else return;
    event.preventDefault();
    focusIndex = next;
    render();
    cells[next].focus();
  });

  modeEl.addEventListener('change', function () {
    customControlsEl.hidden = modeEl.value !== 'custom';
    customErrorEl.textContent = '';
    if (modeEl.value !== 'custom') newGame(modeEl.value);
    requestSize();
  });
  document.getElementById('start-custom').addEventListener('click', function () { newGame('custom'); });
  document.getElementById('new-game').addEventListener('click', function () { newGame(modeEl.value); });
  document.getElementById('play-again').addEventListener('click', function () { newGame(mode); });
  shareEl.addEventListener('click', function () {
    var text = shareResultEl.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { shareEl.textContent = 'Copied!'; }).catch(function () { shareEl.textContent = 'Select result to copy'; });
    } else shareEl.textContent = 'Select result to copy';
  });
  window.addEventListener('resize', function () {
    boardEl.style.setProperty('--cell', chooseCellSize() + 'px');
  });

  mcpApp.ready()
    .then(function () { return mcpApp.load(); })
    .then(function (saved) {
      if (!restore(saved)) newGame('beginner');
      requestSize();
    });
`;

export const htmlMinesweeper = buildAppHtml({
  appId: "minesweeper",
  title: "Minesweeper",
  css: CSS,
  body: BODY,
  js: JS,
});

export const appMinesweeper: AppCatalogEntry = {
  id: "minesweeper",
  name: "Minesweeper",
  description:
    "Clear the field without triggering a mine — classic, custom, and daily boards.",
  seo: {
    title: "Play Minesweeper Online",
    description:
      "Play Minesweeper online for free with beginner, intermediate, expert, custom, and daily boards. Flag mines, clear safe cells, and save progress locally.",
    intro:
      "Play Minesweeper online with classic beginner, intermediate, and expert boards, or create a custom minefield. Reveal every safe square without opening a mine. Each number tells you how many mines touch that square, turning the board into a logic puzzle that rewards careful deduction instead of guessing.",
    sections: [
      {
        heading: "How to play Minesweeper",
        body: "Click or tap to reveal a square, then right-click, long-press, or use the keyboard to place a flag. Use numbered clues together: when a number already touches the correct number of flags, its other covered neighbors are safe. The first move is protected, and chord controls make larger boards quicker to clear.",
      },
      {
        heading: "Classic, custom, and daily boards",
        body: "Choose a standard difficulty, set your own width, height, and mine count, or play the shared daily challenge. The browser stores progress locally so you can continue without an account. The same self-contained MCP App can also run inside a compatible AI assistant while keeping the familiar Minesweeper rules and controls.",
      },
    ],
  },
  version: "1.0.0",
  toolName: "play_minesweeper",
  uiResourceUri: "ui://apps/minesweeper",
  suggestedSize: { width: 760, height: 720 },
  maxHtmlBytes: 128 * 1024,
  html: htmlMinesweeper,
};
