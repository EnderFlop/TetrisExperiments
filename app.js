document.addEventListener('DOMContentLoaded', () => { //Fires when html is fully loaded
  const grid = document.querySelector('.grid')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  const ScoreDisplay = document.querySelector('#score')
  const startBtn = document.querySelector('#start-button')
  const heightText = document.querySelector('#height')
  const bumpinessText = document.querySelector('#bumpiness')
  const holesText = document.querySelector('#holes')
  const height = 20
  const width = 10
  let nextRandom = 0
  let gameStarted = false
  let timerId
  let score = 0

  //The Tetrominoes
  const lLeftTetromino = [
    //4 rotations, each in an array.
    //Start at Initial Spawn, then rotate right.
    [0, 1, 2, width + 2],
    [1, width + 1, width * 2, width * 2 + 1],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
    [1, 2, width + 1, width * 2 + 1]
  ]
  const lRightTetromino = [
    [0, 1, 2, width],
    [0, 1, width + 1, width * 2 + 1],
    [width + 2, width * 2, width * 2 + 1, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2 + 2]
  ]
  const zLeftTetromino = [
    [0, 1, width + 1, width + 2],
    [2, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width * 2 + 1, width * 2 + 2],
    [1, width, width + 1, width * 2]
  ]
  const zRightTetromino = [
    [1, 2, width, width + 1],
    [1, width + 1, width + 2, width * 2 + 2],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1]
  ]
  const sTetromino = [
    [0, 1, 2, 3],
    [2, width + 2, width * 2 + 2, width * 3 + 2],
    [0, 1, 2, 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1]
  ]
  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1]
  ]
  const tTetromino = [
    [0, 1, 2, width + 1],
    [1, width, width + 1, width * 2 + 1],
    [width + 1, width * 2, width * 2 + 1, width * 2 + 2],
    [1, width + 1, width + 2, width * 2 + 1]
  ]

  const theTetrominos = [lLeftTetromino, lRightTetromino, zLeftTetromino, zRightTetromino, sTetromino, oTetromino, tTetromino]
  const colors = ['orange', 'blue', 'red', 'green', 'cyan', 'yellow', 'purple']

  let currentPosition = 4
  let currentRotation = 0

  let random = Math.floor(Math.random() * theTetrominos.length)
  let current = theTetrominos[random][currentRotation]

  //draw the Tetromino
  function draw() {
    //for every coordinate in a rotation, add the 'tetromino' class to the div at that position.
    current.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino')
      squares[currentPosition + index].style.backgroundColor = colors[random]
    })
  }

  function undraw(){
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino')
      squares[currentPosition + index].style.backgroundColor = ''
    })
  }

  //stop the tetromino
  function freeze() {
    //if the row below the tetromino contains a 'taken' div, change the divs where the tetromino lies to also be taken.
    if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => squares[currentPosition + index].classList.add('taken'))
      //start a new tetromino falling
      random = nextRandom
      nextRandom = Math.floor(Math.random() * theTetrominos.length)
      current = theTetrominos[random][currentRotation]
      currentPosition = 4
      draw()
      displayShape()
      addScore()
      gameOver()
      statsHelper()
    }
  }

  //assign functions to keyCodes
  function control(e) {
    if (e.keyCode === 37) moveLeft()
    else if (e.keyCode === 38) rotate()
    else if (e.keyCode === 39) moveRight()
    else if (e.keyCode === 40) moveDown()
    else if (e.keyCode === 32) forceDown()
  }

  //move the tetromino down
  function moveDown() {
    undraw()
    currentPosition += width
    draw()
    freeze()
  }

  function forceDown() {
    while (!current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      undraw()
      currentPosition += width
      draw()
    }
    freeze()
  }

  function rotate(){
    undraw()
    currentRotation = (currentRotation + 1) % 4
    current = theTetrominos[random][currentRotation]
    draw()
  }

  //move the tetrominos left, unless it is at the edge or there is a blockage.
  function moveLeft(){
    undraw()
    //if any of the indexes is touching the left edge (10 % width=(10) === 0)
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
    //if okay, move it left
    if (!isAtLeftEdge) currentPosition -= 1
    //if colliding with any taken divs, move it back.
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) currentPosition += 1
    draw()
  }

  //move tetrominos right, same logic as moveLeft
  function moveRight(){
    undraw()
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
    if (!isAtRightEdge) currentPosition += 1
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) currentPosition -= 1
    draw()
  }

  //show up-next tetromino in mini-grid display
  const displaySquares = document.querySelectorAll('.mini-grid div')
  const miniGridWidth = 4
  const displayIndex = 0
  
  //all tetromino's first rotations
  const upNextTetrominoes = [
    [0, 1, 2, miniGridWidth + 2], //lLeftTetromino
    [0, 1, 2, miniGridWidth], //lRigthTetromino
    [0, 1, miniGridWidth + 1, miniGridWidth + 2], //zLeftTetromino
    [1, 2, miniGridWidth, miniGridWidth + 1], //zRightTetromino
    [0, 1, 2, 3], //sTetromino
    [0, 1, miniGridWidth, miniGridWidth + 1], //oTetromino
    [0, 1, 2, miniGridWidth + 1], //tTetromino
  ]

  //display the shape in the mini-grid
  function displayShape() {
    //cleanse the whole minigrid
    displaySquares.forEach(squares => {
      squares.classList.remove('tetromino')
      squares.style.backgroundColor = ''
    })
    upNextTetrominoes[nextRandom].forEach(index => {
      displaySquares[displayIndex + index].classList.add('tetromino')
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
    })
  }

  //start and pause functionality
  startBtn.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId)
      document.removeEventListener('keydown', control)
      timerId = null
    } else {
      draw()
      timerId = setInterval(moveDown, 500)
      document.addEventListener('keydown', control)
      if (!gameStarted) { //if the game is just now starting, create a random shape. prevents exploit from pausing and unpausing to change shape.
        nextRandom = Math.floor(Math.random()*theTetrominos.length)
        displayShape()
        gameStarted = true
      }
    }
    startBtn.blur() //removes focus from button to prevent pausing by spacebar (force drop)
  })

  //add score and remove completed rows
  function addScore() {
    for (let i=0; i < 199; i += width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
      if (row.every(index => squares[index].classList.contains('taken'))) {
        score += 10
        ScoreDisplay.innerHTML = score
        row.forEach(index => {
          squares[index].classList.remove('tetromino')
          squares[index].classList.remove('taken')
          squares[index].style.backgroundColor = ''
        })
        const squaresRemoved = squares.splice(i, width)
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))
      }
    }
  }

  //game over
  function gameOver(){
    //if our block is inside any other blocks, the game ends. This happens when a block spawns into another one.
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))){
      ScoreDisplay.innerHTML = 'end'
      clearInterval(timerId)
      document.removeEventListener('keydown', control)
    }
  }


  //AI HELPER FUNCTIONS
  function getHeight(){
    for (let i = 0; i < 209; i++){
      if (squares[i].classList.contains('taken')) {
        heightText.innerHTML = (height - Math.floor(i / width)) //current level. height - (index found / width)
        break 
      }
    }
  }

  function getBumpiness(){
    //find height of first column,  add the abs() difference of height to the next column, continue
    totalBumpiness = 0
    let newColumnHeight = 0
    let pastColumnHeight = -1
    for (let column = 0; column < 9; column++){
      for (let i = column; i < 209; i += width) { //i goes to 209 (height * width + width) in order to account for the '0' height floor
        if (squares[i].classList.contains('taken')) {
          newColumnHeight = (height - Math.floor(i / width)) //current height formula
          if (pastColumnHeight != -1){ //let it run once before doing math
            totalBumpiness += Math.abs(newColumnHeight - pastColumnHeight)
          }
          pastColumnHeight = newColumnHeight
          break //exit this column
        }
      }
    }
    bumpinessText.innerHTML = totalBumpiness
  }

  //CURRENTLY ONLY WORKS FOR HOLES 1 BRICK LARGE.
  function getHoles(){
    let numHoles = 0
    for (let i = 0; i <= 199; i++){
      adjacent = [i - width, i - 1, i + 1, i + width] //all 4 surroundind indicies
      if (i % width === 0){ //if the index is on the left most wall, ignore any values that would be to the left
        adjacent = [i - width, i + 1, i + width] //3 remaining indicies
      }
      else if (i % width === width - 1) { //same for if the index is on the right most wall
        adjacent = [i - width, i - 1, i + width]
      }
      else if (i < width) { //same for if index is on top row (0 to width)
        adjacent = [i - 1, i + 1, i + width]
      }
      //no need for bottom row logic, the for loop only iterates through the visible rows and there is a 'floor' of taken divs at the bottom.
      //we do need to remove negative indicies (possible at 0 and 1, when the top row logic triggers and overwrites the left row logic)
      adjacent = adjacent.filter(index => index >= 0)
      //if all indicies are filled and the target is NOT filled, add one.
      if (adjacent.every(index => squares[index].classList.contains('taken')) && !squares[i].classList.contains('taken')) {
        numHoles++
      }
    }
    holesText.innerHTML = numHoles
  }

  function statsHelper(){
    getHeight()
    getBumpiness()
    getHoles()
  }

})

//TODO
//Adaptive Height and Width
//Pretty up grid
//refactor code

//FOR AI - 3 FACTORS (inspired by https://www.youtube.com/watch?v=pXTfgw9A08w&ab_channel=Loonride)
//number of holes
//bumpiness
//total height of structure