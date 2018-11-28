const canvas = document.getElementById("canvus");
const c = canvas.getContext('2d')

canvas.width = 400;
canvas.height = 400;

const mouse = {
    x: 800,
    y: 800
}

// Event Listeners
addEventListener('click', event => {
    mouse.x = getMousePos(canvas, event).x
    mouse.y = getMousePos(canvas, event).y
    mouse_pressed()
})

// addEventListener('resize', () => {    
//     canvas.width = 800;
//     canvas.height = 800;
//     init()
// })

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y  
    return {
        x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}


function makeArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
    }
    return arr
}


function Cell(i, j, w) {
    this.i = i
    this.j = j
    if (Math.random() < 0.1) {
        this.bomb = true
    }
    else {
        this.bomb = false
    }
    this.revealed = false;
    this.x = i * w
    this.y = j * w
    this.w = w
    this.neighborCount = 0;

    this.show = () => {
        c.beginPath();
        c.strokeStyle = 'black';
        c.rect(this.x, this.y, this.w, this.w);
        c.stroke();
        c.closePath();

        if (this.revealed) {
            // console.log('here')
            if (this.bomb) {
                c.beginPath();
                c.strokeStyle = 'green';
                c.fillStyle = 'red';
                c.arc(this.x + w / 2, this.y + w / 2, 10, 0, 2 * Math.PI, false);
                c.stroke();
                c.fill();
                c.closePath();
            }
            else {
                // c.beginPath();
                // c.fillStyle = 'silver'
                // c.rect(this.x, this.y, this.w, this.w);
                // c.fill();
                // c.closePath();



                c.beginPath();
                c.font = '20px Comic Sans MS';
                c.fillStyle = 'black';
                // c.textAlign = 'center';

                c.fillText(this.neighborCount, this.x + this.w / 2 - 5, this.y + this.w / 2 + 6)
                c.closePath()

                // if (this.neighborCount < 0) {
                //     c.beginPath();
                //     c.font = '20px Comic Sans MS';
                //     c.fillStyle = 'black';
                //     // c.textAlign = 'center';

                //     c.fillText(this.neighborCount, this.x + this.w / 2, this.y + this.w / 2)
                //     c.closePath()
                // }
            }
        }
    }

    this.adjacent_cells = () => {
        for (let x_bound = -1; x_bound < 2; x_bound++) {
            for (let y_bound = -1; y_bound < 2; y_bound++) {
                let i = this.i + x_bound
                let j = this.j + y_bound
                if (i > -1 && i < cols && j > -1 && j < rows) {
                    let neighbor = grid[i][j]
                    if (!neighbor.bomb && !neighbor.revealed) {
                        neighbor.reveal();
                    }
                }
            }
        }
    }

    this.mouse_inside = (x, y) => {
        return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w - 6);
    }

    this.reveal = () => {
        this.revealed = true;
        if (this.neighborCount == 0){
            this.adjacent_cells();
        }
    }

    this.countNeighbors = () => {
        if (this.bomb) {
            this.neighborCount = -1
            return
        }


        let num_of_bombs = 0
        for (let x_bound = -1; x_bound < 2; x_bound++) {
            for (let y_bound = -1; y_bound < 2; y_bound++) {
                let i = this.i + x_bound
                let j = this.j + y_bound
                if (i > -1 && i < cols && j > -1 && j < rows) {
                    let neighbor = grid[i][j]
                    if (neighbor.bomb) {
                        num_of_bombs++;
                    }
                }
            }
        }

        this.neighborCount = num_of_bombs;
        
    }
}




let grid
let cols;
let rows;
let w = 40

function set_up() {
    cols = Math.floor(canvas.width / w)
    rows = Math.floor(canvas.height / w)
    grid = makeArray(cols, rows)

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = new Cell(i, j, w)
        }
    }
    console.log(grid)

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].countNeighbors();
        }
    }
}

function game_over(){
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].revealed = true;
        }
    }
}

function mouse_pressed() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j].mouse_inside(mouse.x, mouse.y)) {
                grid[i][j].reveal()
                
                grid[i][j].show()
                if (grid[i][j].bomb){
                    game_over();
                    
                }
                draw()
                
                

                
            }

            
        }
    }
}

function draw() {

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].show();
        }
    }
}




set_up()
draw()
