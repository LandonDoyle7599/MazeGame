let initialPath = [];
let maze = [];
const menuDiv = document.getElementById('menu');
const gameDiv = document.getElementById('game');
const endScreen = document.getElementById('endScreen');
const sizeDisplay = document.getElementById('size');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const leaderBoardDiv = document.getElementById('Leaderboard');
let emptyLeaderboard = document.createElement('h3');
emptyLeaderboard.innerText = "No Leaderboard Data";
leaderBoardDiv.appendChild(emptyLeaderboard);
gameDiv.style.display = 'none';
endScreen.style.display = 'none';
let textcanvas = document.getElementById('textcanvas');
let textcontext = textcanvas.getContext('2d');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let animationFrame;
let playerPosition = [];
let leaderBoard = [];
let playerMoved = false;
let score = 0;
let prevTime = 0;
let stopGame = false;
let elapsedTime = 0;
let totalTime = 0;
let texture = {
    imageSrc: './aliceBackground.jpg',
    center: {x: 250, y: 250},
    width: 500,
    height: 500,
}
let moveKeys = {
    left: false,
    right: false,
    up: false,
    down: false,
}
let stateKeys = {
    hint: false,
    breadCrumbs: false,
    shortPath: false,
}
let keyMap = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    87: 'up',
    65: 'left',
    83: 'down',
    68: 'right',
    73: 'up',
    74: 'left',
    75: 'down',
    76: 'right',
    72: 'hint',
    66: 'breadCrumbs',
    80: 'shortPath',
}
window.addEventListener('keydown', keydown, false)
function keydown(e){
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
    if(e.repeat) return
    let key = keyMap[e.keyCode]
    moveKeys[key] = true
    stateKeys[key] = !stateKeys[key]
}

function endGame(){
    sizeDisplay.innerText = "The maze was " +maze.length+"x"+maze.length
    scoreDisplay.innerText = "Your score was " + score + " points"
    timeDisplay.innerText = "It took you " + Math.round(totalTime/1000, 2) + " seconds to solve the maze"
    endScreen.style.display = 'block';
    let boardItem = new leaderBoardItem(maze.length, score, Math.round(totalTime/1000, 2))
    leaderBoard.push(boardItem)
    sortLeaderBoard()
}

function gameOver(){
    let max = Math.min(leaderBoard.length, 10)
    for(let i = 0; i < max; i++){
        let item = leaderBoard[i]
        let paragraph = document.createElement('li')
        paragraph.innerText = "Maze Size: " + item.size +"x"+item.size + ", Score: " + item.score + ", Time: " + item.time + " (sec)"
        leaderBoardDiv.appendChild(paragraph)
    }
    gameDiv.style.display = 'none';
    endScreen.style.display = 'none';
    menuDiv.style.display = 'block';    
}

function sortLeaderBoard(){
    leaderBoard.sort(function(a, b){
        return b.size - a.size || b.score - a.score || a.time - b.time
    })
}

function gameLoop(timeStamp){
    elapsedTime = timeStamp - prevTime
    prevTime = timeStamp
    processInput()
    update(elapsedTime)
    render()
    if(!stopGame){
        requestAnimationFrame(gameLoop)
    }
}

