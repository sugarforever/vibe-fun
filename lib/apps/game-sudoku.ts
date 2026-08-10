import { buildAppHtml } from "./bridge";
import type { AppCatalogEntry } from "./types";
import { z } from "zod";

const CSS = `
  .sudoku-wrap { position: relative; width: min(94vw, 460px); }
  .board {
    display: grid; grid-template-columns: repeat(9, 1fr); grid-template-rows: repeat(9, 1fr);
    aspect-ratio: 1 / 1; border: 3px solid #33302b; border-radius: 6px; overflow: hidden;
    background: #fff; user-select: none; touch-action: manipulation;
  }
  .cell {
    display: flex; align-items: center; justify-content: center;
    border-right: 1px solid #d5cfc4; border-bottom: 1px solid #d5cfc4;
    font-weight: 700; font-size: clamp(16px, 5.6vw, 27px); color: #3366cc; cursor: pointer;
    min-width: 0; min-height: 0;
  }
  .cell.given { color: #33302b; cursor: default; }
  .cell.box-right { border-right: 2px solid #33302b; }
  .cell.box-bottom { border-bottom: 2px solid #33302b; }
  .cell.peer { background: #f3efe6; }
  .cell.same { background: #e6ddc7; }
  .cell.sel { background: #cde0b8; }
  .cell.conflict { color: #d23f31; }
  .cell.wrong { background: #fbdcd8; color: #d23f31; }
  .status { width: min(94vw, 460px); display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
  .status .timer { font-variant-numeric: tabular-nums; font-weight: 700; }
  .diff { display: flex; align-items: center; gap: 6px; }
  select { font: inherit; padding: 5px 8px; border-radius: 8px; border: 1px solid var(--muted); background: #fff; color: var(--fg); }
  .pad { width: min(94vw, 460px); display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .pad button { padding: 12px 0; font-size: 20px; background: #efe9dc; color: #33302b; }
  .pad button.erase { grid-column: span 1; }
  .actions { width: min(94vw, 460px); display: flex; gap: 8px; }
  .actions button { flex: 1; }
  .actions button.ghost { background: #efe9dc; color: #33302b; }
  .overlay {
    position: absolute; inset: 0; border-radius: 6px; background: rgba(250, 248, 239, .82);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  }
  .overlay[hidden] { display: none; }
  .overlay-msg { font-size: 28px; font-weight: 800; color: var(--fg); }
`;

const BODY = `
  <div class="header">
    <div class="title" style="font-size:32px">Sudoku</div>
    <div class="diff">
      <label for="difficulty" class="hint">Difficulty</label>
      <select id="difficulty">
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </div>
  </div>
  <div class="status">
    <div class="timer" id="timer">00:00</div>
    <div class="hint" id="clues"></div>
  </div>
  <div class="sudoku-wrap">
    <div class="board" id="board" aria-label="Sudoku board"></div>
    <div class="overlay" id="overlay" hidden>
      <div class="overlay-msg" id="overlay-msg"></div>
      <button id="overlay-new">New Puzzle</button>
    </div>
  </div>
  <div class="pad" id="pad"></div>
  <div class="actions">
    <button class="ghost" id="check">Check</button>
    <button class="ghost" id="solve">Solve</button>
    <button id="new">New</button>
  </div>
`;

