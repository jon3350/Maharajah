const squareArr = document.querySelectorAll('.square');
const moveNumber = document.querySelector('[data-moveNumber]');

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
const HOLOGRAM = 20; //this value is added; any value > 20 means hologram is present

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
    [EMPTY, TIMEWARPER+HOLOGRAM, EMPTY, EMPTY, MAHARAJAH, EMPTY, NECROMANCER, EMPTY]
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
    }, 
    undo: function() {
        if(this.moveNum > 0) {
            this.moveNum--;
            this.overWriteGlobalBoard(this.arr[this.moveNum]);
            this.drawMoveNumber();
        }
    },
    redo: function() {
        if(this.moveNum+1 < this.arr.length) {
            this.moveNum++;
            this.overWriteGlobalBoard(this.arr[this.moveNum]);
            this.drawMoveNumber();
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


//PUBLIC STATIC VOID MAIN
addSquareEventListeners();
addUndoRedoEventListners();
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
//return false if its a checkmate move; true otherwise
function makeMove(move) {
    if(board[Math.floor(move.endSquare/board.length)][Math.floor(move.endSquare%board.length)]===KING || board[Math.floor(move.endSquare/board.length)][Math.floor(move.endSquare%board.length)]==-KING) {
        return false;
    }
    const rowStart = Math.floor(move.startSquare/board.length);
    const colStart = move.startSquare%board.length;
    const rowEnd = Math.floor(move.endSquare/board.length);
    const colEnd = move.endSquare%board.length;
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
    } else if((board[rowStart][colStart] === NECROMANCER || board[rowStart][colStart] === NECROMANCER + HOLOGRAM) &&  (board[rowEnd][colEnd] !== EMPTY  && board[rowEnd][colEnd] !== HOLOGRAM)) {
        //Starting square is unaltered
        if(board[rowEnd][colEnd] > HOLOGRAM/2) {
            board[rowEnd][colEnd] = KNIGHT + HOLOGRAM;
        } else {
            board[rowEnd][colEnd] = KNIGHT;
        }
    } else if(board[rowStart][colStart] === HOLOGRAM) {
        board[rowEnd][colEnd] = HOLOGRAM;
        board[rowStart][colStart] = EMPTY;
    } else if(rowStart===6 && (board[rowStart][colStart] === -PAWN || board[rowStart][colStart] === -PAWN + HOLOGRAM)) {
        board[rowEnd][colEnd] += -QUEEN; //incase there was a hologram
        board[rowStart][colStart] = EMPTY;
        if(board[rowStart][colStart] === -PAWN + HOLOGRAM) {
            board[rowStart][colStart] = HOLOGRAM;
        }
    } else if(board[rowEnd][colEnd] === NECROMANCER || board[rowEnd][colEnd] ===NECROMANCER + HOLOGRAM) {
        if(board[rowEnd][colEnd] > HOLOGRAM/2) {
            board[rowEnd][colEnd] = KNIGHT + HOLOGRAM;
        } else {
            board[rowEnd][colEnd] = KNIGHT;
        }
        if(board[rowStart][colStart] > HOLOGRAM/2) {
            board[rowStart][colStart] = HOLOGRAM;
        } else {
            board[rowStart][colStart] = EMPTY;
        }

    } else if(board[rowStart][colStart] > HOLOGRAM/2) {
        board[rowEnd][colEnd] = board[rowStart][colStart] - HOLOGRAM;
        board[rowStart][colStart] = HOLOGRAM;
    } else if(board[rowEnd][colEnd] >= HOLOGRAM/2) {
        board[rowEnd][colEnd] = board[rowStart][colStart] + HOLOGRAM;
        board[rowStart][colStart] = EMPTY;
    } else {
        board[rowEnd][colEnd] = board[rowStart][colStart];
        board[rowStart][colStart] = EMPTY;
    }
    return true;
}

function unMakeMove(move) {
    return makeMove(factoryMove(move.endSquare, move.startSquare));
}

//returns whether or not a square is Empty or hologram
function isEmpty(row, col) {
    if(board[row][col] === EMPTY || board[row][col] === HOLOGRAM) {
        return true;
    }
    return false;
}

function generatePieceMoves(pieceSquare) {
    const returnArr = [];
    let row = Math.floor(pieceSquare/board.length);
    let col = pieceSquare%board.length;
    let piece = board[row][col];
    //if it's exactly 20 it is the hologram
    if(piece === HOLOGRAM) {
        //do nothing
    } else if(piece > HOLOGRAM/2) {
        piece -= HOLOGRAM;
    }
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
                if(inBoardRange(row+i, col+j) && (board[row+i][col+j]===EMPTY || board[row+i][col+j]===HOLOGRAM || Math.sign(board[row+i][col+j])===enemyColor)) {
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
                    if(inBoardRange(row+i*dist, col+j*dist) && (board[row+i*dist][col+j*dist]===EMPTY || board[row+i*dist][col+j*dist]===HOLOGRAM || Math.sign(board[row+i*dist][col+j*dist])===enemyColor)) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i*dist)+(col+j*dist)));
                    }
                    //break conditions
                    if(!inBoardRange(row+i*dist, col+j*dist) || (board[row+i*dist][col+j*dist]!==EMPTY && board[row+i*dist][col+j*dist]!==HOLOGRAM)) {
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
                        if(inBoardRange(row+i*dist, col+j*dist) && (board[row+i*dist][col+j*dist]===EMPTY || board[row+i*dist][col+j*dist]===HOLOGRAM || Math.sign(board[row+i*dist][col+j*dist])===enemyColor)) {
                            returnArr.push(factoryMove(pieceSquare,board.length*(row+i*dist)+(col+j*dist)));
                        }
                        //break conditions
                        if(!inBoardRange(row+i*dist, col+j*dist) || (board[row+i*dist][col+j*dist]!==EMPTY && board[row+i*dist][col+j*dist]!==HOLOGRAM)) {
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
                    if(inBoardRange(row+i*dist, col+j*dist) && (board[row+i*dist][col+j*dist]===EMPTY || board[row+i*dist][col+j*dist]===HOLOGRAM || Math.sign(board[row+i*dist][col+j*dist])===enemyColor)) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i*dist)+(col+j*dist)));
                    }
                    //break conditions
                    if(!inBoardRange(row+i*dist, col+j*dist) || (board[row+i*dist][col+j*dist]!==EMPTY && board[row+i*dist][col+j*dist]!==HOLOGRAM)) {
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
                    if(inBoardRange(row+i, col+j) && (board[row+i][col+j]===EMPTY || board[row+i][col+j]===HOLOGRAM || Math.sign(board[row+i][col+j])===enemyColor)) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i)+(col+j)));
                    }
                }
            }
        }
    }

    //PAWN moves
    if(piece===PAWN*myColor) {
        //moving
        if(inBoardRange(row+1, col) && (board[row+1][col]===EMPTY || board[row+1][col]===HOLOGRAM)) {
            returnArr.push(factoryMove(pieceSquare,board.length*(row+1)+(col)));
            if(row===1 && inBoardRange(row+2, col) && (board[row+2][col]===EMPTY || board[row+2][col]===HOLOGRAM)) {
                returnArr.push(factoryMove(pieceSquare,board.length*(row+2)+(col)));   
            }
        }
        //capturing
        if(inBoardRange(row+1, col+1) && (Math.sign(board[row+1][col+1])===enemyColor && board[row+1][col+1]!==HOLOGRAM)) {
            returnArr.push(factoryMove(pieceSquare,board.length*(row+1)+(col+1)));
        }
        if(inBoardRange(row+1, col-1) && (Math.sign(board[row+1][col-1])===enemyColor) && board[row+1][col-1]!==HOLOGRAM) {
            returnArr.push(factoryMove(pieceSquare,board.length*(row+1)+(col-1)));
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
                    if(inBoardRange(row+i*dist, col+j*dist) && (board[row+i*dist][col+j*dist]===EMPTY || Math.sign(board[row+i*dist][col+j*dist])===enemyColor || (board[row+i*dist][col+j*dist]>HOLOGRAM/2 && board[row+i*dist][col+j*dist]<=HOLOGRAM))) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i*dist)+(col+j*dist)));
                    }
                    //break conditions; white pieces go through each other
                    if(!inBoardRange(row+i*dist, col+j*dist) || Math.sign(board[row+i*dist][col+j*dist])===enemyColor) {
                        break;
                    }
                    dist++;
                }
            }
        }
        //KnightMoves
        for(let i=-2; i<=2; i++) {
            for(let j=-2; j<=2; j++) {
                //discard all non knight moves
                if(i===2*j || j===2*i || i===-2*j || j===-2*i) {
                    if(inBoardRange(row+i, col+j) && (board[row+i][col+j]===EMPTY || Math.sign(board[row+i][col+j])===enemyColor || (board[row+i][col+j]>HOLOGRAM/2 && board[row+i][col+j]<=HOLOGRAM))) {
                        returnArr.push(factoryMove(pieceSquare,board.length*(row+i)+(col+j)));
                    }
                }
            }
        }
    }

    //HOLOGRAM MOVES
    if(piece === HOLOGRAM) {
        //find the timewarper in the previous position
        const prevBoard = history.arr[history.moveNum-1];
        for(let i=0; i<board.length; i++) {
            for(let j=0; j<board.length;j++) {
                //don't push it if it's the same position or at the timewarper's position
                if(prevBoard[i][j] === TIMEWARPER  &&  i*board.length+j !== pieceSquare && board[i][j] !== TIMEWARPER) {
                    returnArr.push(factoryMove(pieceSquare,board.length*(i)+(j)));
                }
            }
        }
    }

    //NECROMANCER MOVes
    if(piece === NECROMANCER) {
        //King moves
        for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++) {
                //discard 0,0
                if(i===0 && j===0) {
                    continue;
                }
                if(inBoardRange(row+i, col+j) && (board[row+i][col+j]===EMPTY || Math.sign(board[row+i][col+j])===enemyColor || (board[row+i][col+j]>HOLOGRAM/2 && board[row+i][col+j]<=HOLOGRAM) )) {
                    returnArr.push(factoryMove(pieceSquare,board.length*(row+i)+(col+j)));
                }
            }
        }

        //Knight moves but CANT CAPTURE
        // for(let i=-2; i<=2; i++) {
        //     for(let j=-2; j<=2; j++) {
        //         //discard all non knight moves
        //         if(i===2*j || j===2*i || i===-2*j || j===-2*i) {
        //             if(inBoardRange(row+i, col+j) && (board[row+i][col+j]===EMPTY || (board[row+i][col+j]>HOLOGRAM/2 && board[row+i][col+j]<=HOLOGRAM)) ) {
        //                 returnArr.push(factoryMove(pieceSquare,board.length*(row+i)+(col+j)));
        //             }
        //         }
        //     }
        // }
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
                    //break conditions; white pieces go through each other
                    if(!inBoardRange(row+i*dist, col+j*dist) || Math.sign(board[row+i*dist][col+j*dist])===enemyColor) {
                        break;
                    }
                    dist++;
                }
            }
        }

        //Find Hologram
        for(let i=0; i<board.length; i++) {
            for(let j=0; j<board.length; j++) {
                if(board[i][j] >= HOLOGRAM/2) {
                    row = i;
                    col = j;
                }
            }
        }
        //skip the next part if hologram is same position as queen
        if(pieceSquare === row*board.length + col) {
            return returnArr;
        }

        //Queen moves - with position as hologram, push the original hologram position as well; pieceSquare is the queen's position, not the hologram's
        if(inBoardRange(row, col) && board[row][col]!==myColor) {
            returnArr.push(factoryMove(pieceSquare, row*board.length + col))
        }
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
                    //break conditions; white pieces go through each other
                    if(!inBoardRange(row+i*dist, col+j*dist) || Math.sign(board[row+i*dist][col+j*dist])===enemyColor) {
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
        //alert checkmate
        const endSquare = factoryMove(magicSquare, index).endSquare;
        if(board[Math.floor(endSquare/board.length)][endSquare%board.length] === KING || board[Math.floor(endSquare/board.length)][endSquare%board.length] === -KING) {
            alert('checkMate!');
        }

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

            //draw the piece
            if(board[i][j] === EMPTY) {
                continue;
            }
            const x = document.createElement('img');
            let piece = board[i][j];

            //draw the hologram and subtract out its value
            if(piece >= HOLOGRAM/2) {
                const y = document.createElement('img'); //new image
                y.classList.add('smallImage'); //add the class to make it small
                y.src = 'imgTimeWarperWhite.svg';
                squareArr[i*board.length+j].appendChild(y);
                piece -= HOLOGRAM;
            }

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
            }
            squareArr[i*board.length+j].appendChild(x);
        }
    }
}

function drawSquares() {
    //remove all visual classes and then add them
    squareArr.forEach((x,i) => {
        x.classList.remove('selected', 'magicSquare');
        if(i === magicSquare) {
            x.classList.add('magicSquare');
        } else if(playerMoves.some(move => moveEquals(move, factoryMove(magicSquare,i)))) {
            x.classList.add('selected');
        }
    })
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