function setupGame(size){
    textcontext.clearRect(0, 0, textcanvas.width, textcanvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
    texture.image = new Image();
    texture.ready = false;
    texture.image.onload = function() { 
         texture.ready = true;
    };
    leaderBoardDiv.innerHTML = "";
    texture.image.src = texture.imageSrc;
    maze = generateMaze(size)
    initialPath = shortestMazePath(maze, [[0,0]])
    scoreCells(maze, initialPath)
    menuDiv.style.display = 'none';
    gameDiv.style.display = 'block';
    prevTime = performance.now()
    moveKeys.left = false
    moveKeys.right = false
    moveKeys.up = false
    moveKeys.down = false
    stopGame = false
    playerPosition = [0,0]
    maze[0][0].visited = true
    score = 0
    totalTime = 0
    stateKeys.hint = false
    stateKeys.breadCrumbs = false
    stateKeys.shortPath = false
    playerMoved = false
    prevTime = performance.now()
    elapsedTime = 0
    requestAnimationFrame(gameLoop)

  }
  
function update(timeStamp){
    totalTime += timeStamp
    if(playerMoved){
        initialPath = shortestMazePath(maze, [playerPosition])
    }
    playerMoved = false
    if(playerPosition[0] == maze.length-1 && playerPosition[1] == maze.length-1){
        stopGame = true;
        endGame()        
    }
}

//Input Processing
function processInput(){
    if(moveKeys.left){
        playerMoved = true
        moveLeft()
    }
    if(moveKeys.right){
        playerMoved = true
        moveRight()
    }
    if(moveKeys.up){
        playerMoved = true
        moveUp()
    }
    if(moveKeys.down){
        playerMoved = true
        moveDown()
    }
    moveKeys.left = false
    moveKeys.right = false
    moveKeys.up = false
    moveKeys.down = false
}

function scoreMove(){
    if(maze[playerPosition[0]][playerPosition[1]].visited) return
    if(maze[playerPosition[0]][playerPosition[1]].initialPath){
        score += 5
        return
    }
    if(maze[playerPosition[0]][playerPosition[1]].adjacent){
        score -= 1
        return
    }
    score -= 2
    return
}

function moveLeft(){
    if(playerPosition[1] > 0 && !maze[playerPosition[0]][playerPosition[1]].left){
            playerPosition[1] -= 1
            scoreMove()
            maze[playerPosition[0]][playerPosition[1]].visited = true
    }
}

function moveRight(){
    if(playerPosition[1] < maze.length-1 && !maze[playerPosition[0]][playerPosition[1]].right){
            playerPosition[1] += 1
            scoreMove()
            maze[playerPosition[0]][playerPosition[1]].visited = true
    }
}

function moveUp(){
    if(playerPosition[0] > 0 && !maze[playerPosition[0]][playerPosition[1]].up){
            playerPosition[0] -= 1
            scoreMove()
            maze[playerPosition[0]][playerPosition[1]].visited = true
    }
}

function moveDown(){
    if(playerPosition[0] < maze.length-1 && !maze[playerPosition[0]][playerPosition[1]].down){
            playerPosition[0] += 1
            scoreMove()
            maze[playerPosition[0]][playerPosition[1]].visited = true
    }
}

//Leader Board Class
class leaderBoardItem{
    constructor(size, score, time){
        this.size = size
        this.score = score
        this.time = time
    }
}

//Rendering Stuff
function render(){
    textcontext.clearRect(0, 0, textcanvas.width, textcanvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawImage()
    drawScore()
    drawTime()
    drawMaze(context, maze)
    drawBorder(context, 0, 0, canvas.width, canvas.height)
    if(stateKeys.shortPath){
        drawShortestPath(context, maze, initialPath)
    }
    // drawStart(context, maze)
    drawEnd(context)
    if(stateKeys.breadCrumbs){
        drawBreadcrumbs(context)
    }
    if(stateKeys.hint){
        drawHint(context, maze, initialPath)
    }
    drawPlayer(context, maze, playerPosition)
}

function drawImage(){
    if (texture.ready) {
        context.save();
        
        context.translate(texture.center.x, texture.center.y);
        context.rotate(texture.rotation);
        context.translate(-texture.center.x, -texture.center.y);
        
        context.drawImage(
            texture.image, 
            texture.center.x - texture.width/2,
            texture.center.y - texture.height/2,
            texture.width, texture.height);
        
        context.restore();
    }

}

function drawScore(){
    textcontext.fillStyle = 'rgba(0, 0, 0, 1)';
    textcontext.font = '25px Arial';
    textcontext.fillText('Score: ' + score, 10, 80);
}

function drawTime(){
    textcontext.fillStyle = 'rgba(0, 0, 0, 1)';
    textcontext.font = '25px Arial';
    textcontext.fillText('Time: ' + Math.round(totalTime/1000), 500, 80);
}

function drawBorder(context, x, y, width, height){
    context.strokeStyle = 'rgba(0, 0, 0, .8)';
    context.lineWidth = 12;
    context.strokeRect(x, y, width, height);
}

function drawCell(context, cell){
    context.strokeStyle = 'rgba(0, 0, 0, .8)';
    context.lineWidth = 2;
    let width = cell.size;
    let height = cell.size;
    let x = cell.x;
    let y = cell.y;
    if(cell.left){
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x, y+height);
        context.stroke();
    }
    if(cell.right){
        context.beginPath();
        context.moveTo(x+width, y);
        context.lineTo(x+width, y+height);
        context.stroke();
    }
    if(cell.up){
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x+width, y);
        context.stroke();
    }
    if(cell.down){
        context.beginPath();
        context.moveTo(x, y+height);
        context.lineTo(x+width, y+height);
        context.stroke();
    }
}

