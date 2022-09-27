'use strict'

var gBoard
// var gCounter = 0


const BOMB = '💣'
const EMPTY = ''
const FLAG = '🚩'
const NORMAL = '🙂'
const LOSE = '😭'
const WIN = '😎'
const HINT_UNUSED = '💡'
const HINT_USED = '👍'
const LIVES = '❤'
var gBestScores = [{ level: 'easy', score: Infinity },
{ level: 'hard', score: Infinity },
{ level: 'extreme', score: Infinity }]


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

var gIsSevenBoom = false
var gIsDarkMode = false
var gManualyCreateMode = { isModeOn: false, numOfMines: 0 }
var gIsFirstClick = false
var gGameHistoryArr = []
var gMinesIdxArr = []
var gHint = { isHint: false, nummOfHint: 3 }
var gMegaHint = { isMegaHint: false, numOfClicks: 2, rowIdxTL: 0, colIdxTL: 0 }
// var gMarkedIdxArr = []
// var gMinesCount = 0

var gBoardsArr = []
var gStepsCounter = 0

function init() {
    gBoard = createBoard(gLevel.SIZE)

    renderBoard()

    renderEmoji(NORMAL)

    // b = JSON.parse(JSON.stringify(a))

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

    // console.log(board)
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


function cellClicked(rowIdx, colIdx) {
    if (gManualyCreateMode.isModeOn) {
        var elModal = document.querySelector('.modal')
        if (gManualyCreateMode.numOfMines < gLevel.MINES) {
            (gLevel.MINES - gManualyCreateMode.numOfMines - 1) ? elModal.innerText = `enter ${gLevel.MINES - gManualyCreateMode.numOfMines - 1} mines` : elModal.innerText = 'start playing'

            if (gBoard[rowIdx][colIdx].isMine) return
            gBoard[rowIdx][colIdx].isMine = true
            gMinesIdxArr.push({ i: rowIdx, j: colIdx })
            gManualyCreateMode.numOfMines++

            var elCell = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
            elCell.innerText = BOMB
            return
        }

        for (var i = 0; i < gMinesIdxArr.length; i++) {
            // console.log(`.cell-${gMinesIdxArr[i].i}-${gMinesIdxArr[i].j}`)
            var elCell = document.querySelector(`.cell-${gMinesIdxArr[i].i}-${gMinesIdxArr[i].j}`)
            elCell.innerText = EMPTY
        }
        elModal.classList.add('hide')

        showTimer()
        gGame.isOn = true
        gIsFirstClick = true
        gManualyCreateMode.isModeOn = false
    }
    else if (gIsSevenBoom && !gGame.isOn) {
        showTimer()
        gGame.isOn = true
        gIsFirstClick = true
    }
    else if (!gIsFirstClick) {
        showTimer()
        randomizeMines()
        gGame.isOn = true
        gIsFirstClick = true
        gBoardsArr.push(JSON.parse(JSON.stringify(gBoard)))
        // console.log(gBoardsArr[0])
        // var elTimer = document.querySelector('.timer')
        // console.log(elTimer)
    }


    if (gHint.isHint) {
        showNegs(rowIdx, colIdx)
        setTimeout(() => hideNegs(rowIdx, colIdx), 1000)
        gHint.isHint = false
        return
    }

    if (gMegaHint.isMegaHint && gMegaHint.numOfClicks === 2) {
        gMegaHint.rowIdxTL = rowIdx
        gMegaHint.colIdxTL = colIdx
        gMegaHint.numOfClicks--
        return
    }


    if (gMegaHint.numOfClicks === 1) {
        showMegaHint(gMegaHint.rowIdxTL, gMegaHint.colIdxTL, rowIdx, colIdx)
        return
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
            var elLives = document.querySelector('.lives')
            elLives.innerText = 'No more lives...'
            elEndModal.innerText = 'YOU LOST!'
            renderEmoji(LOSE)
            gameOver()
            return
        }

        var elLives = document.querySelector('.lives')
        elLives.innerText = ''
        for (var i = 0; i < gGame.lives; i++) {
            elLives.innerText += ' ' + LIVES
        }
        // elLives.innerText = 'Lives: ' + gGame.lives
        renderEmoji(LOSE)
        setTimeout(() => renderEmoji(NORMAL), 300)

        return
    }

    expend(rowIdx, colIdx)
    gBoardsArr.push(JSON.parse(JSON.stringify(gBoard)))
    gStepsCounter++
    // console.log(gBoardsArr[gStepsCounter])

    if (isBoardFull() && gGame.markedCount === gLevel.MINES) {
        var elEndModal = document.querySelector('.end-modal')
        elEndModal.classList.remove('hide')
        elEndModal.innerText = 'YOU WON!'
        var elModal = document.querySelector('.modal')
        elModal.classList.add('hide')
        renderEmoji(WIN)
        updateScores()
        gameOver()
    }
}



