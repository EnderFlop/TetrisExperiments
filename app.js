document.addEventListener('DOMContentLoaded', () => { //Fires when html is fully loaded
  const grid = document.querySelector('.grid')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  const startBtn = document.querySelector('#start-button')
  const height = 20
  const width = 10
  let gameStarted = false
  let AIInterval

  const HEIGHTWEIGHT = 8
  const BUMPWEIGHT = 1
  const HOLESWEIGHT = 5
  const LINESCLEAREDWEIGHT = 8

  let board = new Board(width, height, grid, squares, AIPlayer = false)

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
    if (AIInterval) {
      clearInterval(AIInterval)
      document.removeEventListener('keydown', control)
      AIInterval = null
    } else {
      board.draw()
      //board.startTimer()
      AIInterval = setInterval(makeAImove, 20)
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
    let boardStats = {}

    for (let rotation = 0; rotation < 4; rotation++) {
      for (let positionIterator = -5; positionIterator <= 5; positionIterator++){
        //copy grid
        let cloneSquares = []
        board.grid.forEach(element => {
          cloneSquares.push(element.cloneNode())
        });
        //set up board
        const cloneBoard = new Board (width, height, board.parentGrid, cloneSquares, AIPlayer = true)
        cloneBoard.nextRandom = board.nextRandom //needed for useless read in freeze()
        cloneBoard.current = board.theTetrominos[board.random][rotation]

        //ITERATE FROM -5 TO 5. IF NEGATIVE, MOVE LEFT THAT MANY TIMES. IF POSITIVE, MOVE RIGHT THAT MANY TIMES.
        if (positionIterator < 0) { for (let i = 0; i < Math.abs(positionIterator); i++) { cloneBoard.moveLeft() }}
        if (positionIterator > 0) { for (let i = 0; i < positionIterator; i++) { cloneBoard.moveRight() }}
        cloneBoard.forceDown()

        //get stats, record. stats recalculated after forceDown() -> freeze()
        let linesCleared = board.currentHeight - cloneBoard.currentHeight
        if (linesCleared < 0) linesCleared = 0 //if height increases or stays the same, don't account for it. only reward removed lines, don't punish for increased.
        const boardFitness = HEIGHTWEIGHT * cloneBoard.currentHeight + BUMPWEIGHT * cloneBoard.currentBump + HOLESWEIGHT * cloneBoard.currentHoles - LINESCLEAREDWEIGHT * linesCleared
        boardStats[[rotation, positionIterator]] = boardFitness
      }
    }

    //minimum key:value search from https://stackoverflow.com/questions/55332453/get-key-with-minimum-value
    const [lowestItems] = Object.entries(boardStats).sort(([ ,v1], [ ,v2]) => v1 - v2);
    const key = lowestItems[0].split(",")
    const newRotation = parseInt(key[0])
    const moveCount = parseInt(key[1])
    console.log(lowestItems, newRotation, moveCount)
    
    while (board.currentRotation != newRotation) {board.rotate()}
    if (moveCount < 0) { for (let i = 0; i < Math.abs(moveCount); i++) { board.moveLeft() }}
    if (moveCount > 0) { for (let i = 0; i < moveCount; i++) { board.moveRight() }}
    board.forceDown()
    if (board.gameOver()) clearInterval(AIInterval)
  }
})

//TODO
//add next piece visualization? would heavily increase computational time but would heavily increase ai performance
//set up genetic algorithm to determine weights
//sliders on screen to allow player to determine weights?
//restart button or AI automatic restart
//option to swap between AI playing and human? probably useless.