function drawPlayer(context, maze, pos){
    let cell = maze[pos[0]][pos[1]]
    context.fillStyle = 'rgba(100, 30, 227, 1)';
    context.beginPath()
    context.arc(cell.x + cell.size/2, cell.y + cell.size/2, cell.size/4, 0, 2*Math.PI)
    context.fill()

}

function drawHint(context, maze, path){
    if(path.length < 1) return
    let cell = maze[path[1][0]][path[1][1]]
    context.fillStyle = 'rgba(245, 213, 5, 1)';
    context.beginPath()
    context.arc(cell.x + cell.size/2, cell.y + cell.size/2, cell.size/4.5, 0, 2*Math.PI)
    context.fill()
}

// function drawStart(context, maze){
//     let startCell = maze[0][0];
//     context.fillStyle = 'rgba(104, 227, 100, 1)';
//     context.beginPath()
//     context.arc(startCell.x + startCell.size/2, startCell.y + startCell.size/2, startCell.size/4.1, 0, 2*Math.PI)
//     context.fill()
// }

function drawEnd(context){
    let endCell = maze[maze.length-1][maze.length-1];
    context.fillStyle = 'rgba(237, 85, 85, 1)';
    context.beginPath()
    context.arc(endCell.x + endCell.size/2, endCell.y + endCell.size/2, endCell.size/4.1, 0, 2*Math.PI)
    context.fill()
}

function drawMaze(context, maze){
    for(let i = 0; i < maze.length; i++){
        for(let j = 0; j < maze.length; j++){
            drawCell(context, maze[i][j])
        }
    }
}

function drawShortestPath(context, maze, path){
    for(let i = 0; i < path.length; i++){
        let cell = maze[path[i][0]][path[i][1]]
        context.fillStyle = 'rgba(5, 17, 181, .5)';
        context.beginPath()
        context.arc(cell.x + cell.size/2, cell.y + cell.size/2, cell.size/4.1, 0, 2*Math.PI)
        context.fill()
    }
}

function drawBreadcrumbs(context){
    for(let i = 0; i < maze.length; i++){
        for(let j = 0; j < maze.length; j++){
            let cell = maze[i][j]
            if(cell.visited){
                context.fillStyle = 'rgba(247, 5, 167, 1)';
                context.beginPath()
                context.arc(cell.x + cell.size/2, cell.y + cell.size/2, cell.size/6, 0, 2*Math.PI)
                context.fill()
            }
    }
}
}






  //Maze Generation Stuff -- Randomized Kruskal's Algorithm
function generateMaze(size){
    let maze = createMaze(size)
    maze[0][0].start = true;
    maze[size-1][size-1].end = true;
    return maze;
}

