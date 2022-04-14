class Board {
  constructor(width, height, parentGrid, squares, AIPlayer) {

    //BOARD CONSTANTS
    this.width = width
    this.height = height
    this.grid = squares
    this.parentGrid = parentGrid
    this.AIPlayer = AIPlayer
    this.nextRandom

    //HTML FIELDS
    this.heightText = document.querySelector('#height')
    this.bumpinessText = document.querySelector('#bumpiness')
    this.holesText = document.querySelector('#holes')
    this.scoreText = document.querySelector('#score')
    this.displaySquares = document.querySelectorAll('.mini-grid div')

    //STATISTICS
    this.currentHeight = 0
    this.currentBump = 0
    this.currentHoles = 0
    this.score = 0

    //The Tetrominoes
    this.lLeftTetromino = [
      //4 rotations, each in an array.
      //Start at Initial Spawn, then rotate right.
      [0, 1, 2, this.width + 2],
      [1, this.width + 1, this.width * 2, this.width * 2 + 1],
      [this.width, this.width * 2, this.width * 2 + 1, this.width * 2 + 2],
      [1, 2, this.width + 1, this.width * 2 + 1]
    ]
    this.lRightTetromino = [
      [0, 1, 2, this.width],
      [0, 1, this.width + 1, this.width * 2 + 1],
      [this.width + 2, this.width * 2, this.width * 2 + 1, this.width * 2 + 2],
      [1, this.width + 1, this.width * 2 + 1, this.width * 2 + 2]
    ]
    this.zLeftTetromino = [
      [0, 1, this.width + 1, this.width + 2],
      [2, this.width + 1, this.width + 2, this.width * 2 + 1],
      [this.width, this.width + 1, this.width * 2 + 1, this.width * 2 + 2],
      [1, this.width, this.width + 1, this.width * 2]
    ]
    this.zRightTetromino = [
      [1, 2, this.width, this.width + 1],
      [1, this.width + 1, this.width + 2, this.width * 2 + 2],
      [this.width + 1, this.width + 2, this.width * 2, this.width * 2 + 1],
      [0, this.width, this.width + 1, this.width * 2 + 1]
    ]
    this.sTetromino = [
      [0, 1, 2, 3],
      [2, this.width + 2, this.width * 2 + 2, this.width * 3 + 2],
      [0, 1, 2, 3],
      [1, this.width + 1, this.width * 2 + 1, this.width * 3 + 1]
    ]
    this.oTetromino = [
      [0, 1, this.width, this.width + 1],
      [0, 1, this.width, this.width + 1],
      [0, 1, this.width, this.width + 1],
      [0, 1, this.width, this.width + 1]
    ]
    this.tTetromino = [
      [0, 1, 2, this.width + 1],
      [1, this.width, this.width + 1, this.width * 2 + 1],
      [this.width + 1, this.width * 2, this.width * 2 + 1, this.width * 2 + 2],
      [1, this.width + 1, this.width + 2, this.width * 2 + 1]
    ]

    this.theTetrominos = [this.lLeftTetromino, this.lRightTetromino, this.zLeftTetromino, this.zRightTetromino, this.sTetromino, this.oTetromino, this.tTetromino]
    this.colors = ['orange', 'blue', 'red', 'green', 'cyan', 'yellow', 'purple']

    this.currentRotation = 0
    this.random = Math.floor(Math.random() * this.theTetrominos.length)
    this.current = this.theTetrominos[this.random][this.currentRotation]

    this.currentPosition = 4

    //show up-next tetromino in mini-grid display
    this.displayIndex = 0
    const miniGridWidth = 4
    //all tetromino's first rotations
    this.upNextTetrominoes = [
      [0, 1, 2, miniGridWidth + 2], //lLeftTetromino
      [0, 1, 2, miniGridWidth], //lRigthTetromino
      [0, 1, miniGridWidth + 1, miniGridWidth + 2], //zLeftTetromino
      [1, 2, miniGridWidth, miniGridWidth + 1], //zRightTetromino
      [0, 1, 2, 3], //sTetromino
      [0, 1, miniGridWidth, miniGridWidth + 1], //oTetromino
      [0, 1, 2, miniGridWidth + 1], //tTetromino
    ]
  }

  startTimer() {
    self = this
    this.timerId = setInterval(function() {self.moveDown()} , 500)
  }

  draw() {
    //for every coordinate in a rotation, add the 'tetromino' class to the div at that position.
    this.current.forEach(index => {
      this.grid[this.currentPosition + index].classList.add('tetromino')
      this.grid[this.currentPosition + index].style.backgroundColor = this.colors[this.random]
    })
  }

  undraw() {
    this.current.forEach(index => {
      this.grid[this.currentPosition + index].classList.remove('tetromino')
      this.grid[this.currentPosition + index].style.backgroundColor = ''
    })
  }

  //stop the tetromino
  freeze() {
    //if the row below the tetromino contains a 'taken' div, change the divs where the tetromino lies to also be taken.
    if(this.current.some(index => this.grid[this.currentPosition + index + this.width].classList.contains('taken'))) {
      this.current.forEach(index => this.grid[this.currentPosition + index].classList.add('taken'))
      //start a new tetromino falling
      this.random = this.nextRandom
      this.nextRandom = Math.floor(Math.random() * this.theTetrominos.length)
      this.current = this.theTetrominos[this.random][this.currentRotation]
      this.currentPosition = 4
      this.draw()
      this.statsHelper()
      if (!this.AIPlayer) {
        this.addScore() //only remove lines if on the actual board
        this.displayShape() //only waste time redrawing shape once a block
        this.gameOver() //gameover checked after block placed in main
      }
    }
  }

  //move the tetromino down
  moveDown() {
    this.undraw()
    this.currentPosition += this.width
    this.draw()
    this.freeze()
  }

  forceDown() {
    while (!this.current.some(index => this.grid[this.currentPosition + index + this.width].classList.contains('taken'))) {
      this.undraw()
      this.currentPosition += this.width
      this.draw()
    }
    this.freeze()
  }

  rotate(){
    this.undraw()
    this.pastRotation = this.currentRotation
    this.currentRotation = (this.currentRotation + 1) % 4
    this.current = this.theTetrominos[this.random][this.currentRotation]
    if (this.current.some(index => this.grid[this.currentPosition + index].classList.contains('taken'))) {
      console.log('cant rotate that!')
      //current = theTetrominos[random][pastRotation]
      this.currentPosition -= this.width
    }
    this.draw()
    this.freeze()
  }

  //move the tetrominos left, unless it is at the edge or there is a blockage.
  moveLeft(){
    this.undraw()
    //if any of the indexes is touching the left edge (10 % width=(10) === 0)
    const isAtLeftEdge = this.current.some(index => (this.currentPosition + index) % this.width === 0)
    //if okay, move it left
    if (!isAtLeftEdge) this.currentPosition -= 1
    //if colliding with any taken divs, move it back.
    if (this.current.some(index => this.grid[this.currentPosition + index].classList.contains('taken'))) this.currentPosition += 1
    this.draw()
  }

  //move tetrominos right, same logic as moveLeft
  moveRight(){
    this.undraw()
    const isAtRightEdge = this.current.some(index => (this.currentPosition + index) % this.width === this.width - 1)
    if (!isAtRightEdge) this.currentPosition += 1
    if (this.current.some(index => this.grid[this.currentPosition + index].classList.contains('taken'))) this.currentPosition -= 1
    this.draw()
  }

  //add score and remove completed rows
  addScore() {
    for (let i=0; i < 199; i += this.width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
      if (row.every(index => this.grid[index].classList.contains('taken'))) {
        this.score += 10
        this.scoreText.innerHTML = this.score
        row.forEach(index => {
          this.grid[index].classList.remove('tetromino')
          this.grid[index].classList.remove('taken')
          this.grid[index].style.backgroundColor = ''
        })
        const removed = this.grid.splice(i, this.width)
        this.grid = removed.concat(this.grid)
        this.grid.forEach(cell => this.parentGrid.appendChild(cell))
      }
    }
  }

  //game over
  gameOver(){
    //if our block is inside any other blocks, the game ends. This happens when a block spawns into another one.
    if (this.current.some(index => this.grid[this.currentPosition + index].classList.contains('taken'))){
      this.scoreText.innerHTML = 'end'
      clearInterval(this.timerId)
      return true
    }
    return false
  }


  //AI HELPER FUNCTIONS
  getHeight(){
    for (let i = 0; i < 209; i++){
      if (this.grid[i].classList.contains('taken')) {
        const maxHeight = (this.height - Math.floor(i / this.width))
        this.heightText.innerHTML = maxHeight
        return maxHeight //current level. height - (index found / width)
      }
    }
  }

  getBumpiness(){
    //find height of first column,  add the abs() difference of height to the next column, continue
    let totalBumpiness = 0
    let newColumnHeight = 0
    let pastColumnHeight = -1
    for (let column = 0; column < 9; column++){
      for (let i = column; i < this.height * this.width + this.width; i += this.width) { //i goes to 209 (height * width + width) in order to account for the '0' height floor
        if (this.grid[i].classList.contains('taken')) {
          const newColumnHeight = (this.height - Math.floor(i / this.width)) //current height formula
          if (pastColumnHeight != -1){ //let it run once before doing math
            totalBumpiness += Math.abs(newColumnHeight - pastColumnHeight)
          }
          pastColumnHeight = newColumnHeight
          break //exit this column
        }
      }
    }
    this.bumpinessText.innerHTML = totalBumpiness
    return totalBumpiness
  }

  getHoles(){
    let numHoles = 0
    for (let column = 0; column < 9; column++){
      let blockHit = false
      for (let i = column; i < this.height * this.width; i += this.width) {
        //if there was a block higher up and this is an air pocket, that's a hole.
        if (blockHit && !this.grid[i].classList.contains('taken')) numHoles++
        else if (!blockHit && this.grid[i].classList.contains('taken')) blockHit = true
      }
    }
    this.holesText.innerHTML = numHoles
    return numHoles
  }

  statsHelper(){
    this.currentHeight = this.getHeight()
    this.currentBump = this.getBumpiness()
    this.currentHoles = this.getHoles()
  }

  //display the shape in the mini-grid
  displayShape() {
    //cleanse the whole minigrid
    this.displaySquares.forEach(square => {
      square.classList.remove('tetromino')
      square.style.backgroundColor = ''
    })
    this.upNextTetrominoes[this.nextRandom].forEach(index => {
      this.displaySquares[this.displayIndex + index].classList.add('tetromino')
      this.displaySquares[this.displayIndex + index].style.backgroundColor = this.colors[this.nextRandom]
    })
  }

}