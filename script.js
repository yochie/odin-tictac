const game = (function (doc) {
    const board = (function () {
        const state = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];

        const winChecker = (function () {
            function boardWonBy() {
                let winner;

                if ((winner = rowWinner())) {
                    return winner;
                }

                if ((winner = columnWinner())) {
                    return winner;
                }

                if ((winner = backDiagWinner())) {
                    return winner;
                }

                if ((winner = fwdDiagWinner())) {
                    return winner;
                }

                return null;
            }

            function rowWinner() {
                for (let row of boardState) {
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
            // check if all slots are filled
            for (let row of state) {
                for (let val of row) {
                    if (!val) {
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
                for (let col = 0; col < row.length; col++) {
                    row[col] = null;
                }
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

    let currentPlayerIndex = null;
    const players = [createPlayer(1, "X"), createPlayer(2, "O")];

    function createPlayer(id, symbol) {
        return {
            id, symbol
        }
    }

    function startGame() {
        board.reset();
        currentPlayerIndex = Math.floor(Math.random() * 2);
        console.log(`New game started. Starting with player ${players[currentPlayerIndex].id}`);
    }

    function playTurn(row, col) {
        if (currentPlayerIndex == null) {
            return;
        }
        if (!board.doMove(players[currentPlayerIndex].id, row, col)) {
            //illegal move
            return;
        }

        let winner = board.gameWonBy();
        if (winner) {
            gameOver(winner);
        } else {
            if (board.isFull()) {
                gameOver(null);
            } else {
                swapTurn();
            }
        }
    }

    function swapTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        console.log(`Next turn. Your move player ${players[currentPlayerIndex].id}.`)
    }

    //if winner == null, game is tied
    //otherwise winner should be player id
    function gameOver(winner) {
        currentPlayerIndex = null;
        //do some ui stuff...
        if (!winner) {
            console.log("gameover : tie");
        } else {
            console.log(`gameover: player ${winner} is the winner`);
        }
    }

    return {
        startGame,
        playTurn,
        state: board.getReadOnlyState
    }

})(document);