function markCell(ev, elCell, rowIdx, colIdx) {
    ev.preventDefault()

    if (gManualyCreateMode.isModeOn) return

    if (gBoard[rowIdx][colIdx].isShown) return

    // if (!gGame.isOn) return

    //toggle flag
    gBoard[rowIdx][colIdx].isMarked = !gBoard[rowIdx][colIdx].isMarked
    gBoardsArr.push(JSON.parse(JSON.stringify(gBoard)))
    gStepsCounter++
    console.log(gBoardsArr[gStepsCounter])

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
            var elModal = document.querySelector('.modal')
            elModal.classList.add('hide')
            renderEmoji(WIN)
            updateScores()
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
        }
    }
    return true
}



function showNegs(rowIdx, colIdx) {
    if (gBoard[rowIdx][colIdx].isShown) return

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue

            var currCell = gBoard[i][j]
            if (currCell.isShown) continue


            var elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.classList.add('shown')

            if (currCell.isMine) elCell.innerText = BOMB

            else if (setMinesNegsCount(gBoard, i, j) === 0)
                elCell.innerText = EMPTY
            else {
                elCell.innerText = setMinesNegsCount(gBoard, i, j)
            }
        }
    }
}



function hideNegs(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue

            var currCell = gBoard[i][j]
            if (currCell.isShown) continue

            var elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.classList.remove('shown')


            elCell.innerText = EMPTY

            if (currCell.isMarked) elCell.innerText = FLAG
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
    // clearInterval(gtimerInterval)
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

    clearInterval(gtimerInterval)
    // console.log('hi')
    // gLevel
    gIsSevenBoom = false

    gManualyCreateMode = { isModeOn: false, numOfMines: 0 }

    gIsFirstClick = false

    gMinesIdxArr = []

    gHint = { isHint: false, nummOfHint: 3 }

    gMegaHint = { isMegaHint: false, numOfClicks: 2, rowIdxTL: 0, colIdxTL: 0 }

    gBoardsArr = []
    gStepsCounter = 0

    //update dom
    var elLives = document.querySelector('.lives')
    elLives.innerText = LIVES + ' ' + LIVES + ' ' + LIVES
    // elLives.innerText = 'Lives: ' + gGame.lives
    var elEndModal = document.querySelector('.end-modal')
    elEndModal.classList.add('hide')
    var elTimer = document.querySelector('.timer span')
    elTimer.classList.add('hide')

    for (var i = 1; i < 4; i++) {
        var elHint = document.querySelector('.hint' + i)
        // console.log(elHint)
        elHint.classList.remove('hide')
        elHint.innerText = HINT_UNUSED
    }

    var elModal = document.querySelector('.modal')
    elModal.innerText = ''
    elModal.classList.remove('hide')
}


