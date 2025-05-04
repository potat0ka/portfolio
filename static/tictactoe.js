'use strict';

const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const aiToggleBtn = document.getElementById('aiToggleBtn');

let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let vsAI = false;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Handle cell click
function handleCellClick(e) {
    const cellIndex = parseInt(e.target.getAttribute('data-index'));

    if (gameBoard[cellIndex] !== '' || !gameActive) return;

    makeMove(cellIndex, currentPlayer);

    if (vsAI && gameActive && currentPlayer === 'O') {
        setTimeout(makeAIMove, 500);
    }
}

// Make a move
function makeMove(index, player) {
    gameBoard[index] = player;
    cells[index].textContent = player;
    cells[index].style.color = player === 'X' ? '#ff6b6b' : '#66ccff';

    if (checkWin()) {
        statusDisplay.textContent = `Player ${player} Wins!`;
        gameActive = false;
        return;
    }

    if (gameBoard.every(cell => cell !== '')) {
        statusDisplay.textContent = "It's a Tie!";
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
}

// Check for a win
function checkWin() {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return gameBoard[index] === currentPlayer;
        });
    });
}

// AI move (simple: random available cell)
function makeAIMove() {
    const availableCells = gameBoard
        .map((cell, index) => (cell === '' ? index : null))
        .filter(index => index !== null);

    if (availableCells.length === 0) return;

    const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    makeMove(randomIndex, 'O');
}

// Restart game
function restartGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.color = '#ff6b6b';
    });
}

// Toggle AI mode
function toggleAIMode() {
    vsAI = !vsAI;
    aiToggleBtn.textContent = vsAI ? 'Play vs Human' : 'Play vs AI';
    restartGame();
}

// Event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
aiToggleBtn.addEventListener('click', toggleAIMode);

// Initialize game
statusDisplay.textContent = `Player ${currentPlayer}'s Turn`;