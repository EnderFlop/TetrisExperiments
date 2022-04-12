class Board {
  constructor(width, height) {
    this.grid = [];
    for (let i = 0; i < height + 1; i++) {
      for (let j = 0; j < width; j++){
        this.grid.push(document.createElement('div'))
      } 
    }
  }

  draw(current) {
    //for every coordinate in a rotation, add the 'tetromino' class to the div at that position.
    current.forEach(index => {
      this.grid[currentPosition + index].classList.add('tetromino')
      this.grid[currentPosition + index].style.backgroundColor = colors[random]
    })
  }

  undraw(current){
    current.forEach(index => {
      this.grid[currentPosition + index].classList.remove('tetromino')
      this.grid[currentPosition + index].style.backgroundColor = ''
    })
  }

  //stop the tetromino
  freeze(current) {
    //if the row below the tetromino contains a 'taken' div, change the divs where the tetromino lies to also be taken.
    if(current.some(index => this.grid[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => this.grid[currentPosition + index].classList.add('taken'))
      //start a new tetromino falling
      random = nextRandom
      nextRandom = Math.floor(Math.random() * theTetrominos.length)
      current = theTetrominos[random][currentRotation]
      currentPosition = 4
      draw(current)
      addScore()
      gameOver(current)
      statsHelper()
    }
  }

  //move the tetromino down
  moveDown(current) {
    undraw(current)
    currentPosition += width
    draw(current)
    freeze(current)
  }

  forceDown(current) {
    while (!current.some(index => this.grid[currentPosition + index + width].classList.contains('taken'))) {
      undraw(current)
      currentPosition += width
      draw(current)
    }
    freeze(current)
  }

  rotate(current){
    undraw(current)
    pastRotation = currentRotation
    currentRotation = (currentRotation + 1) % 4
    current = theTetrominos[random][currentRotation]
    if (current.some(index => this.grid[currentPosition + index].classList.contains('taken'))) {
      console.log('cant rotate that!')
      //current = theTetrominos[random][pastRotation]
      currentPosition -= width
    }
    draw(current)
    freeze(current)
  }

  //move the tetrominos left, unless it is at the edge or there is a blockage.
  moveLeft(current){
    undraw(current)
    //if any of the indexes is touching the left edge (10 % width=(10) === 0)
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
    //if okay, move it left
    if (!isAtLeftEdge) currentPosition -= 1
    //if colliding with any taken divs, move it back.
    if (current.some(index => this.grid[currentPosition + index].classList.contains('taken'))) currentPosition += 1
    draw(current)
  }

  //move tetrominos right, same logic as moveLeft
  moveRight(current){
    undraw(current)
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
    if (!isAtRightEdge) currentPosition += 1
    if (current.some(index => this.grid[currentPosition + index].classList.contains('taken'))) currentPosition -= 1
    draw(current)
  }

  //add score and remove completed rows
  addScore() {
    for (let i=0; i < 199; i += width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
      if (row.every(index => this.grid[index].classList.contains('taken'))) {
        score += 10
        ScoreDisplay.innerHTML = score
        row.forEach(index => {
          this.grid[index].classList.remove('tetromino')
          this.grid[index].classList.remove('taken')
          this.grid[index].style.backgroundColor = ''
        })
        const removed = this.grid.splice(i, width)
        this.grid = removed.concat(this.grid)
        this.grid.forEach(cell => grid.appendChild(cell))
      }
    }
  }

  //game over
  gameOver(current){
    //if our block is inside any other blocks, the game ends. This happens when a block spawns into another one.
    if (current.some(index => this.grid[currentPosition + index].classList.contains('taken'))){
      ScoreDisplay.innerHTML = 'end'
      clearInterval(timerId)
      document.removeEventListener('keydown', control)
    }
  }


  //AI HELPER FUNCTIONS
  getHeight(){
    for (let i = 0; i < 209; i++){
      if (this.grid[i].classList.contains('taken')) {
        heightText.innerHTML = (height - Math.floor(i / width)) //current level. height - (index found / width)
        break 
      }
    }
  }

  getBumpiness(){
    //find height of first column,  add the abs() difference of height to the next column, continue
    totalBumpiness = 0
    let newColumnHeight = 0
    let pastColumnHeight = -1
    for (let column = 0; column < 9; column++){
      for (let i = column; i < height * width + width; i += width) { //i goes to 209 (height * width + width) in order to account for the '0' height floor
        if (this.grid[i].classList.contains('taken')) {
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

  getHoles(){
    let numHoles = 0
    for (let column = 0; column < 9; column++){
      let blockHit = false
      for (let i = column; i < height * width; i += width) {
        //if there was a block higher up and this is an air pocket, that's a hole.
        if (blockHit && !this.grid[i].classList.contains('taken')) numHoles++
        else if (!blockHit && this.grid[i].classList.contains('taken')) blockHit = true
      }
    }
    holesText.innerHTML = numHoles
  }

  statsHelper(){
    getHeight()
    getBumpiness()
    getHoles()
  }

}