const boardEl    = document.getElementById('board');
const messageEl  = document.getElementById('message');
const startBtn   = document.getElementById('start-btn');

let cols, rows, mines, board, gameOver;

startBtn.addEventListener('click', init);

function init() {
  cols   = +document.getElementById('cols').value;
  rows   = +document.getElementById('rows').value;
  mines  = +document.getElementById('mines-count').value;
  gameOver = false;
  messageEl.textContent = '';

  boardEl.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
  boardEl.innerHTML = '';
  board = [];

  // 셀 생성
  for (let y = 0; y < rows; y++) {
    board[y] = [];
    for (let x = 0; x < cols; x++) {
      board[y][x] = { mine:false, revealed:false, flagged:false, adjacent:0 };
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.addEventListener('click',  onReveal);
      cell.addEventListener('contextmenu', onFlag);
      boardEl.appendChild(cell);
    }
  }

  // 지뢰 배치
  let placed = 0;
  while (placed < mines) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    if (!board[y][x].mine) {
      board[y][x].mine = true;
      placed++;
    }
  }

  // 인접 지뢰 수 계산
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (board[y][x].mine) continue;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy, nx = x + dx;
          if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && board[ny][nx].mine) {
            count++;
          }
        }
      }
      board[y][x].adjacent = count;
    }
  }
}

function onReveal(e) {
  if (gameOver) return;
  const x = +e.target.dataset.x;
  const y = +e.target.dataset.y;
  revealCell(x, y);
  checkWin();
}

function onFlag(e) {
  e.preventDefault();
  if (gameOver) return;
  const x = +e.target.dataset.x;
  const y = +e.target.dataset.y;
  const obj = board[y][x];
  if (!obj.revealed) {
    obj.flagged = !obj.flagged;
    e.target.classList.toggle('flagged');
    e.target.textContent = obj.flagged ? '🚩' : '';
  }
  checkWin();
}

function revealCell(x, y) {
  const obj = board[y][x];
  const el  = boardEl.querySelector(`[data-x="${x}"][data-y="${y}"]`);
  if (obj.revealed || obj.flagged) return;
  obj.revealed = true;
  el.classList.add('revealed');

  if (obj.mine) {
    el.textContent = '💣';
    endGame(false);
  } else if (obj.adjacent > 0) {
    el.textContent = obj.adjacent;
  } else {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const ny = y + dy, nx = x + dx;
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
          revealCell(nx, ny);
        }
      }
    }
  }
}

function endGame(win) {
  gameOver = true;
  // 모든 지뢰 공개
  boardEl.querySelectorAll('.cell').forEach(el => {
    const x = +el.dataset.x, y = +el.dataset.y;
    if (board[y][x].mine && !board[y][x].flagged) {
      el.textContent = '💣';
      el.classList.add('revealed');
    }
  });
  messageEl.textContent = win ? '성공!' : '실패!';
}

function checkWin() {
  if (gameOver) return;
  let revealedCount = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (board[y][x].revealed && !board[y][x].mine) revealedCount++;
    }
  }
  if (revealedCount === cols * rows - mines) {
    endGame(true);
  }
}
