const squareArr = document.querySelectorAll('.square');
const moveNumber = document.querySelector('[data-moveNumber]');
const showThreatsButton = document.querySelector('[data-showThreats]');

//negative values are for black pieces
const EMPTY = 0;
const KING = 1;
const QUEEN = 2;
const ROOK = 3;
const BISHOP = 4;
const KNIGHT = 5;
const PAWN = 6;
const MAHARAJAH = 7;
const TIMEWARPER = 8;
const NECROMANCER = 9;
const BLACK = -1;
const WHITE = 1;

let magicSquare = -1;
let playerMoves = [];

const board = [
    [-ROOK, -KNIGHT, -BISHOP, -QUEEN, -KING, -BISHOP, -KNIGHT, -ROOK],
    [-PAWN, -PAWN, -PAWN, -PAWN, -PAWN, -PAWN, -PAWN, -PAWN],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
    [EMPTY, TIMEWARPER, EMPTY, NECROMANCER, KING, EMPTY, MAHARAJAH, EMPTY]
];

const history = {
    moveNum: 0,
    arr: [cloneBoard(board)],
    pushPosition: function(board) {
        this.moveNum++;
        while(this.arr.length > this.moveNum) {
            this.arr.pop();
        }
        this.arr.push(cloneBoard(board));
        this.drawMoveNumber();
        hologramTracker.pushPosition(this.moveNum);
    }, 
    undo: function() {
        if(this.moveNum > 0) {
            this.moveNum--;
            this.overWriteGlobalBoard(this.arr[this.moveNum]);
            this.drawMoveNumber();
            hologramTracker.undo(this.moveNum);
        }
    },
    redo: function() {
        if(this.moveNum+1 < this.arr.length) {
            this.moveNum++;
            this.overWriteGlobalBoard(this.arr[this.moveNum]);
            this.drawMoveNumber();
            hologramTracker.redo(this.moveNum);
        }
    },
    overWriteGlobalBoard: function (newBoard) {
        for(let i=0; i<board.length; i++) {
            for(let j=0; j<board.length; j++) {
                board[i][j] = newBoard[i][j];
            }
        }
    },
    drawMoveNumber() {
        moveNumber.innerText = 'MoveNumber: ' + this.moveNum;
    }
};

const hologramTracker = {
    isAlive: true,
    row: 7,
    col: 1,
    square: 57,
    arr: [57],
    updateHologramPosition1(_square) {
        this.row = Math.floor(_square/board.length);
        this.col = _square%board.length;
        this.square = _square;
    },
    updateHologramPosition2(_row, _col) {
        this.row = _row;
        this.col = _col;
        this.square = _row*board.length + _col;
    },
    timewarperExists() {
        for(let i=0; i<board.length; i++) {
            for(let j=0; j<board.length; j++) {
                if(board[i][j] === TIMEWARPER) {
                    return true;
                }
            }
        }
        return false;
    },
    pushPosition(moveNum) {
        while(this.arr.length > moveNum) {
            this.arr.pop();
        }
        this.arr.push(this.square);
    }, 
    undo(moveNum) {
        if(this.timewarperExists()) {
            this.isAlive = true;
        } else {
            this.isAlive = false;
        }
        this.updateHologramPosition1(this.arr[moveNum]);
    },
    redo(moveNum) {
        if(this.timewarperExists()) {
            this.isAlive = true;
        } else {
            this.isAlive = false;
        }
        this.updateHologramPosition1(this.arr[moveNum]);
    },
};