function scoreCells(maze, path){
    for(let i = 0; i < path.length; i++){
        maze[path[i][0]][path[i][1]].initialPath = true;
    }
    for(let i = 0; i < path.length; i++){
        if(path[i][0] > 0){
            if(!maze[path[i][0]-1][path[i][1]].initialPath && !maze[path[i][0]][path[i][1]].up){
                maze[path[i][0]-1][path[i][1]].adjacent = true;
            }
        }
        if(path[i][0] < maze.length-1){
            if(!maze[path[i][0]+1][path[i][1]].initialPath && !maze[path[i][0]][path[i][1]].down){
                maze[path[i][0]+1][path[i][1]].adjacent = true;
            }
        }
        if(path[i][1] > 0){
            if(!maze[path[i][0]][path[i][1]-1].initialPath && !maze[path[i][0]][path[i][1]].left){
                maze[path[i][0]][path[i][1]-1].adjacent = true;
            }
        }
        if(path[i][1] < maze.length-1){
            if(!maze[path[i][0]][path[i][1]+1].initialPath && !maze[path[i][0]][path[i][1]].right){
                maze[path[i][0]][path[i][1]+1].adjacent = true;
            }
        }
    }
    return maze;
}

function shortestMazePath(maze, current){
    if(current[0][0] == maze.length-1 && current[0][1] == maze.length-1) return []
    let visit = []
    visit.push(current)
    let queue = []
    let pos = current;
    if(!maze[current[0][0]][current[0][1]].right){
        visit.push([current[0][0], current[0][1]+1])
        let temp = copyArray(current)
        temp.push([current[0][0], current[0][1]+1])
        queue.push(temp)
    }
    if(!maze[current[0][0]][current[0][1]].up){
        visit.push([current[0][0]-1, current[0][1]])
        let temp = copyArray(current)
        temp.push([current[0][0]-1, current[0][1]])
        queue.push(temp)
    }
    if(!maze[current[0][0]][current[0][1]].left){
        visit.push([current[0][0], current[0][1]-1])
        let temp = copyArray(current)
        temp.push([current[0][0], current[0][1]-1])
        queue.push(temp)
    }
    if(!maze[current[0][0]][current[0][1]].down){
        visit.push([current[0][0]+1, current[0][1]])
        let temp = copyArray(current)
        temp.push([current[0][0]+1, current[0][1]])
        queue.push(temp)
    }
    while(queue.length > 0){
        pos = queue.shift()
        if(maze[pos[pos.length-1][0]][pos[pos.length-1][1]].end){
            return pos;
        }
        if(!maze[pos[pos.length-1][0]][pos[pos.length-1][1]].left && !visit.some(([a, b]) =>
            [pos[pos.length-1][0]==a && pos[pos.length-1][1]-1]==b 
        )){
            if(pos[pos.length-1][1] > 0){
                visit.push([pos[pos.length-1][0], pos[pos.length-1][1]-1])
                let temp = copyArray(pos)
                temp.push([pos[pos.length-1][0], pos[pos.length-1][1]-1])
                queue.push(temp)
            }
        }
        if(!maze[pos[pos.length-1][0]][pos[pos.length-1][1]].right && !visit.some(function([a, b]){
            return [pos[pos.length-1][0]==a && pos[pos.length-1][1]+1]==b
        })){
            if(pos[pos.length-1][1] < maze.length-1){
                visit.push([pos[pos.length-1][0], pos[pos.length-1][1]+1])
                let temp = copyArray(pos)
                temp.push([pos[pos.length-1][0], pos[pos.length-1][1]+1])
                queue.push(temp)
            }
        }
        if(!maze[pos[pos.length-1][0]][pos[pos.length-1][1]].up && !visit.some(function([a, b]){
            return [pos[pos.length-1][0]-1 == a && pos[pos.length-1][1]] == b
        })){
            if(pos[pos.length-1][0] > 0){
                visit.push([pos[pos.length-1][0]-1, pos[pos.length-1][1]])
                let temp = copyArray(pos)
                temp.push([pos[pos.length-1][0]-1, pos[pos.length-1][1]])
                queue.push(temp)
            }
        }
        if(!maze[pos[pos.length-1][0]][pos[pos.length-1][1]].down && !visit.some(function([a, b]){
            return [pos[pos.length-1][0]+1 == a && pos[pos.length-1][1]] == b
        })){
            if(pos[pos.length-1][0] < maze.length-1){
                visit.push([pos[pos.length-1][0]+1, pos[pos.length-1][1]])
                let temp = copyArray(pos)
                temp.push([pos[pos.length-1][0]+1, pos[pos.length-1][1]])
                queue.push(temp)
            }
        }
    }
    return [];
}

