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
            strHTML += `<td class="cell ${className} cell-${i}-${j}" title="${title}" 
                            onclick="cellClicked(event, this, ${i}, ${j})" >
                         </td>`
        }
        strHTML += `</tr>`
    }
     console.log(strHTML)

    const elCell = document.querySelector('.board-cells')
    elCell.innerHTML = strHTML
}


function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    if(value = 'mine')
        elCell.classList.add('.mine')
    else
        elCell.in
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

function renderCell(location ,value){
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function showTimer() {
    var timer = document.querySelector('.timer span')
    var start = Date.now()
  
      gtimerInterval = setInterval(function () {
      var currTs = Date.now()
  
      var secs = parseInt((currTs - start) / 1000)
      var ms = (currTs - start) - secs * 1000
      ms = '000' + ms
      ms = ms.substring(ms.length - 3, ms.length)
  
      timer.innerText = `\n ${secs}:${ms}`
    }, 31)
  }
  

// function getRandIdx(){
//     var rowIdx = getRandomIntInclusive(0 , gLevel.SIZE)
//     var colIdx = getRandomIntInclusive(0 , gLevel.SIZE)
//     return {i:rowIdx , j:colIdx}
// }
