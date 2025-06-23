const Square = function () {
    let mark = '';

    const setMark = (player) => {
        mark = player;
    }

    const getMark = () => mark;

    const resetMark = () => {
        mark = '';
    }

    return { setMark, getMark, resetMark };
}


const Gameboard = function () {
    const row = 3;
    const column = 3;
    const board = []

    // create board grid
    for (let i = 0; i < row; i++) {
        board[i] = [];
        for (let j = 0; j < column; j++) {
            board[i].push(Square())
        }
    }

    const getBoard = () => board;

    const placeMark = (row, column, playerMark) => {
        // stop and send signal when an invalid square is attempted to be filled.
        if (row > 2 || column > 2) return console.log(`${activePlayer}, you are playing outside the board. Try again.`);

        const square = board[row][column];

        // stop and send signal when square is already filled.
        if (square.getMark()) return console.log('Square already has a marker, try another square.')
        square.setMark(playerMark)
    }

    const printBoard = () => {
        const allSquaresInBoard = board.map(row => row.map(square => square.getMark()));
        console.log(allSquaresInBoard)
    }

    const reset = () => {
        board.flat().forEach(square => square.resetMark());
    }

    return {
        getBoard,
        placeMark,
        printBoard,
        reset,
    }
}

const GameController = function (
    playerOne = { name: 'Player One', mark: 'X' },
    playerTwo = { name: 'Player Two', mark: 'O' }
) {
    const board = Gameboard()
    let isGameOver = false;

    const players = [
        {
            name: playerOne.name,
            mark: playerOne.mark,
        },
        {
            name: playerTwo.name,
            mark: playerTwo.mark,
        }
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = (activePlayer === players[0]) ? players[1] : players[0];
    }

    const getActivePlayer = () => activePlayer;

    const playerWins = () => {
        const winningPatternsIndexes = [
            [[0, 0], [0, 1], [0, 2]], // first row
            [[1, 0], [1, 1], [1, 2]], // middle row
            [[2, 0], [2, 1], [2, 2]], // last row

            [[0, 0], [1, 0], [2, 0]], // first column
            [[0, 1], [1, 1], [2, 1]], // second column
            [[0, 2], [1, 2], [2, 2]], // last column

            [[0, 0], [1, 1], [2, 2]], // first diagonal line (\)
            [[0, 2], [1, 1], [2, 0]] // second diagonal line (/)
        ];

        // check patterns in board
        for (let [a, b, c] of winningPatternsIndexes) {
            const squareA = board.getBoard()[a[0]][a[1]].getMark();
            const squareB = board.getBoard()[b[0]][b[1]].getMark();
            const squareC = board.getBoard()[c[0]][c[1]].getMark();

            if ((squareA !== '' && squareA === activePlayer.mark) &&
                (squareB !== '' && squareB === activePlayer.mark) &&
                (squareC !== '' && squareC === activePlayer.mark)
            ) {
                return true;
            }
        }
    }

    const isATie = () => {
        return board.getBoard().flat().every(square => square.getMark() !== '');
    }

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
        console.log("");
    };

    const printRestartMsg = () => {
        console.log('Run your game name attached to .restart() to play again.');
        console.log("");
    }

    const toggleGameOverState = () => {
        isGameOver = !isGameOver
    }

    const restart = () => {
        board.reset()
        isGameOver = isGameOver ? false : null;
    }

    const playRound = (row, column) => {
        if (isGameOver) {
            console.log('game is over.')
            printRestartMsg()
            return;
        }

        console.log(`placing ${activePlayer.name}\'s marker(${activePlayer.mark}) into square[${row}][${column}]`);

        board.placeMark(row, column, activePlayer.mark)

        if (playerWins()) {
            // winning msg
            console.log(`${activePlayer.name} wins, game over!!!!`)
            board.printBoard()
            printRestartMsg();
            toggleGameOverState()
            return;
        }

        if (isATie()) {
            // tie msg
            console.log('It\'s a Tie,')
            printRestartMsg()
            toggleGameOverState()
            return;
        }

        switchPlayerTurn()
        printNewRound()
    }

    // initial round print msg.
    printNewRound()

    return {
        playRound,
        restart,
    }
}

/* uncomment the codes below for quick test run. */

/* 
const game = GameController()

game.playRound(0, 0)
game.playRound(0, 2)
game.playRound(2, 2)
game.playRound(1, 1)
game.playRound(2, 0)
game.playRound(1, 0)
game.playRound(1, 2)
game.playRound(2, 1)
game.playRound(0, 1)

game.restart()
game.playRound(0, 2)
*/