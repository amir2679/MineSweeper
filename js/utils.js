'use strict'

var gtimerInterval

function renderBoard() {
    var strHTML = ''
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr class="board-row" >`
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]

            var className = (cell.isMine) ? 'mine' : ''

            var title =`Cell: ${i}, ${j}`
            strHTML += `<td class="cell cell-${i}-${j}" title="${title}" 
                            onclick="cellClicked(${i}, ${j})" oncontextmenu="markCell(event, this, ${i}, ${j})">
                         </td>`
        }
        strHTML += `</tr>`
    }
    //  console.log(strHTML)

    const elCell = document.querySelector('.board-cells')
    elCell.innerHTML = strHTML
}


function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}


function renderEmoji(emoji){
    var elEmoji = document.querySelector('.emoji')
    elEmoji.innerText = emoji
}



function findRandEmptyCell(){
    var emptyCells = []
    
    for(var i = 0 ; i < gBoard.length ; i++){
        for(var j = 0 ; j < gBoard[i].length ; j++){
            if(gBoard[i][j] === EMPTY)
                emptyCells.push({i,j})
        }
    }
    var randIdx = getRandomIntInclusive(0 , emptyCells.length -1)
    return emptyCells[randIdx]
}

function showTimer() {
    var timer = document.querySelector('.timer span')
    var start = Date.now()
    timer.classList.remove('hide')

      gtimerInterval = setInterval(function () {
      var currTs = Date.now()
  
      var secs = parseInt((currTs - start) / 1000)
      var ms = (currTs - start) - secs * 1000
      ms = '000' + ms
      ms = ms.substring(ms.length - 3, ms.length)
  
      timer.innerText = `Timer: ${secs}.${ms}`
    }, 41)
  }
  