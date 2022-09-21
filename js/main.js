'use strict'

var gBoard


const MINE = '💣'
const EMPTY = ''
const NUM = 0


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


var gLevel = {
    SIZE: 4,
    MINES: 2
}


// var gMines = []
// var gMinesCount = 0


function init() {

    gBoard = createBoard()

    renderBoard()
}




function createBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 4,
                isShown: false,
                isMine: false,
                isMarked: true
            }
        }
    }
    for (var i = 0; i < gLevel.MINES; i++) {
        var randIdx = { i: getRandomIntInclusive(0, board.length - 1), j: getRandomIntInclusive(0, board.length - 1) }
        board[randIdx.i][randIdx.j].isMine = true
    }

    console.log(board)
    return board
}



function createMines() {
    for (var i = 0; i < gLevel.MINES; i++) {
        var mineRandIdx = findRandEmptyCell()
        gMines.push(mineRandIdx)
    }
}


//determines the number in each cell
function setMinesNegsCount(board, rowIdx, colIdx) {
    if (board[rowIdx][colIdx].isMine) return ''
    var negsCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue

            var currCell = board[i][j]
            if (currCell.isMine) {
                negsCount++
            }
        }
    }
    return negsCount
}


function cellClicked(ev , elCell, rowIdx, colIdx) {

    //if (gBoard[rowIdx][colIdx].isMine) return
    switch(ev.button){
        case 0:
            console.log(ev)
            gBoard[rowIdx][colIdx].isShown = true
            elCell.innerText = setMinesNegsCount(gBoard, rowIdx, colIdx)
            break

        case 2:
            elCell.classList.add('.mine')
            break
        }


    if (!gGame.isOn) {
        gGame.isOn = true
        showTimer()
    }

    // console.log(ev)

    // gBoard[rowIdx][colIdx].isShown = true
    
    // if (gBoard[rowIdx][colIdx].isShown)
    //     elCell.innerText = setMinesNegsCount(gBoard, rowIdx, colIdx)

    // else
    //     elCell.innerText = ''


}

function gameOver(){
    gGame.isOn = false
    clearInterval(gtimerInterval)
    
}


// function clickEv(){
//     var elCell = document.querySelector('.cell')
// }

