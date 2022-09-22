'use strict'

var gBoard
// var gCounter = 0


const BOMB = '💣'
const EMPTY = ''
const FLAG = '🚩'
const NORMAL = '🙂'
const LOSE = '😭'
const WIN = '😎'


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
}


var gLevel = {
    SIZE: 4,
    MINES: 2
}


var gMinesIdxArr = []
var gIsHint = false
// var gMarkedIdxArr = []
// var gMinesCount = 0


function init() {
    gBoard = createBoard(gLevel.SIZE)

    renderBoard()

    renderEmoji(NORMAL)
}




function createBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 1,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    //put mines in random location on the board and saves them in array

    console.log(board)
    return board
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


function cellClicked(ev, elCell, rowIdx, colIdx) {
    if (isBoardEmpty()) {

        gGame.isOn = true
        randomizeMines()
        showTimer()
    }

    if (gBoard[rowIdx][colIdx].isMarked) return

    if (gBoard[rowIdx][colIdx].isShown) return

    if (!gGame.isOn) return

    if (gBoard[rowIdx][colIdx].isMine) {
        gGame.lives--

        if (gGame.lives === 0) {
            //update the dom for every bomb
            for (var i = 0; i < gLevel.MINES; i++) {
                var elBomb = document.querySelector(`.cell-${gMinesIdxArr[i].i}-${gMinesIdxArr[i].j}`)
                elBomb.innerText = BOMB
            }
            var elEndModal = document.querySelector('.end-modal')
            elEndModal.classList.remove('hide')
            var elLives = document.querySelector('h2')
            elLives.innerText = 'No more lives...'
            elEndModal.innerText = 'YOU LOST!'
            renderEmoji(LOSE)
            gameOver()
            return
        }

        var elLives = document.querySelector('h2')
        elLives.innerText = 'Lives: ' + gGame.lives
        renderEmoji(LOSE)
        setTimeout(() => renderEmoji(NORMAL), 300)

        return
    }

    gBoard[rowIdx][colIdx].isShown = true
    gBoard[rowIdx][colIdx].minesAroundCount = setMinesNegsCount(gBoard, rowIdx, colIdx)
    gGame.shownCount++

    if (gBoard[rowIdx][colIdx].minesAroundCount !== 0) {
        elCell.innerText = gBoard[rowIdx][colIdx].minesAroundCount
        elCell.classList.add('shown')
    }
    else {
        showNumNegs(rowIdx, colIdx)

        elCell.innerText = ''
        elCell.classList.add('shown')
    }



    if (isBoardFull() && gGame.markedCount === gLevel.MINES) {
        var elEndModal = document.querySelector('.end-modal')
        elEndModal.classList.remove('hide')
        elEndModal.innerText = 'YOU WON!'
        renderEmoji(WIN)
        gameOver()
    }
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

    if (isBoardFull()) {
        if (gGame.markedCount === gLevel.MINES) {
            var elEndModal = document.querySelector('.end-modal')
            elEndModal.classList.remove('hide')
            elEndModal.innerText = 'YOU WON!'
            renderEmoji(WIN)
            gameOver()
        }
        return
    }
}


function gameOver() {
    gGame.isOn = false
    clearInterval(gtimerInterval)
}

function isBoardFull() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
                return false
            }
        }
    }
    return true
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



function showNumNegs(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === rowIdx && j === colIdx) continue

            var currCell = gBoard[i][j]
            if (!currCell.isMine) {

                currCell.isShown = true

                var elNum = document.querySelector(`.cell-${i}-${j}`)
                elNum.classList.add('shown')

                if (setMinesNegsCount(gBoard, i, j) === 0)
                    elNum.innerText = EMPTY
                else {
                    elNum.innerText = setMinesNegsCount(gBoard, i, j)
                }
            }
        }
    }
}

//difficulty option
function playGame(elBtn) {
    switch (elBtn.innerText) {
        case 'Easy':
            gLevel.SIZE = 4
            gLevel.MINES = 2
            break

        case 'Hard':
            gLevel.SIZE = 8
            gLevel.MINES = 12
            break

        case 'Extreme':
            gLevel.SIZE = 12
            gLevel.MINES = 32
            break
    }
    resetGameVars()
    init()
}


function resetGameVars() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
    }

    // gLevel
    gMinesIdxArr = []

    //update dom
    var elLives = document.querySelector('h2')
    elLives.innerText = 'Lives: ' + gGame.lives
    var elEndModal = document.querySelector('.end-modal')
    elEndModal.classList.add('hide')
    var Eltimer = document.querySelector('.timer')
    Eltimer.classList.add('hide')
}


function Restart(elBtn) {
    resetGameVars()
    init()
}

function randomizeMines() {
    var minesNum = 0
    var randIdx
    while (minesNum < gLevel.MINES) {
        randIdx = { i: getRandomIntInclusive(0, gLevel.SIZE - 1), j: getRandomIntInclusive(0, gLevel.SIZE - 1) }
        if (gBoard[randIdx.i][randIdx.j].isMine)
            continue
        else {
            gBoard[randIdx.i][randIdx.j].isMine = true
            gMinesIdxArr.push({ i: randIdx.i, j: randIdx.j })
            minesNum++
        }
    }
}


// function isInMat(rowIdx, colIdx) {
//     if (rowIdx < gLevel.SIZE && colIdx < gLevel.SIZE)
//         return true
//     return false
// }



// function expend(rowIdx, colIdx) {

//     var currCell = gBoard[rowIdx][colIdx]
//     currCell.minesAroundCount = setMinesNegsCount(gBoard, rowIdx, colIdx)

//     if (currCell.isMine) return

//     else if (currCell.isShown) return

//     else if (currCell.minesAroundCount === 0) {
//         currCell.isShown = true

//         var elNum = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
//         elNum.classList.add('shown')
//         elNum.innerText = EMPTY

//         for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//             for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//                 if (!isInMat(i, j)) continue
//                 if (gBoard[i][j].isShown || gBoard[i][j].isMine) continue

//                 else
//                     expend(i, j)
//             }
//         }
//     }

//     else {
//         currCell.isShown = true

//         var elNum = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
//         elNum.classList.add('shown')
//         elNum.innerText = currCell.minesAroundCount
//         return
//     }

// }


// function setCellMinesNegsCount() {
//     for (var i = 0; i < gBoard.length; i++) {
//         for (var j = 0; j < gBoard.length; j++) {
//             gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, i, j)
//         }
//     }
// }