function Restart(elBtn) {
    switch (gLevel.SIZE) {
        case 4:
            gLevel.MINES = 2
            break

        case 8:
            gLevel.MINES = 12
            break

        case 12:
            gLevel.MINES = 32
            break
    }
    resetGameVars()
    // clearInterval(gtimerInterval)
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


function getCurrLevel() {
    if (gLevel.SIZE === 4)
        return 'easy'
    if (gLevel.SIZE === 8)
        return 'hard'
    if (gLevel.SIZE === 12)
        return 'extreme'
}


function updateScores() {
    var score
    var timer = document.querySelector('.timer span')
    score = +timer.innerText.slice(7)
    // console.log(getCurrLevel())
    for (var i = 0; i < gBestScores.length; i++) {
        if (getCurrLevel() !== gBestScores[i].level)
            continue
        if (score < gBestScores[i].score) {
            gBestScores[i].score = score
            var elScore = document.querySelector(`.${gBestScores[i].level}`)
            elScore.innerText = gBestScores[i].score
        }
    }

}


function isInMat(rowIdx, colIdx) {
    if (rowIdx >= gLevel.SIZE || rowIdx < 0 ||
        colIdx >= gLevel.SIZE || colIdx < 0)
        return false
    return true
}



function expend(rowIdx, colIdx) {
    var currCell = gBoard[rowIdx][colIdx]
    currCell.minesAroundCount = setMinesNegsCount(gBoard, rowIdx, colIdx)

    if (currCell.isMine) return

    else if (currCell.isShown)
        return

    else if (currCell.minesAroundCount === 0) {
        currCell.isShown = true

        var elNum = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
        elNum.classList.add('shown')
        elNum.innerText = EMPTY

        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (!isInMat(i, j)) continue
                if (gBoard[i][j].isShown || gBoard[i][j].isMine) continue

                else
                    expend(i, j)
            }
        }
    }

    else {
        currCell.isShown = true

        var elNum = document.querySelector(`.cell-${rowIdx}-${colIdx}`)
        elNum.classList.add('shown')
        elNum.innerText = currCell.minesAroundCount
        return
    }

}


function hint(elBtn) {
    if (gHint.isHint) return
    if (gHint.nummOfHint > 0) {
        gHint.nummOfHint--
        gHint.isHint = true
        elBtn.innerText = HINT_USED
        setTimeout(() => elBtn.classList.add('hide'), 300)
    }
    // console.log('no more hints..')
}

function safeClick() {
    var randSafeCell = getRandomSafeCell()
    var elCell = document.querySelector(`.cell-${randSafeCell.i}-${randSafeCell.j}`)
    elCell.classList.add('safe')
    setTimeout(() => elCell.classList.remove('safe'), 2000)
}

function getRandomSafeCell() {
    var safeCellArr = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine || gBoard[i][j].isShown) continue
            safeCellArr.push({ i, j })
        }
    }
    var randCell = getRandomIntInclusive(0, safeCellArr.length - 1)

    return safeCellArr[randCell]
}


function megaHint(rowIdxTL, colIdxTL, rowIdxBR, colIdxBR) {
    if (gMegaHint.numOfClicks === 2)
        gMegaHint.isMegaHint = true
}


function showMegaHint(rowIdxTL, colIdxTL, rowIdxBR, colIdxBR) {
    if (rowIdxTL >= rowIdxBR || colIdxTL >= colIdxBR) {
        gMegaHint.isMegaHint = false
        gMegaHint.numOfClicks = 2
    }
    else {
        for (var i = rowIdxTL; i <= rowIdxBR; i++) {
            for (var j = colIdxTL; j <= colIdxBR; j++) {
                var currCell = gBoard[i][j]
                if (currCell.isShown) continue
                currCell.minesAroundCount = setMinesNegsCount(gBoard, i, j)
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                elCell.classList.add('shown')
                if (currCell.isMine) {
                    elCell.innerText = BOMB
                }
                else if (currCell.minesAroundCount !== 0) {
                    elCell.innerText = currCell.minesAroundCount
                }
                else {
                    elCell.innerText = EMPTY
                }
            }
        }
        setTimeout(() => hideMegaHint(rowIdxTL, colIdxTL, rowIdxBR, colIdxBR), 2000)
        gMegaHint.isMegaHint = false
        gMegaHint.numOfClicks = 0
    }
}

