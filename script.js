const playerList = (function () {
    //player id is index in this list
    const players = [
        createPlayer("X"),
        createPlayer("O"),
    ];

    function createPlayer(symbol) {
        return {
            symbol,
            name: symbol
        }
    }

    function randomID() {
        return Math.floor(Math.random() * players.length);
    }

    function nextPlayerID(previousID) {
        return (previousID + 1) % players.length;
    }

    function getSymbolFor(id) {
        return players[id].symbol;
    }

    function setName(id, name) {
        players[id].name = name;
    }

    function getNameFor(id) {
        return players[id].name;
    }

    function getIDs() {
        return players.keys();
    }

    return {
        randomID,
        nextPlayerID,
        getSymbolFor,
        setName,
        getNameFor,
        getIDs,
    }
})();

const game = (function (doc, players) {
    const board = (function () {
        const state = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];

        const winChecker = (function () {
            function boardWonBy() {
                const winCons = [rowWinner, columnWinner, backDiagWinner, fwdDiagWinner];
                let winner;
                const satisfied = winCons.find(condition => (winner = condition()) !== null);
                if (satisfied) {
                    return winner;
                } else {
                    return null;
                }
            }

            function rowWinner() {
                for (let row of state) {
                    let first = row[0];
                    if (first === null) {
                        continue;
                    }
                    if (row.every(val => val === first)) {
                        return first;
                    }
                }
                return null;
            }

            function columnWinner() {
                column: for (let col = 0; col < state[0].length; col++) {
                    const first = state[0][col];
                    if (first === null) {
                        continue;
                    }
                    for (let row of state) {
                        if (row[col] !== first) {
                            continue column;
                        }
                    }
                    return first;
                }

                return null;
            }

            function backDiagWinner() {
                const first = state[0][0];
                if (first === null) {
                    return null;
                }
                for (let i = 1; i < state.length; i++) {
                    if (state[i][i] !== first) {
                        return null;
                    }
                }
                return first;
            }

            function fwdDiagWinner() {
                const first = state[0].at(-1);
                if (first === null) {
                    return null;
                }
                for (let i = 1; i < state.length; i++) {
                    if (state[i].at(-1 - i) !== first) {
                        return null;
                    }
                }
                return first;
            }

            return {
                boardWonBy,
            }
        })();

        //Attempts to alter board state
        //returns false if illegal move
        //returns true if valid move
        function doMove(player, row, col) {
            if (state[row][col] !== null) {
                console.log("Illegal move.");
                return false;
            }
            state[row][col] = player;
            console.log(state);
            return true;
        }

        //returns null if none found
        //returns player id otherwise
        function gameWonBy() {
            return winChecker.boardWonBy();
        }

        function isFull() {
            for (let row of state) {
                for (let val of row) {
                    if (val === null) {
                        return false;
                    }
                }
            }
            return true;
        }

        function getReadOnlyState() {
            const deepCopy = [];
            for (let row of state) {
                const rowCopy = [];
                for (let val of row) {
                    rowCopy.push(val);
                }
                deepCopy.push(rowCopy);
            }
            return deepCopy;
        }

        function reset() {
            for (let row of state) {
                row.fill(null);
            }
        }

        return {
            doMove,
            gameWonBy,
            getReadOnlyState,
            reset,
            isFull,
        }
    })();

    let currentPlayerId = null;
    let gameWinner = null;
    let gameOver  = false;

    function startGame() {
        gameOver = false;
        gameWinner = null;
        board.reset();
        currentPlayerId = players.randomID();
        console.log(`New game started. Starting with player ${currentPlayerId}`);
    }

    function playTurn(row, col) {
        if (currentPlayerId == null) {
            return;
        }
        if (!board.doMove(currentPlayerId, row, col)) {
            //illegal move
            return;
        }

        let winner = board.gameWonBy();
        if (winner !== null) {
            setGameOver(winner);
        } else {
            if (board.isFull()) {
                setGameOver(null);
            } else {
                swapTurn();
            }
        }
    }

    function swapTurn() {
        currentPlayerId = players.nextPlayerID(currentPlayerId);
        console.log(`Next turn. Your move player ${currentPlayerId}.`)
    }

    function getActivePlayer() {
        return currentPlayerId;
    }

    //if winner == null, game is tied
    //otherwise winner should be player id
    function setGameOver(winner) {
        currentPlayerId = null;
        gameOver = true;
        gameWinner = winner;

        if (winner === null) {
            console.log("gameover : tie");
        } else {
            console.log(`gameover: player ${winner} is the winner`);
        }
    }

    function isGameOver(){
        return gameOver;
    }

    function getGameWinner(){
        return gameWinner;
    }

    return {
        startGame,
        playTurn,
        getBoardState: board.getReadOnlyState,
        getActivePlayer,
        isGameOver,
        getGameWinner,
    }

})(document, playerList);

