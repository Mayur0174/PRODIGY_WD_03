document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const statusDisplay = document.getElementById('status');
    const gameBoard = document.getElementById('game-board');
    const restartButton = document.getElementById('restart-button');
    const pvpButton = document.getElementById('pvp-button');
    const pvaButton = document.getElementById('pva-button');
    const gameModeSelector = document.getElementById('game-mode-selector');
    const exitButton = document.getElementById('exit-button');

    // Game State
    let gameActive = false;
    let currentPlayer = 'X';
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let gameMode = null; // 'pvp' or 'pva'

    const winningMessage = () => `Player ${currentPlayer} has won!`;
    const drawMessage = () => `Game ended in a draw!`;
    const currentPlayerTurn = () => `It's ${currentPlayer}'s turn`;

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    
    // --- Game Logic Functions ---

    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.innerHTML = ''; // Clear any previous content
        clickedCell.classList.add(currentPlayer === 'X' ? 'cell-x' : 'cell-o');
    }

    function handlePlayerChange() {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusDisplay.innerHTML = currentPlayerTurn();
    }
    
    function handleResultValidation() {
        let roundWon = false;
        let winningCombo = [];

        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            const a = gameState[winCondition[0]];
            const b = gameState[winCondition[1]];
            const c = gameState[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                winningCombo = winCondition;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.innerHTML = winningMessage();
            gameActive = false;
            highlightWinningCells(winningCombo);
            return;
        }

        const roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusDisplay.innerHTML = drawMessage();
            gameActive = false;
            return;
        }

        handlePlayerChange();
    }

    function highlightWinningCells(combo) {
        combo.forEach(index => {
            document.querySelector(`[data-cell-index='${index}']`).classList.add('winning-cell', currentPlayer === 'X' ? 'bg-pink-500/20' : 'bg-amber-500/20');
        });
    }

    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

        if (gameState[clickedCellIndex] !== "" || !gameActive) {
            return;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();

        // If game is still active and it's AI's turn
        if (gameActive && gameMode === 'pva' && currentPlayer === 'O') {
            // Disable clicks during AI's turn
            gameBoard.classList.add('pointer-events-none');
            setTimeout(makeAIMove, 700);
        }
    }
    
    function handleRestartGame() {
        gameActive = true;
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusDisplay.innerHTML = currentPlayerTurn();
        document.querySelectorAll('.cell').forEach(cell => {
            cell.innerHTML = '';
            cell.classList.remove('cell-x', 'cell-o', 'winning-cell', 'bg-pink-500/20', 'bg-amber-500/20');
        });
        gameBoard.classList.remove('pointer-events-none');
    }

    function makeAIMove() {
        const availableCells = [];
        gameState.forEach((cell, index) => {
            if (cell === "") {
                availableCells.push(index);
            }
        });

        if (availableCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            const aiMoveIndex = availableCells[randomIndex];
            const aiCell = document.querySelector(`[data-cell-index='${aiMoveIndex}']`);
            
            handleCellPlayed(aiCell, aiMoveIndex);
            handleResultValidation();
        }
        // Re-enable clicks after AI's turn
        gameBoard.classList.remove('pointer-events-none');
    }

    function handleExitGame() {
        gameActive = false;
        gameMode = null;
        
        // Reset board state
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        document.querySelectorAll('.cell').forEach(cell => {
            cell.innerHTML = '';
            cell.classList.remove('cell-x', 'cell-o', 'winning-cell', 'bg-pink-500/20', 'bg-amber-500/20');
        });
        
        // Reset UI to initial state
        statusDisplay.innerHTML = "Choose a game mode to start!";
        gameBoard.style.opacity = '0.5';
        gameBoard.classList.add('pointer-events-none');
        gameModeSelector.classList.remove('hidden');
    }

    function startGame(mode) {
        gameMode = mode;
        gameActive = true;
        gameBoard.style.opacity = '1';
        gameBoard.classList.remove('pointer-events-none');
        gameModeSelector.classList.add('hidden');
        statusDisplay.innerHTML = currentPlayerTurn();
        handleRestartGame();
    }

    // --- Initial Setup & Event Listeners ---
    
    function createBoard() {
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', 'bg-white/50', 'rounded-lg', 'flex', 'items-center', 'justify-center', 'cursor-pointer', 'relative', 'transition-colors', 'duration-200', 'hover:bg-white/90');
            cell.setAttribute('data-cell-index', i);
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }
    
    createBoard();
    restartButton.addEventListener('click', () => {
        if (gameMode) { // Only restart if a mode was selected
            handleRestartGame();
        } else {
            statusDisplay.textContent = "Please select a game mode first!"
        }
    });
    pvpButton.addEventListener('click', () => startGame('pvp'));
    pvaButton.addEventListener('click', () => startGame('pva'));
    exitButton.addEventListener('click', handleExitGame);

});