const timerArea = {
    topTimerRef: document.querySelector('[data-topTimer]'),
    botTimerRef: document.querySelector('[data-botTimer]'),
    scoreDisplay: document.querySelector('[data-scoreDisplay]'),
    playerBotName: 'PB',
    playerTopName: 'PT',
    topScore: 0,
    botScore: 0,
    topTime: 1*1000*60,
    botTime: 1*1000*60,
    bonusTime: 0,
    runningTimer: 0,     //-1 bottom player, 0 no one, 1 top player
    colorsSwapped: false,
    currentTimeout: null,
    prevDate: null,
    setUpEventListeners() {
        const playerTopInput = document.querySelector('[data-playerTopInput]');
        const playerBotInput = document.querySelector('[data-playerBotInput]');
        const gameTimeSelect = document.querySelector('#gameTimeSelect');
        const newGameButton = document.querySelector('[data-newGameButton]');
        const swapColorsButton = document.querySelector('[data-swapColors]');

        playerBotInput.addEventListener('change', () => {
            timerArea.playerBotName = playerBotInput.value;
            this.drawScoreBoard();
        });
        playerTopInput.addEventListener('change', () => {
            timerArea.playerTopName = playerTopInput.value;
            this.drawScoreBoard();
        })

        swapColorsButton.addEventListener('click', () => {
            timerArea.colorsSwapped = !timerArea.colorsSwapped;
            const newBoard = [
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
            ];
            for(let i=0; i<board.length; i++) {
                for(let j=0; j<board.length; j++) {
                    newBoard[i][j] = board[board.length - 1 - i][board.length - 1 - j];
                }
            }
            history.overWriteGlobalBoard(newBoard);
            hologramTracker.updateHologramPosition2(board.length-1-hologramTracker.row, board.length-1-hologramTracker.col);
            drawPieces();
        })


        newGameButton.addEventListener('click', () => {
            this.runningTimer = 0;
            this.prevDate = null;
            if(gameTimeSelect.value == '1+2') {
                this.topTime = 1*1000*60; this.botTime = 1*1000*60;
                this.bonusTime = 2*1000;
            } else if(gameTimeSelect.value == '3+3') {
                this.topTime = 3*1000*60; this.botTime = 3*1000*60;
                this.bonusTime = 3*1000;
            } else if(gameTimeSelect.value == '5+5') {
                this.topTime = 5*1000*60; this.botTime = 5*1000*60;
                this.bonusTime = 5*1000;
            } else if(gameTimeSelect.value == '10+5') {
                this.topTime = 10*1000*60; this.botTime = 10*1000*60;
                this.bonusTime = 5*1000;
            }

            //RESET EVERYTHING
            const Defaultboard = [
                [-ROOK, -KNIGHT, -BISHOP, -QUEEN, -KING, -BISHOP, -KNIGHT, -ROOK],
                [-PAWN, -PAWN, -PAWN, -PAWN, -PAWN, -PAWN, -PAWN, -PAWN],
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
                [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
                [EMPTY, TIMEWARPER, EMPTY, NECROMANCER, KING, EMPTY, MAHARAJAH, EMPTY]
            ];
            history.moveNum = 0;
            history.arr = [cloneBoard(Defaultboard)];
            history.overWriteGlobalBoard(Defaultboard);
            hologramTracker.isAlive = true;
            hologramTracker.row = 7;
            hologramTracker.col = 1;
            hologramTracker.square = 57;
            hologramTracker.arr = [57];
            timerArea.currentTimeout = null;
            timerArea.prevDate = null;
            timerArea.colorsSwapped = false;

            drawSquares();
            drawPieces();

            timerArea.drawTime();
        });        
    },
    runTimer() {
        if(this.runningTimer == 0 || this.prevDate == null) {
            return;
        }
        let timeDifference = Date.now() - this.prevDate;
        this.prevDate = Date.now();
        if(this.runningTimer == 1) {
            this.botTime -= timeDifference;
        } else if(this.runningTimer == -1) {
            this.topTime -= timeDifference;
        }

        if(this.botTime <=0) {
            this.updateScoreBoard(1);
            this.stopTimer();
        } else if (this.topTime <=0 ) {
            this.updateScoreBoard(-1);
            this.stopTimer();
        }

        this.drawTime();
        this.currentTimeout = setTimeout(() => timerArea.runTimer(), 800);   //this doesn't work with settimeout, so wrap the function
    },
    drawTime() {
        let tempTopot, tempTop;
        tempTopot = this.botTime; tempTop = this.topTime;
        let msBot = tempTopot%1000; let msTop = tempTop%1000; tempTopot = Math.floor(tempTopot/1000); tempTop = Math.floor(tempTop/1000); //miliseconds
        let sBot = tempTopot%60; let sTop = tempTop%60;       tempTopot = Math.floor(tempTopot/60); tempTop = Math.floor(tempTop/60);     //seconds
        let mTopot = tempTopot%60; let mTop = tempTop%60;       tempTopot = Math.floor(tempTopot/60); tempTop = Math.floor(tempTop/60);       //minutes

        if(sBot < 10) {sBot = '0' + sBot};    if(sTop < 10) {sTop = '0' + sTop};
        if(mTopot < 10) {mTopot = '0' + mTopot};    if(mTop < 10) {mTop = '0' + mTop};

        this.botTimerRef.innerText = `${mTopot} : ${sBot}`;
        this.topTimerRef.innerText = `${mTop} : ${sTop}`;
        if(tempTopot < 0) {this.botTimerRef.innerText = '00: 00'};
        if(tempTop < 0) {this.topTimerRef.innerText = '00: 00'};

        //remove all effects
        this.botTimerRef.classList.remove('green');
        this.topTimerRef.classList.remove('green');

        //add effects if it's your turn
        if(this.runningTimer == 1) {
            this.botTimerRef.classList.add('green');
        } else if(this.runningTimer == -1) {
            this.topTimerRef.classList.add('green');
        }

    },
    startbotTimer() {
        clearTimeout(this.currentTimeout);
        this.runTimer(); //get all the remaining time out first
        this.topTime += this.bonusTime;
        this.prevDate = Date.now();
        this.runningTimer = 1;
        this.runTimer();
    },
    starttopTimer() {
        clearTimeout(this.currentTimeout);
        this.runTimer(); //get all the remaining time out first
        this.botTime += this.bonusTime;
        this.prevDate = Date.now();
        this.runningTimer = -1;
        this.runTimer();
    },
    stopTimer() {
        clearTimeout(this.currentTimeout);
        this.runningTimer = 0;
    },
    updateScoreBoard(winner) {
        if(winner == 1) {
            alert(`${this.playerTopName} wins!`);
            this.topScore += 1;
        } else {
            alert(`${this.playerBotName} wins!`);
            this.botScore += 1;
        }
        this.drawScoreBoard();
    },
    drawScoreBoard() {
        this.scoreDisplay.innerText = `${this.playerTopName}: ${this.topScore} vs ${this.playerBotName}: ${this.botScore} `;
    },
    updateTimerAfterAMoveIsMade(piece) {
        //check for checkmate, and stop the timer if true
        blackKingExists = false; whiteKingExists = false;
        for(let i=0; i<board.length; i++) {
            for(let j=0; j<board.length; j++) {
                if(board[i][j] === KING) {whiteKingExists = true};
                if(board[i][j] === -KING) {blackKingExists = true};
            }
        }
        if(!blackKingExists) {
            this.stopTimer();
            //reverse winner if board is flipped
            if(this.colorsSwapped) {
                this.updateScoreBoard(1);
            } else {
                this.updateScoreBoard(-1);
            }
            return;
        } else if(!whiteKingExists) {
            //reverse winner if board is flipped
            if(this.colorsSwapped) {
                this.updateScoreBoard(-1);
            } else {
                this.updateScoreBoard(1);
            }
            this.stopTimer();
            return;
        }

        //run the opponent's timer, do the reverse if the board is flipped
        const sideThatJustMoved = this.colorsSwapped ? -Math.sign(piece) : Math.sign(piece);
        if(sideThatJustMoved < 0) {
            this.startbotTimer();
        } else {
            this.starttopTimer();
        }
    }
}


//PUBLIC STATIC VOID MAIN
addSquareEventListeners();
addUndoRedoEventListners();
addShowThreatsEventListners();
timerArea.setUpEventListeners();
timerArea.drawTime();
drawPieces();
drawSquares();


//Clases
function factoryMove(startSquare, endSquare) {
    return {
        startSquare,
        endSquare
    };
}

function moveEquals(move1, move2) {
    return move1.startSquare===move2.startSquare && move1.endSquare===move2.endSquare;
}

function cloneBoard(board) {
    const returnArr = [
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
        [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY]
    ];
    for(let i=0; i<board.length; i++) {
        for(let j=0; j<board.length; j++) {
            returnArr[i][j] = board[i][j];
        }
    }
    return returnArr;
}

//FUNCTIONS
//make the move
function makeMove(move) {
    const rowStart = Math.floor(move.startSquare/board.length);
    const colStart = move.startSquare%board.length;
    const rowEnd = Math.floor(move.endSquare/board.length);
    const colEnd = move.endSquare%board.length;

    const originalPiece = board[rowStart][colStart]; //save this value for the timer method

    if(board[rowStart][colStart]===-KING && rowStart===0 && colStart===4 && rowEnd===0 && colEnd===2) {
        board[0][0] = EMPTY;
        board[0][2] = -KING;
        board[0][3] = -ROOK;
        board[0][4] = EMPTY;
    } else if(board[rowStart][colStart]===-KING && rowStart===0 && colStart===4 && rowEnd===0 && colEnd===6) {
        board[0][7] = EMPTY;
        board[0][6] = -KING;
        board[0][5] = -ROOK;
        board[0][4] = EMPTY;
    } else if(board[rowStart][colStart] === NECROMANCER  && board[rowEnd][colEnd] !== EMPTY) {
        //ensure there's only one knight by deleting all present knights
        for(let i=0; i<board.length; i++) {
            for(let j=0; j<board.length; j++) {
                if(board[i][j] === KNIGHT) {
                    board[i][j] = EMPTY;
                }
            }
        }

        board[rowStart][colStart] = KNIGHT;
        board[rowEnd][colEnd] = NECROMANCER;

    } else if(board[rowStart][colStart] === TIMEWARPER) {
        board[rowEnd][colEnd] = TIMEWARPER;

        //update hologram position
        board[rowStart][colStart] = EMPTY;
        hologramTracker.updateHologramPosition2(rowStart, colStart);

    } else if((!timerArea.colorsSwapped && rowStart===6 && board[rowStart][colStart] === -PAWN) || (timerArea.colorsSwapped && rowStart===1 && board[rowStart][colStart]===-PAWN)) {
        board[rowEnd][colEnd] = -QUEEN;
        board[rowStart][colStart] = EMPTY;

    } else if(board[rowEnd][colEnd] === NECROMANCER) {

        //ensure there's only one knight by deleting all present knights
        for(let i=0; i<board.length; i++) {
            for(let j=0; j<board.length; j++) {
                if(board[i][j] === KNIGHT) {
                    board[i][j] = EMPTY;
                }
            }
        }

        board[rowEnd][colEnd] = KNIGHT;
        board[rowStart][colStart] = EMPTY;

    } else {
        board[rowEnd][colEnd] = board[rowStart][colStart];
        board[rowStart][colStart] = EMPTY;
    }

    //make the hologram disapear if the time traveler is gone
    if(!hologramTracker.timewarperExists()) {
        hologramTracker.isAlive = false;
    }

    //start the opponent's timer
    timerArea.updateTimerAfterAMoveIsMade(originalPiece);
}

function generatePieceMoves(pieceSquare) {
    const returnArr = [];
    let row = Math.floor(pieceSquare/board.length);
    let col = pieceSquare%board.length;
    let piece = board[row][col];

    let myColor = Math.sign(piece);
    let enemyColor = -myColor;

    //EMPTY squares; need this becuase if myColor is 0 then eveyrthing is true
    if(myColor === 0) {
        return returnArr;
    }

    //KING moves
    if(piece===KING*myColor) {
        for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++) {
                //discard 0,0
                if(i===0 && j===0) {
                    continue;
                }
                if(inBoardRange(row+i, col+j) && (board[row+i][col+j]===EMPTY || Math.sign(board[row+i][col+j])===enemyColor)) {
                    returnArr.push(factoryMove(pieceSquare,board.length*(row+i)+(col+j)));
                }
            }
        }

        //Castling
        if(row===0 && col===4) {
            if(board[0][5]===EMPTY && board[0][6]===EMPTY && board[0][7]===-ROOK) {
                returnArr.push(factoryMove(pieceSquare,6));
            } else if(board[0][3]===EMPTY && board[0][2]===EMPTY && board[0][1]===EMPTY && board[0][0]===-ROOK) {
                returnArr.push(factoryMove(pieceSquare,2));
            }
        }
    }

    //QUEEN moves
    if(piece===QUEEN*myColor) {
        for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++) {
                //discard 0,0
                if(i===0 && j===0) {
                    continue;
                }
                
                let dist = 1;
                while(true) {
                    if(inBoardRange(row+i*dist, col+j*dist) && (board[row+i*dist][col+j*dist]===EMPTY || Math.sign(board[row+i*dist][col+j*dist])===enemyColor)) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i*dist)+(col+j*dist)));
                    }
                    //break conditions
                    if(!inBoardRange(row+i*dist, col+j*dist) || (board[row+i*dist][col+j*dist]!==EMPTY)) {
                        break;
                    }
                    dist++;
                }
            }
        }
    }

    //ROOK moves
    if(piece===ROOK*myColor) {
        for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++) {
                //discard diagonals and 0,0
                if ((i===0 && j!==0) || (i!==0 && j===0)) {
                    let dist = 1;
                    while(true) {
                        if(inBoardRange(row+i*dist, col+j*dist) && (board[row+i*dist][col+j*dist]===EMPTY || Math.sign(board[row+i*dist][col+j*dist])===enemyColor)) {
                            returnArr.push(factoryMove(pieceSquare,board.length*(row+i*dist)+(col+j*dist)));
                        }
                        //break conditions
                        if(!inBoardRange(row+i*dist, col+j*dist) || board[row+i*dist][col+j*dist]!==EMPTY) {
                            break;
                        }
                        dist++;
                    }
                }
            }
        }
    }

    //BISHOP moves
    if(piece===BISHOP*myColor) {
        for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++) {
                //discard non diagonals and 0,0
                if (i===0 || j===0) {
                    continue;
                }
                
                let dist = 1;
                while(true) {
                    if(inBoardRange(row+i*dist, col+j*dist) && (board[row+i*dist][col+j*dist]===EMPTY || Math.sign(board[row+i*dist][col+j*dist])===enemyColor)) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i*dist)+(col+j*dist)));
                    }
                    //break conditions
                    if(!inBoardRange(row+i*dist, col+j*dist) || board[row+i*dist][col+j*dist]!==EMPTY) {
                        break;
                    }
                    dist++;
                }
            }
        }
    }

    //KNIGHT moves
    if(piece==KNIGHT || piece===-KNIGHT) {
        for(let i=-2; i<=2; i++) {
            for(let j=-2; j<=2; j++) {
                //discard all non knight moves
                if(i===2*j || j===2*i || i===-2*j || j===-2*i) {
                    if(inBoardRange(row+i, col+j) && ((board[row+i][col+j]===EMPTY || Math.sign(board[row+i][col+j])===enemyColor))) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i)+(col+j)));
                    }
                }
            }
        }
    }

    //PAWN moves
    if(piece===PAWN*myColor) {
        //reverse the direction the pawns move if the board is swapped
        if(!timerArea.colorsSwapped) {
            //moving
            if(inBoardRange(row+1, col) && (board[row+1][col]===EMPTY)) {
                returnArr.push(factoryMove(pieceSquare,board.length*(row+1)+(col)));
                if(row===1 && inBoardRange(row+2, col) && board[row+2][col]===EMPTY) {
                    returnArr.push(factoryMove(pieceSquare,board.length*(row+2)+(col)));   
                }
            }
            //capturing
            if(inBoardRange(row+1, col+1) && Math.sign(board[row+1][col+1])===enemyColor) {
                returnArr.push(factoryMove(pieceSquare,board.length*(row+1)+(col+1)));
            }
            if(inBoardRange(row+1, col-1) && Math.sign(board[row+1][col-1])===enemyColor) {
                returnArr.push(factoryMove(pieceSquare,board.length*(row+1)+(col-1)));
            }
        } else {
            //moving
            if(inBoardRange(row-1, col) && (board[row-1][col]===EMPTY)) {
                returnArr.push(factoryMove(pieceSquare,board.length*(row-1)+(col)));
                if(row===6 && inBoardRange(row-2, col) && board[row-2][col]===EMPTY) {
                    returnArr.push(factoryMove(pieceSquare,board.length*(row-2)+(col)));   
                }
            }
            //capturing
            if(inBoardRange(row-1, col+1) && Math.sign(board[row-1][col+1])===enemyColor) {
                returnArr.push(factoryMove(pieceSquare,board.length*(row-1)+(col+1)));
            }
            if(inBoardRange(row-1, col-1) && Math.sign(board[row-1][col-1])===enemyColor) {
                returnArr.push(factoryMove(pieceSquare,board.length*(row-1)+(col-1)));
            }
        }

    }

    //MAHARAJAH MOVES
    if(piece === MAHARAJAH*myColor) {
        //Queen moves
        for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++) {
                //discard 0,0
                if(i===0 && j===0) {
                    continue;
                }
                
                let dist = 1;
                while(true) {
                    if(inBoardRange(row+i*dist, col+j*dist) && (board[row+i*dist][col+j*dist]===EMPTY || Math.sign(board[row+i*dist][col+j*dist])===enemyColor)) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i*dist)+(col+j*dist)));
                    }
                    //break conditions; white pieces go through each other - not anymore
                    if(!inBoardRange(row+i*dist, col+j*dist) || board[row+i*dist][col+j*dist]!==EMPTY) {
                        break;
                    }
                    dist++;
                    //Ranger nert
                    if(dist > 2) {
                        break;
                    }
                }
            }
        }
        //KnightMoves
        for(let i=-2; i<=2; i++) {
            for(let j=-2; j<=2; j++) {
                //discard all non knight moves
                if(i===2*j || j===2*i || i===-2*j || j===-2*i) {
                    if(inBoardRange(row+i, col+j) && (board[row+i][col+j]===EMPTY || Math.sign(board[row+i][col+j])===enemyColor)) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i)+(col+j)));
                    }
                }
            }
        }
    }

    //NECROMANCER Moves
    if(piece === NECROMANCER) {
        //King moves
        for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++) {
                //discard 0,0
                if(i===0 && j===0) {
                    continue;
                }
                if(inBoardRange(row+i, col+j) && (board[row+i][col+j]===EMPTY || Math.sign(board[row+i][col+j])===enemyColor)) {
                    //can't take the enemy king though
                    if(!(board[row+i][col+j]===enemyColor*KING)) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i)+(col+j)));
                    }
                }
            }
        }
    }

    //DO THIS LAST SINCE IT MAY ULTER ROW AND COL, but honestly shouldn't matter since only 1 loop should run
    if(piece === TIMEWARPER*myColor) {
        //Queen moves
        for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++) {
                //discard 0,0
                if(i===0 && j===0) {
                    continue;
                }
                
                let dist = 1;
                while(true) {
                    if(inBoardRange(row+i*dist, col+j*dist) && (board[row+i*dist][col+j*dist]===EMPTY || Math.sign(board[row+i*dist][col+j*dist])===enemyColor)) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i*dist)+(col+j*dist)));
                    }
                    //break conditions; white pieces go through each other - not anymore
                    if(!inBoardRange(row+i*dist, col+j*dist) || (board[row+i*dist][col+j*dist]!==EMPTY)) {
                        break;
                    }
                    dist++;
                }
            }
        }

        //if the hologram is alive, edit row and col
        //Find Hologram and edit row and col
        if(hologramTracker.isAlive) {
            row = hologramTracker.row;
            col = hologramTracker.col;
        }
        
        //skip the next part if hologram is on a white piece
        if(inBoardRange(row, col) && Math.sign(board[row][col])===myColor) {
            return returnArr;
        } else if(inBoardRange(row, col) && Math.sign(board[row][col])===enemyColor) { //push the hologram's position then terminate if occupied by black piece
            returnArr.push(factoryMove(pieceSquare, row*board.length + col));
            return returnArr;
        } else if(inBoardRange(row, col) && board[row][col]===EMPTY) { //if the hologram is on an empty square than push that position and continue to Queen moves
            returnArr.push(factoryMove(pieceSquare, row*board.length + col));
        }

        //Queen moves - with position as hologram; pieceSquare is the queen's position, not the hologram's
        for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++) {
                //discard 0,0
                if(i===0 && j===0) {
                    continue;
                }
                
                let dist = 1;
                while(true) {
                    if(inBoardRange(row+i*dist, col+j*dist) && (board[row+i*dist][col+j*dist]===EMPTY || Math.sign(board[row+i*dist][col+j*dist])===enemyColor)) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i*dist)+(col+j*dist)));
                    }
                    //break conditions; white pieces go through each other - not anymore
                    if(!inBoardRange(row+i*dist, col+j*dist) || (board[row+i*dist][col+j*dist]!==EMPTY)) {
                        break;
                    }
                    dist++;
                }
            }
        }
    }

    return returnArr;
}

