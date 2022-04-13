document.addEventListener('DOMContentLoaded', () => { //Fires when html is fully loaded
  const grid = document.querySelector('.grid')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  const startBtn = document.querySelector('#start-button')
  const height = 20
  const width = 10
  let gameStarted = false
  let timerId

  let board = new Board(width, height, grid, squares)

  //assign functions to keyCodes
  function control(e) {
    if (e.keyCode === 37) board.moveLeft()
    else if (e.keyCode === 38) board.rotate()
    else if (e.keyCode === 39) board.moveRight()
    else if (e.keyCode === 40) board.moveDown()
    else if (e.keyCode === 32) board.forceDown()
  }

  //start and pause functionality
  startBtn.addEventListener('click', () => {
    if (board.timerId) {
      clearInterval(board.timerId)
      document.removeEventListener('keydown', control)
      board.timerId = null
    } else {
      board.draw()
      board.startTimer()
      document.addEventListener('keydown', control)
      if (!gameStarted) { //if the game is just now starting, create a random shape. prevents exploit from pausing and unpausing to change shape.
        board.nextRandom = Math.floor(Math.random()*board.theTetrominos.length)
        board.displayShape()
        gameStarted = true
      }
    }
    startBtn.blur() //removes focus from button to prevent pausing by spacebar (force drop)
  })

  //AI analysis function.
  //should copy board and get statistics for every possible placement of piece (every rotation in every column)
  //save it all in dictionary and get the lowest value. move the piece there on the real board and force drop it.
  function makeAImove(){
    let cloneSquares = squares
    let cloneCurrent = current
    
  }

})

//TODO
//begin work on AI. I think the human parts are good enough, this really is just supposed to be a basis for the AI so things like sliding pieces doesn't matter.

//FOR AI - 3 FACTORS (inspired by https://www.youtube.com/watch?v=pXTfgw9A08w&ab_channel=Loonride)
//number of holes
//bumpiness
//total height of structure