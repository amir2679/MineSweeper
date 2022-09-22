'use strict'

var gBoard


const BOMB = '💣'
const EMPTY = ''
const FLAG = '🚩'


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


var gMinesIdxArr = []
var gMarkedIdxArr = []
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
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    for (var i = 0; i < gLevel.MINES ; i++) {
        var randIdx = { i: getRandomIntInclusive(0, board.length - 1), j: getRandomIntInclusive(0, board.length - 1) }
        board[randIdx.i][randIdx.j].isMine = true
        gMinesIdxArr.push({ i: randIdx.i, j: randIdx.j })
    }

    console.log(board)
    return board
}



// function createMines() {
//     for (var i = 0; i < gLevel.MINES; i++) {
//         var mineRandIdx = findRandEmptyCell()
//         gMines.push(mineRandIdx)
//     }
// }


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


function cellClicked(elCell, rowIdx, colIdx) {
    if (isBoardEmpty()) {
        if (gBoard[rowIdx][colIdx].isMine) return

        gGame.isOn = true
        showTimer()
    }

    if (gBoard[rowIdx][colIdx].isMarked) return

    if (gBoard[rowIdx][colIdx].isShown) return

    if (!gGame.isOn) return
i
    gBoard[rowIdx][colIdx].isShown = true
    gGame.shownCount++

    if (gBoard[rowIdx][colIdx].isMine) {
        //update the dom for every bomb
        for (var i = 0; i < gLevel.MINES; i++) {
            var elBomb = document.querySelector(`.cell-${gMinesIdxArr[i].i}-${gMinesIdxArr[i].j}`)
            elBomb.innerText = BOMB
        }
        gameOver()
        return
    }

    elCell.innerText = setMinesNegsCount(gBoard, rowIdx, colIdx)
    elCell.classList.add('shown')

    if (isBoardFull())
        gameOver()
}

function markCell(ev, elCell, rowIdx, colIdx) {
    ev.preventDefault()

    if (isBoardEmpty() && !gGame.isOn) {
        gGame.isOn = true
        showTimer()
    }

    if (gBoard[rowIdx][colIdx].isShown) return

    if (!gGame.isOn) return

    //toggle flag
    gBoard[rowIdx][colIdx].isMarked = !gBoard[rowIdx][colIdx].isMarked

    //update flag count
    if (gBoard[rowIdx][colIdx].isMarked) gGame.markedCount++
    else gGame.markedCount--

    //dom toggle flag update
    gBoard[rowIdx][colIdx].isMarked ? elCell.innerText = FLAG : elCell.innerText = EMPTY

    if (isBoardFull())
        gameOver()

}


function gameOver() {
    gGame.isOn = false
    clearInterval(gtimerInterval)

}

function isBoardFull() {
    if (gGame.markedCount + gGame.shownCount === gLevel.SIZE * gLevel.SIZE)
        return true
    return false


    // for (var i = 0; i < gLevel.SIZE; i++) {
    //     for (var j = 0; j < gLevel.SIZE; j++) {
    //         if (!gBoard[i][j].isShown || !gBoard[i][j].isMarked)
    //             return false
    //     }
    // }
    // return true
}


function isBoardEmpty() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return false
            //console.log(gBoard[i][j].isShown)
        }
    }
    return true
}


function checkMines(minesIdxArr){
    
}

// function clickEv(){
//     var elCell = document.querySelector('.cell')
// }

//compare if in the boardidx there is flag in the right spots
// function isWon() {
//     if (gGame.markedCount !== gLevel.MINES) return false
//     for (var i = 0; i < gMinesIdxArr.length; i++) {
//         if (!gBoard[gMinesIdxArr[i].i][gMinesIdxArr[i].j].isMarked)
//             return false
//     }
//     return true
// }