// NOTE: no backticks or ${...} allowed inside this script string.
const JS = `
  var boardEl = document.getElementById('board');
  var padEl = document.getElementById('pad');
  var timerEl = document.getElementById('timer');
  var cluesEl = document.getElementById('clues');
  var overlayEl = document.getElementById('overlay');
  var overlayMsg = document.getElementById('overlay-msg');
  var diffSel = document.getElementById('difficulty');

  var puzzle = new Array(81).fill(0);
  var solution = new Array(81).fill(0);
  var cells = new Array(81).fill(0);
  var given = new Array(81).fill(false);
  var sel = -1;
  var seconds = 0;
  var solved = false;
  var moved = false;
  var wrongSet = {};
  var difficulty = 'easy';
  var timer = null;

  function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function fullSolved() {
    function pat(r, c) { return (3 * (r % 3) + Math.floor(r / 3) + c) % 9; }
    var bandOrder = shuffle([0, 1, 2]);
    var rows = [];
    bandOrder.forEach(function (b) { shuffle([0, 1, 2]).forEach(function (r) { rows.push(b * 3 + r); }); });
    var stackOrder = shuffle([0, 1, 2]);
    var cols = [];
    stackOrder.forEach(function (s) { shuffle([0, 1, 2]).forEach(function (c) { cols.push(s * 3 + c); }); });
    var nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    var grid = new Array(81);
    for (var i = 0; i < 9; i++) for (var j = 0; j < 9; j++) grid[i * 9 + j] = nums[pat(rows[i], cols[j])];
    if (Math.random() < 0.5) {
      var g2 = new Array(81);
      for (var r2 = 0; r2 < 9; r2++) for (var c2 = 0; c2 < 9; c2++) g2[c2 * 9 + r2] = grid[r2 * 9 + c2];
      grid = g2;
    }
    return grid;
  }

  function okAt(arr, pos, val) {
    var r = Math.floor(pos / 9), c = pos % 9;
    for (var k = 0; k < 9; k++) {
      if (arr[r * 9 + k] === val) return false;
      if (arr[k * 9 + c] === val) return false;
    }
    var br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) if (arr[(br + i) * 9 + (bc + j)] === val) return false;
    return true;
  }

  function countSolutions(arr, limit) {
    var count = 0;
    function firstEmpty() { for (var i = 0; i < 81; i++) if (arr[i] === 0) return i; return -1; }
    function bt() {
      if (count >= limit) return;
      var pos = firstEmpty();
      if (pos === -1) { count++; return; }
      for (var v = 1; v <= 9; v++) {
        if (okAt(arr, pos, v)) { arr[pos] = v; bt(); arr[pos] = 0; if (count >= limit) return; }
      }
    }
    bt();
    return count;
  }

  function makePuzzle(diff) {
    var sol = fullSolved();
    var puz = sol.slice();
    var targetGivens = diff === 'hard' ? 26 : (diff === 'medium' ? 32 : 40);
    var order = shuffle(range(81));
    var givens = 81;
    for (var idx = 0; idx < order.length && givens > targetGivens; idx++) {
      var pos = order[idx];
      if (puz[pos] === 0) continue;
      var backup = puz[pos];
      puz[pos] = 0;
      var test = puz.slice();
      if (countSolutions(test, 2) !== 1) { puz[pos] = backup; }
      else { givens--; }
    }
    return { puzzle: puz, solution: sol, givens: givens };
  }

  function buildCells() {
    boardEl.innerHTML = '';
    for (var i = 0; i < 81; i++) {
      var d = document.createElement('div');
      d.className = 'cell';
      var c = i % 9, r = Math.floor(i / 9);
      if (c === 2 || c === 5) d.className += ' box-right';
      if (r === 2 || r === 5) d.className += ' box-bottom';
      (function (pos) { d.addEventListener('click', function () { selectCell(pos); }); })(i);
      boardEl.appendChild(d);
    }
  }
  var cellEls = [];

  function computeConflicts() {
    var bad = {};
    function scan(getPos) {
      var seen = {};
      for (var k = 0; k < 9; k++) {
        var pos = getPos(k), v = cells[pos];
        if (!v) continue;
        if (seen[v] !== undefined) { bad[pos] = true; bad[seen[v]] = true; }
        else seen[v] = pos;
      }
    }
    for (var r = 0; r < 9; r++) scan(function (k) { return r * 9 + k; });
    for (var c = 0; c < 9; c++) scan(function (k) { return k * 9 + c; });
    for (var b = 0; b < 9; b++) {
      var br = Math.floor(b / 3) * 3, bc = (b % 3) * 3;
      scan(function (k) { return (br + Math.floor(k / 3)) * 9 + (bc + (k % 3)); });
    }
    return bad;
  }

  function render() {
    if (!cellEls.length) cellEls = Array.prototype.slice.call(boardEl.children);
    var conflicts = computeConflicts();
    var selVal = sel >= 0 ? cells[sel] : 0;
    var selR = sel >= 0 ? Math.floor(sel / 9) : -1;
    var selC = sel >= 0 ? sel % 9 : -1;
    var selB = sel >= 0 ? (Math.floor(selR / 3) * 3 + Math.floor(selC / 3)) : -1;
    for (var i = 0; i < 81; i++) {
      var el = cellEls[i];
      var v = cells[i];
      var cls = 'cell';
      var c = i % 9, r = Math.floor(i / 9);
      if (c === 2 || c === 5) cls += ' box-right';
      if (r === 2 || r === 5) cls += ' box-bottom';
      if (given[i]) cls += ' given';
      if (sel >= 0 && i !== sel) {
        var b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        if (r === selR || c === selC || b === selB) cls += ' peer';
        if (v && v === selVal) cls += ' same';
      }
      if (i === sel) cls += ' sel';
      if (conflicts[i]) cls += ' conflict';
      if (wrongSet[i]) cls += ' wrong';
      el.className = cls;
      el.textContent = v ? String(v) : '';
    }
    cluesEl.textContent = countFilled() + ' / 81';
    reportSize();
  }

  function countFilled() { var n = 0; for (var i = 0; i < 81; i++) if (cells[i]) n++; return n; }

  function selectCell(pos) {
    sel = pos;
    render();
  }

  function setValue(v) {
    if (sel < 0 || given[sel] || solved) return;
    cells[sel] = v;
    wrongSet = {};
    moved = true;
    render();
    persist();
    checkWin();
  }

  function clearValue() { setValue(0); }

  function checkWin() {
    for (var i = 0; i < 81; i++) if (cells[i] !== solution[i]) return;
    solved = true;
    stopTimer();
    overlayMsg.textContent = 'Solved! ' + timerEl.textContent;
    overlayEl.hidden = false;
    persist();
  }

  function doCheck() {
    wrongSet = {};
    for (var i = 0; i < 81; i++) if (cells[i] && cells[i] !== solution[i]) wrongSet[i] = true;
    render();
  }

  function doSolve() {
    for (var i = 0; i < 81; i++) cells[i] = solution[i];
    wrongSet = {};
    solved = true;
    stopTimer();
    render();
    overlayMsg.textContent = 'Solved';
    overlayEl.hidden = false;
    persist();
  }

  function applyPuzzle(p, s) {
    puzzle = p.slice();
    solution = s.slice();
    cells = p.slice();
    given = p.map(function (v) { return v !== 0; });
    sel = -1;
    wrongSet = {};
    solved = false;
    moved = false;
    overlayEl.hidden = true;
    render();
    startTimer();
  }

  function newPuzzle(diff) {
    difficulty = diff || difficulty;
    diffSel.value = difficulty;
    overlayMsg.textContent = 'Generating...';
    overlayEl.hidden = false;
    seconds = 0;
    updateTimer();
    setTimeout(function () {
      var made = makePuzzle(difficulty);
      applyPuzzle(made.puzzle, made.solution);
      persist();
    }, 20);
  }

  function updateTimer() {
    var m = Math.floor(seconds / 60), s = seconds % 60;
    timerEl.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function startTimer() {
    stopTimer();
    timer = setInterval(function () { if (!solved) { seconds++; updateTimer(); if (seconds % 5 === 0) persist(); } }, 1000);
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function persist() {
    mcpApp.save({ difficulty: difficulty, puzzle: puzzle, solution: solution, cells: cells, seconds: seconds, solved: solved });
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

  // number pad
  for (var n = 1; n <= 9; n++) {
    (function (val) {
      var b = document.createElement('button');
      b.textContent = String(val);
      b.addEventListener('click', function () { setValue(val); });
      padEl.appendChild(b);
    })(n);
  }
  var eraseBtn = document.createElement('button');
  eraseBtn.textContent = 'Erase';
  eraseBtn.className = 'erase';
  eraseBtn.addEventListener('click', clearValue);
  padEl.appendChild(eraseBtn);

  window.addEventListener('keydown', function (e) {
    if (e.key >= '1' && e.key <= '9') { setValue(parseInt(e.key, 10)); return; }
    if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') { clearValue(); return; }
    if (sel < 0) return;
    var r = Math.floor(sel / 9), c = sel % 9;
    if (e.key === 'ArrowLeft' && c > 0) { e.preventDefault(); selectCell(sel - 1); }
    else if (e.key === 'ArrowRight' && c < 8) { e.preventDefault(); selectCell(sel + 1); }
    else if (e.key === 'ArrowUp' && r > 0) { e.preventDefault(); selectCell(sel - 9); }
    else if (e.key === 'ArrowDown' && r < 8) { e.preventDefault(); selectCell(sel + 9); }
  });

  document.getElementById('check').addEventListener('click', doCheck);
  document.getElementById('solve').addEventListener('click', doSolve);
  document.getElementById('new').addEventListener('click', function () { newPuzzle(difficulty); });
  document.getElementById('overlay-new').addEventListener('click', function () { newPuzzle(difficulty); });
  diffSel.addEventListener('change', function () { newPuzzle(diffSel.value); });

  mcpApp.onToolInput(function (p) {
    var args = (p && p.arguments) || p || {};
    var d = args.difficulty;
    if (d && (d === 'easy' || d === 'medium' || d === 'hard') && !moved && d !== difficulty) newPuzzle(d);
  });

  buildCells();
  cellEls = Array.prototype.slice.call(boardEl.children);

  mcpApp.ready()
    .then(function () { return mcpApp.load(); })
    .then(function (state) {
      if (state && state.cells && state.cells.length === 81 && state.solution && state.solution.length === 81) {
        difficulty = state.difficulty || 'easy';
        diffSel.value = difficulty;
        puzzle = state.puzzle.slice();
        solution = state.solution.slice();
        cells = state.cells.slice();
        given = puzzle.map(function (v) { return v !== 0; });
        seconds = state.seconds || 0;
        solved = !!state.solved;
        updateTimer();
        overlayEl.hidden = true;
        render();
        if (!solved) startTimer();
        else { overlayMsg.textContent = 'Solved'; overlayEl.hidden = false; }
      } else {
        newPuzzle(difficulty);
      }
    })
    .catch(function () { newPuzzle(difficulty); });
`;

export const htmlSudoku = buildAppHtml({
  appId: "sudoku",
  title: "Sudoku",
  css: CSS,
  body: BODY,
  js: JS,
});

export const appSudoku: AppCatalogEntry = {
  id: "sudoku",
  name: "Sudoku",
  description:
    "Fill the 9x9 grid so every row, column, and 3x3 box contains 1-9. Puzzles have a unique solution.",
  version: "1.0.0",
  toolName: "play_sudoku",
  uiResourceUri: "ui://apps/sudoku",
  suggestedSize: { width: 500, height: 760 },
  maxHtmlBytes: 96 * 1024,
  html: htmlSudoku,
  inputSchema: {
    difficulty: z
      .enum(["easy", "medium", "hard"])
      .optional()
      .describe("Puzzle difficulty. Defaults to easy."),
  },
};