function inBoardRange(row, col) {
    return row >= 0 && row <board.length && col >=0 && col<board.length;
}



//SET UP Functions
function addSquareEventListeners() {
    squareArr.forEach((x,i) => {
        x.addEventListener('click', () => squareClicked(i));
    })
}

function squareClicked(index) {
    if(magicSquare === index) {
        magicSquare = -1;
    } else if(magicSquare === -1) {
        magicSquare = index;
        playerMoves = generatePieceMoves(magicSquare);
    } else if(playerMoves.some(move => moveEquals(move, factoryMove(magicSquare, index)))) {
        makeMove(factoryMove(magicSquare, index));
        history.pushPosition(board);
        magicSquare = -1;
    }
    drawPieces();
    drawSquares();
}


function drawPieces() {
    for(let i=0; i<board.length; i++) {
        for(let j=0; j<board.length; j++) {
            //clear the square
            if(squareArr[i*board.length+j].hasChildNodes()) {
                squareArr[i*board.length+j].firstChild.remove();
            }
            //do it again in case there's a hologram
            if(squareArr[i*board.length+j].hasChildNodes()) {
                squareArr[i*board.length+j].firstChild.remove();
            }

            //draw the hologram if it's still alive
            if(hologramTracker.isAlive && i==hologramTracker.row && j==hologramTracker.col) {
                const y = document.createElement('img'); //new image
                y.classList.add('smallImage'); //add the class to make it small
                y.src = 'imgTimeWarperWhite.svg';

                squareArr[i*board.length+j].appendChild(y);
            }

            //draw the other pieces if the square is not empty
            if(board[i][j] === EMPTY) {
                continue;
            }
            const x = document.createElement('img');
            let piece = board[i][j];

            if(piece === MAHARAJAH) {
                x.src = 'imgMaharajahWhite.svg';
            } else if(piece === TIMEWARPER) {
                x.src = 'imgTimeWarperWhite.svg';
            } else if(piece === NECROMANCER) {
                x.src = 'imgNecromancerWhite.svg';
            } else if(piece === -KING) {
                x.src = 'imgKingBlack.svg';
            } else if(piece === -QUEEN) {
                x.src = 'imgQueenBlack.svg';
            } else if(piece === -ROOK) {
                x.src = 'imgRookBlack.svg';
            } else if(piece === -BISHOP) {
                x.src = 'imgBishopBlack.svg';
            } else if(piece === -KNIGHT) {
                x.src = 'imgKnightBlack.svg';
            } else if(piece === -PAWN) {
                x.src = 'imgPawnBlack.svg';
            } else if(piece === KNIGHT) {
                x.src = 'imgHorseWhite.svg';
            } else if(piece === KING) {
                x.src = 'imgKingWhite.svg';
            }

            squareArr[i*board.length+j].appendChild(x);
        }
    }
}

