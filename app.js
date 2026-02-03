(() => {
  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const restartBtn = document.getElementById('restartBtn');
  const aiToggle = document.getElementById('aiToggle');

  /**
   * Board indices:
   * 0 1 2
   * 3 4 5
   * 6 7 8
   */
  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  const HUMAN = 'X';
  const AI = 'O';

  let cells = Array.from(boardEl.querySelectorAll('.cell'));
  let board = Array(9).fill('');
  let current = HUMAN;
  let gameOver = false;

  function winnerInfo(b) {
    for (const [a, c, d] of LINES) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { winner: b[a], line: [a, c, d] };
      }
    }
    if (b.every(v => v)) return { winner: 'draw', line: [] };
    return { winner: null, line: [] };
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function render() {
    cells.forEach((cell, i) => {
      cell.textContent = board[i];
      cell.disabled = gameOver || Boolean(board[i]) || (aiToggle.checked && current === AI);
      cell.classList.remove('win');
    });

    const { winner, line } = winnerInfo(board);
    if (winner === HUMAN) {
      setStatus('X wins!');
      line.forEach(i => cells[i].classList.add('win'));
    } else if (winner === AI) {
      setStatus(aiToggle.checked ? 'AI (O) wins!' : 'O wins!');
      line.forEach(i => cells[i].classList.add('win'));
    } else if (winner === 'draw') {
      setStatus("It's a draw.");
    } else {
      setStatus(`${current}'s turn${aiToggle.checked && current === AI ? ' (AI thinking…)': ''}`);
    }
  }

  function reset() {
    board = Array(9).fill('');
    current = HUMAN;
    gameOver = false;
    render();
  }

  function makeMove(i, player) {
    if (gameOver || board[i]) return false;
    board[i] = player;

    const { winner } = winnerInfo(board);
    if (winner) {
      gameOver = true;
    } else {
      current = (player === HUMAN) ? AI : HUMAN;
    }

    render();
    return true;
  }

  function availableMoves(b) {
    const out = [];
    for (let i = 0; i < 9; i++) if (!b[i]) out.push(i);
    return out;
  }

  // Perfect-play minimax (small state space, no need for heavy optimization)
  function minimax(b, player) {
    const { winner } = winnerInfo(b);
    if (winner === AI) return { score: 10 };
    if (winner === HUMAN) return { score: -10 };
    if (winner === 'draw') return { score: 0 };

    const moves = [];
    for (const i of availableMoves(b)) {
      const next = b.slice();
      next[i] = player;
      const res = minimax(next, player === AI ? HUMAN : AI);
      moves.push({ i, score: res.score });
    }

    // choose best score for current player
    if (player === AI) {
      let best = { i: moves[0].i, score: -Infinity };
      for (const m of moves) {
        if (m.score > best.score) best = m;
      }
      return best;
    } else {
      let best = { i: moves[0].i, score: Infinity };
      for (const m of moves) {
        if (m.score < best.score) best = m;
      }
      return best;
    }
  }

  function aiMove() {
    if (gameOver || !aiToggle.checked || current !== AI) return;
    // slight delay for UX
    window.setTimeout(() => {
      if (gameOver || current !== AI) return;
      const { i } = minimax(board, AI);
      if (typeof i === 'number') makeMove(i, AI);
    }, 220);
  }

  function onCellClick(e) {
    const btn = e.target.closest('.cell');
    if (!btn) return;
    const i = Number(btn.dataset.i);

    if (aiToggle.checked) {
      if (current !== HUMAN) return;
      if (makeMove(i, HUMAN)) aiMove();
    } else {
      makeMove(i, current);
    }
  }

  boardEl.addEventListener('click', onCellClick);
  restartBtn.addEventListener('click', reset);
  aiToggle.addEventListener('change', () => {
    // switching modes mid-game can be confusing — reset
    reset();
  });

  // init
  reset();
})();