const gridRows = 3, gridCols = 3;
const gameGrid = (function (doc, rows, cols) {
    const grid = parseGrid();
    function parseGrid() {
        const domCells = Array.from(doc.querySelectorAll(".game-grid .cell"));
        const grid = [];
        let cellIndex = 0;
        for (let row = 0; row < rows; row++) {
            grid[row] = [];
            for (let col = 0; col < cols; col++) {
                grid[row][col] = domCells[cellIndex++];
            }
        }
        return grid;
    }

    function getCellAt(row, col) {
        return grid[row][col];
    }

    function getCellPositionByIndex(cellIndex) {
        return [
            Math.floor(cellIndex / rows),
            cellIndex % rows
        ]
    }

    return {
        getCellAt,
        getCellPositionByIndex,
    }

})(document, gridRows, gridCols);

const gridDisplayer = (function (doc, rows, cols, players, grid) {
    const container = doc.querySelector(".game-grid");

    function update(boardState) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellOccupiedByPlayer = boardState[row][col];
                grid.getCellAt(row, col).textContent = cellOccupiedByPlayer !== null ? players.getSymbolFor(cellOccupiedByPlayer) : "";
            }
        }
    }
    
    function gameOver(){
        container.classList.add("disabled");
    }

    function gameStart(){
        container.classList.remove("disabled");
    }

    return {
        update,
        gameOver,
        gameStart,
    }

})(document, gridRows, gridCols, playerList, gameGrid);

const turnDisplayer = (function (doc, players) {
    const playerTurnIndicators = createTurnIndicators();

    function createTurnIndicators() {
        const playerNodes = [];
        const container = doc.querySelector(".player-turn-indicator");
        for (let playerID of players.getIDs()) {
            const node = doc.createElement("p");
            node.textContent = `player ${players.getSymbolFor(playerID)}`;
            container.appendChild(node);
            playerNodes[playerID] = node;
        }

        return playerNodes;
    }

    function update(activePlayer) {
        for (let playerID of playerTurnIndicators.keys()) {
            playerTurnIndicators[playerID].className = playerID === activePlayer ? "active" : "inactive";
        }
    }

    return {
        update
    }
})(document, playerList);

const gameOverDisplayer = (function (doc, players){
    const div = doc.querySelector(".game-over-display");
    const message = doc.querySelector(".game-over-display-msg");
    
    function display(winnerID){
       message.textContent = `${players.getNameFor(winnerID)} wins`;
       div.classList.remove("hidden");
    }

    function hide(){
        div.style.add = "hidden";
    }

    return {
        display,
        hide
    }
})(document, playerList);

(function (doc, cellGrid) {
    //cell inputs
    const container = doc.querySelector(".game-grid");
    container.addEventListener("click", function (event) {
        const clicked = event.target;
        if (event.target.className !== "cell") {
            return;
        }

        const clickedCellIndex = [...container.children].indexOf(clicked);
        const [cellRow, cellCol] = cellGrid.getCellPositionByIndex(clickedCellIndex);
        game.playTurn(cellRow, cellCol);
        gridDisplayer.update(game.getBoardState());
        if(game.isGameOver()){
            gridDisplayer.gameOver();
            gameOverDisplayer.display(game.getGameWinner());
        }
        turnDisplayer.update(game.getActivePlayer());
    });


    //reset input


    //rename input
})(document, gameGrid);

game.startGame();
turnDisplayer.update(game.getActivePlayer());