function drawSquares() {
    //remove all visual classes and then add them
    squareArr.forEach((x,i) => {
        x.classList.remove('selected', 'magicSquare', 'whiteThreat', 'blackThreat');
        if(i === magicSquare) {
            x.classList.add('magicSquare');
        } else if(playerMoves.some(move => moveEquals(move, factoryMove(magicSquare,i)))) {
            x.classList.add('selected');
        }
    });


    //add the threat indicators
    if(showThreatsButton.getAttribute('data-showThreats') === 'true') {
        for(let i=0; i<board.length; i++) {
            for(let j=0; j<board.length; j++) {
                //THIS DOESN"T WORK YET SINCE THE PIECE MOVES DON"T CONSIDER YOUR OWN PIECES
                const moveArr = generatePieceMoves(i*board.length+j);
                moveArr.forEach(move => {
                    let piece = board[i][j];
                    if(piece > HOLOGRAM/2) {
                        piece /= 2;
                    }
                    if(piece > 0) {
                        squareArr[move.endSquare].classList.add('whiteThreat')
                    } else {
                        squareArr[move.endSquare].classList.add('blackThreat')
                    }
                });
            }
        }
    }
}

function addUndoRedoEventListners() {
    const undoButton = document.querySelector('[data-undoButton]');
    const redoButton = document.querySelector('[data-redoButton]');
    undoButton.addEventListener('click', () => {
        history.undo();
        magicSquare = -1;
        drawSquares();
        drawPieces();
    });
    redoButton.addEventListener('click', () => {
        history.redo();
        magicSquare = -1;
        drawSquares();
        drawPieces();
    });
}

function addShowThreatsEventListners() {
    showThreatsButton.addEventListener('click', () => {
        if(showThreatsButton.getAttribute('data-showThreats') == 'false') {
            showThreatsButton.setAttribute('data-showThreats', 'true');
            showThreatsButton.innerText = 'Hide Threats'
        } else {
            showThreatsButton.setAttribute('data-showThreats', 'false');
            showThreatsButton.innerText = 'Show Threats'
        }
        drawSquares();
    })
}