function hideMegaHint(rowIdxTL, colIdxTL, rowIdxBR, colIdxBR) {
    for (var i = rowIdxTL; i <= rowIdxBR; i++) {
        for (var j = colIdxTL; j <= colIdxBR; j++) {
            var currCell = gBoard[i][j]
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            if (currCell.isShown) continue

            elCell.classList.remove('shown')
            if (currCell.isMarked) {
                elCell.innerText = FLAG
                continue
            }
            elCell.innerText = EMPTY
        }
    }
}


function switchMode(elBtn) {
    var elBody = document.querySelector('body')
    if (!gIsDarkMode) {
        elBody.style.backgroundImage = 'url("../pics/darkmode.jpg")'
        elBtn.innerText = 'Normal Mode'
        // elText = document.querySelectorAll('.show-txt')
    }
    else {
        elBody.style.backgroundImage = 'url("../pics/background.jpg")'
        elBtn.innerText = 'Dark Mode'
    }
    gIsDarkMode = !gIsDarkMode

    var elTexts = document.querySelectorAll('.end-modal, .modal , .scores , .timer')
    for (var i = 0; i < elTexts.length; i++) {
        // console.log(elTexts[i])
        elTexts[i].classList.toggle('show-txt')
    }
}



function manualyCreate() {
    if (gGame.isOn) return
    gManualyCreateMode.isModeOn = true
    var elModal = document.querySelector('.modal')
    elModal.innerText = `enter ${gLevel.MINES} mines`
}


function sevenBoom() {
    if (!gGame.isOn) {
        var currCellIdx = 0
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                if (currCellIdx === 0) {
                    currCellIdx++
                    continue
                }
                if (currCellIdx.toString().indexOf('7') > -1
                    || currCellIdx % 7 === 0) {
                    gBoard[i][j].isMine = true
                    gMinesIdxArr.push({ i, j })
                    // console.log('i '+ i +' j ' + j)
                }
                currCellIdx++
            }
        }
        gLevel.MINES = gMinesIdxArr.length
        gIsSevenBoom = true
    }
}


function exterminator() {
    if (!gGame.isOn) return
    if (gMinesIdxArr.length === 0) {
        var elModal = document.querySelector('.modal')
        elModal.classList.remove('hide')
        elModal.innerText = 'No mines on the board'
    }

    if (gMinesIdxArr.length < 3) {
        for (var i = 0; i < gMinesIdxArr.length; i++) {
            gBoard[gMinesIdxArr[i].i][gMinesIdxArr[i].j].isMine = false
        }
        gMinesIdxArr = []
        gLevel.MINES = 0
    }

    else {
        for (var i = 0; i < 3; i++) {
            var randMine = getRandomIntInclusive(0, gMinesIdxArr.length - 1)
            gBoard[gMinesIdxArr[randMine].i][gMinesIdxArr[randMine].j].isMine = false
            gMinesIdxArr.splice(randMine, 1)
            gLevel.MINES--
        }
    }

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine) continue

            currCell.minesAroundCount = setMinesNegsCount(gBoard, i, j)

            if (currCell.isShown) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                currCell.minesAroundCount ? elCell.innerText = `${currCell.minesAroundCount}` : elCell.innerText = EMPTY
            }
        }
    }

}



function undo() {
    if (gStepsCounter === 0) return

    // if(gStepsCounter === 1){
    //     gBoard = gBoardsArr[gStepsCounter - 1]
    //     gStepsCounter--

    //     renderBoard()
    //     return
    // }
    
    gBoard = gBoardsArr[gStepsCounter - 1]
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            var elCell = document.querySelector(`.cell-${i}-${j}`)

            if (!currCell.isMarked && gBoardsArr[gStepsCounter][i][j].isMarked) {
                gGame.markedCount--
                elCell.innerText = EMPTY
                console.log('hi')
            }

            else if (!currCell.isShown && gBoardsArr[gStepsCounter][i][j].isShown) {
                elCell.classList.remove('shown')
                elCell.innerText = EMPTY
                console.log('hello')
            }
            
        }
    }
    gStepsCounter--
    gBoardsArr.pop()
    console.log(gBoardsArr[gStepsCounter])

}