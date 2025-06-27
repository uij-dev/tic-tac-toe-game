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


const gameBoard = (function () {
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
        if (square.getMark()) return false;
        square.setMark(playerMark)
        return true;
    }

    const reset = () => {
        board.flat().forEach(square => square.resetMark());
    }

    return {
        getBoard,
        placeMark,
        reset,
    }
})()

const gameController = (function (
    playerOneName = "",
    playerTwoName = "",
) {
    let isGameOver = false;
    let gameMessage = "";

    const players = [
        {
            name: playerOneName,
            mark: "X",
            score: 0,
        },
        {
            name: playerTwoName,
            mark: "O",
            score: 0,
        }
    ];

    let activePlayer = players[0];

    function switchPlayerTurn() {
        activePlayer = (activePlayer === players[0]) ? players[1] : players[0];
    }

    function getActivePlayer() {
        return activePlayer;
    }

    function setPlayerNames(p1Name, p2Name) {
        players[0].name = p1Name;
        players[1].name = p2Name;
    }

    function playerWins() {
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
            const squareA = gameBoard.getBoard()[a[0]][a[1]].getMark();
            const squareB = gameBoard.getBoard()[b[0]][b[1]].getMark();
            const squareC = gameBoard.getBoard()[c[0]][c[1]].getMark();

            if ((squareA !== '' && squareA === activePlayer.mark) &&
                (squareB !== '' && squareB === activePlayer.mark) &&
                (squareC !== '' && squareC === activePlayer.mark)
            ) {
                return true;
            }
        }
    }

    function isATie() {
        return gameBoard.getBoard().flat().every(square => square.getMark() !== '');
    }

    function updateGameMessage(msg) {
        gameMessage = msg || `It's ${activePlayer.name}'s turn.`;
    }

    const getGameMessage = () => gameMessage;

    function toggleGameOverState() {
        isGameOver = !isGameOver
    }

    function restart() {
        gameBoard.reset()
        isGameOver = isGameOver ? false : null;
    }

    function playRound(row, column) {
        if (isGameOver) {
            updateGameMessage("over");
            return;
        }

        let placing = gameBoard.placeMark(row, column, activePlayer.mark)
        if (!placing) {
            updateGameMessage(`Square already has a marker, try another square ${activePlayer.name}.`);
            return;
        }

        if (playerWins()) {
            toggleGameOverState();
            updateGameMessage(`${activePlayer.name} wins!!`);
            return;
        }

        if (isATie()) {
            updateGameMessage("Draw");
            toggleGameOverState();
            return;
        }

        switchPlayerTurn();
        updateGameMessage();
    }

    return {
        playRound,
        restart,
        getGameMessage,
        getActivePlayer,
        setPlayerNames,
        updateGameMessage
    }
})();

const displayContoller = (function () {
    const boardOnPage = document.querySelector(".board");
    const pageLoadModal = document.querySelector(".modal--page-load");
    const pageLoadForm = document.querySelector(".page-load-form");
    const p1InputElem = pageLoadForm.querySelector("#name-p1");
    const p2InputElem = pageLoadForm.querySelector("#name-p2");
    const p1NameDisplay = document.querySelector(".p1-name-display");
    const p2NameDisplay = document.querySelector(".p2-name-display");
    const msgBox = document.querySelector(".msg-box");
    const boardSquaresOnPage = document.querySelectorAll(".board__square");
    const finalMsgDisplay = document.querySelector(".game-over-modal__final-msg");
    const gameOverModal = document.querySelector(".game-over-modal");
    const main = document.querySelector(".main");

    pageLoadModal.showModal();
    togglePageScrollValue("hidden");

    pageLoadForm.addEventListener("click", e => {
        if (e.target.classList.contains("btn--start")) {
            const playerNames = getPlayerNames();
            const p1Name = playerNames[0] || "thor";
            const p2Name = playerNames[1] || "loki";

            p1NameDisplay.innerText = p1Name;
            p2NameDisplay.innerText = p2Name;

            gameController.setPlayerNames(p1Name, p2Name);
            gameController.updateGameMessage();
            updateMsgBox(gameController.getGameMessage())
            pageLoadModal.close();
            togglePageScrollValue("auto");
            updateBoardOnPage()
        }

    })

    main.addEventListener("click", e => {
        if (e.target.classList.contains("btn--cancel")) {
            clearInputs();
            pageLoadModal.close()
            boardOnPage.classList.toggle("board--deactivate");
            togglePageScrollValue("auto");
            msgBox.textContent = "restart page to play, if you change your mind."
        }

        if (e.target.classList.contains("btn--cancel") && e.target.parentElement.parentElement === gameOverModal) {
            gameOverModal.close();
        }
    })

    boardOnPage.addEventListener("click", e => {
        const elem = e.target;
        if (elem.classList.contains("board__square")) {
            gameController.playRound(elem.dataset.row, elem.dataset.column)
            updateBoardOnPage();
            updateMsgBox(gameController.getGameMessage())

            if (gameController.getGameMessage().includes("Draw") || gameController.getGameMessage().includes("win")) {
                finalMsgDisplay.textContent = gameController.getGameMessage();
                document.querySelector(".game-over-modal").showModal();
            }
        }
    })

    gameOverModal.addEventListener("click", e => {
        if (e.target.classList.contains("btn--restart")) {
            gameController.restart();
            pageLoadModal.showModal();
            gameOverModal.close()
        }
    })

    function getPlayerNames() {
        return [p1InputElem.value, p2InputElem.value];
    }

    function togglePageScrollValue(value) {
        document.body.style.overflow = value;
    }

    function updateMsgBox(msg) {
        msgBox.textContent = msg;
    }

    function clearInputs() {
        p1InputElem.value = "";
        p2InputElem.value = "";
    }

    function updateBoardOnPage() {
        gameBoard.getBoard().flat().forEach((square, index) => {
            boardSquaresOnPage[index].querySelector(".board__square-mark").textContent = square.getMark();
        });
    }
})()