function copyArray(array) {
    return array.map(row => [...row]);
}

function createMaze(size){
    let sides = createSideArray(size);
    let grid = makeGrid(size);
    let iterationCount = sides.length;
    while(iterationCount-- > 1){
        let side = sides[iterationCount-1];
        sides.length = sides.length - 1;
        grid = removeSides(side, grid);
    }
    return grid;
}

function createSideArray(size){
    let side = new Array()
    for(let i = 0; i < size; i++){
        for(let j = 0; j < size; j++){
            if(i+1 < size){
                side.push([i, j, i+1, j]);
            }
            if(j+1 < size){
                side.push([i, j, i, j+1]);
            }
        }
    }
    let shuffledSide = shuffleArray(side)
    return shuffledSide;
}

function shuffleArray(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

function removeSides(indices, grid){
    let i1 = indices[0];
    let j1 = indices[1];
    let i2 = indices[2];
    let j2 = indices[3];
    let set1 = grid[i1][j1].set;
    let set2 = grid[i2][j2].set;
    let newSet = Math.min(grid[i1][j1].set, grid[i2][j2].set);
    if(j1 === j2){
        if(i1 < i2 && grid[i1][j1].set !== grid[i2][j2].set){
            grid[i1][j1].down = false;
            grid[i2][j2].up = false;
            grid[i1][j1].set = newSet;
            grid[i2][j2].set = newSet;
        }
        else if(i1 > i2 && grid[i1][j1].set != grid[i2][j2].set){
            grid[i1][j1].up = false;
            grid[i2][j2].down = false;
            grid[i1][j1].set = newSet;
            grid[i2][j2].set = newSet;
        }
    }
    else if(i1===i2){
        if(j1 < j2 && grid[i1][j1].set !== grid[i2][j2].set){
            grid[i1][j1].right = false;
            grid[i2][j2].left = false;
            grid[i1][j1].set = newSet;
            grid[i2][j2].set = newSet;
        }
        else if(j1 > j2 && grid[i1][j1].set != grid[i2][j2].set){
            grid[i1][j1].left = false;
            grid[i2][j2].right = false;
            grid[i1][j1].set = newSet;
            grid[i2][j2].set = newSet;
        }
    }
    for(let i = 0; i < grid.length; i++){
        for(let j = 0; j < grid.length; j++){
            if(grid[i][j].set === set1 || grid[i][j].set === set2){
                grid[i][j].set = newSet;
            }
        }
    }
    return grid;
}

function makeGrid(size){
    let grid = new Array(size);
    let num = 0;
    for(let i = 0; i < size; i++){
        grid[i] = new Array(size);
    }
    for(let i = 0; i < size; i++){
        for(let j = 0; j < size; j++){
            grid[i][j] = new cell(num, i, j, size);
            num++;
        }
    }
    return grid;
}

class cell{
    up;
    down;
    left;
    right;
    set;
    start;
    end;
    visited;
    shortestPath;
    initialPath;
    adjacent;
    hint;
    x;
    y;
    size;

    constructor(set, x, y, size){
        this.up = true;
        this.down = true;
        this.left = true;
        this.right = true;
        this.set = set;
        this.start = false;
        this.end = false;
        this.visited = false;
        this.shortestPath = false;
        this.hint = false;
        this.initialPath = false;
        this.adjacent = false;
        this.x = y * 500/size;
        this.y = x * 500/size;
        this.size = 500/size;
    }
}
