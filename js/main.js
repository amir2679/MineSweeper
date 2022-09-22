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
    for (var i = 0; i < gLevel.MINES; i++) {
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

    if (gBoard[rowIdx][colIdx].isMine) {
        gGame.lives--

        var elLives = document.querySelector('h2')
        elLives.innerText = 'Lives: ' + gGame.lives

        if (gGame.lives === 0) {
            //update the dom for every bomb
            for (var i = 0; i < gLevel.MINES; i++) {
                var elBomb = document.querySelector(`.cell-${gMinesIdxArr[i].i}-${gMinesIdxArr[i].j}`)
                elBomb.innerText = BOMB
            }
            var elEndModal = document.querySelector('.end-modal')
            elEndModal.classList.remove('hide')
            elEndModal.innerText = 'YOU LOST!'
            // setTimeout(() => renderEmoji(LOSE) , 1000)
            renderEmoji(LOSE)
            gameOver()
            return
        }
        else {
            console.log(gGame.lives)
            return
        }
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


// function checkMines() {
//     for (var i = 0; i < gLevel.MINES; i++) {
//         if (!gBoard[gMinesIdxArr[i].i][gMinesIdxArr[i].j].isMarked)
//             return false
//     }
//     return true
// }



function Expend(rowIdx, colIdx) {
    if (rowIdx < 0 || rowIdx >= gBoard.length ||
        (colIdx < 0 || colIdx >= gBoard.length))
        return

    var currCell = gBoard[rowIdx][colIdx]

    if (currCell.minesAroundCount !== 0) return

    if (currCell.isMine) return

    else {
        currCell.minesAroundCount = setMinesNegsCount(gBoard, rowIdx, colIdx)
        currCell.isShown = true

        var elNum = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
        elNum.classList.add('shown')
        elNum.innerText = currCell.minesAroundCount
    }

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) return

            Expend(i, j)
        }
    }
}

//if the idx has negs who is not bomb show it
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
                    elNum.innerText = ''
                else {

                    elNum.innerText = setMinesNegsCount(gBoard, i, j)
                }
            }
        }
    }
}


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
}


function Restart(elBtn) {
    resetGameVars()
    init()
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
