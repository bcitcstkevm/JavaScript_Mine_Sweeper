const canvas = document.getElementById("canvus");
const c = canvas.getContext('2d')

canvas.width = 400;
canvas.height = 400;

const mouse = {
    x: 800,
    y: 800,
    button: 0,
    buttons: 0
}

// Event Listeners
canvas.addEventListener('contextmenu', event => {
    event.preventDefault();
    mouse.x = getMousePos(canvas, event).x
    mouse.y = getMousePos(canvas, event).y
    mouse.button = event.button;
    mouse.button = event.buttons;
    // console.log('here')
    if (win_state == null) {
        right_mouse_pressed()
    }
})


canvas.addEventListener('click', event => {
    // console.log(event)
    mouse.x = getMousePos(canvas, event).x
    mouse.y = getMousePos(canvas, event).y
    if (win_state == null) {
        left_mouse_pressed()
    }
})

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect(), // abs. size of element
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
    this.revealed_already = false;
    this.x = i * w
    this.y = j * w
    this.w = w
    this.neighborCount = 0;
    this.flagged = false;

    this.show = () => {
        let shade_color = 'silver'
        let stroke_color = 'black'
        // at the start draw the grid 
        if (!this.revealed && !this.revealed_already) {
            c.beginPath();
            c.strokeStyle = stroke_color;
            c.rect(this.x, this.y, this.w, this.w);
            c.stroke();
            c.closePath();
        }


        if (this.revealed && !this.revealed_already) {
            if (this.bomb) {
                //shade cell
                c.beginPath();
                c.fillStyle = shade_color;
                c.strokeStyle = stroke_color
                c.rect(this.x, this.y, this.w, this.w);
                c.fill();
                c.stroke()
                //draw bomb
                c.beginPath();
                c.strokeStyle = 'green';
                c.fillStyle = 'red';
                c.arc(this.x + w / 2, this.y + w / 2, 10, 0, 2 * Math.PI, false);
                c.stroke();
                c.fill();
                c.closePath();
            }
            else {
                //shade cell
                c.beginPath();
                c.fillStyle = shade_color;
                c.strokeStyle = stroke_color;
                c.rect(this.x, this.y, this.w, this.w);
                c.fill();
                c.stroke()
                //draw count
                if (!this.neighborCount == 0) {
                    c.font = '20px Comic Sans MS';
                    c.fillStyle = 'black';
                    c.fillText(this.neighborCount, this.x + this.w / 2 - 5, this.y + this.w / 2 + 6)
                    c.closePath()
                }
            }
        }
    }

    this.countNeighbors = () => {
        if (!this.bomb) {
            let num_of_bombs = 0

            for (let x_bound = -1; x_bound < 2; x_bound++) {
                for (let y_bound = -1; y_bound < 2; y_bound++) {
                    let i = this.i + x_bound
                    let j = this.j + y_bound
                    if (i > -1 && i < grid.length && j > -1 && j < grid[i].length) {
                        let neighbor = grid[i][j]
                        if (neighbor.bomb) {
                            num_of_bombs++;
                        }
                    }
                }
            }
            this.neighborCount = num_of_bombs;
        }
        else {
            this.neighborCount = -1
            return
        }
    }

    this.mouse_inside = (x, y) => {
        // console.log('check')
        // console.log(x)
        // console.log(this.x)
        // console.log(x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w)
        return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
    }

    this.reveal = () => {
        this.revealed = true;
        if (this.neighborCount == 0) {
            this.show_adjacent_cells();
        }

        // if (!this.flagged) {
        //     this.revealed = true;
        //     if (this.neighborCount == 0) {
        //         this.show_adjacent_cells();
        //     }
        // }

    }

    this.show_adjacent_cells = () => {
        for (let x_bound = -1; x_bound < 2; x_bound++) {
            for (let y_bound = -1; y_bound < 2; y_bound++) {
                let i = this.i + x_bound
                let j = this.j + y_bound
                if (i > -1 && i < grid.length && j > -1 && j < grid[i].length) {
                    let adjacent_cell = grid[i][j]
                    if (!adjacent_cell.bomb && !adjacent_cell.revealed && !adjacent_cell.flagged) {
                        adjacent_cell.reveal();
                    }
                }
            }
        }
    }

    this.flag = () => {
        if (!this.revealed_already) {
            if (!this.flagged) {
                c.beginPath();
                c.font = '30px Comic Sans MS';
                c.fillStyle = 'red';
                c.fillText("X", this.x + this.w / 2 - 11, this.y + this.w / 2 + 11)
                c.closePath()
                this.flagged = true
            }
            else {
                c.clearRect(this.x + 1, this.y + 1, this.w - 3, this.w - 3)
                this.flagged = false;
            }
        }
    }
}

function left_mouse_pressed() {

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let each_cell = grid[i][j]
            if (each_cell.mouse_inside(mouse.x, mouse.y) && !each_cell.flagged) {
                // console.log('here')
                each_cell.reveal()
                // each_cell.show()
                if (each_cell.bomb) {
                    game_over();
                    break;                  
                }                
                draw()

                // if (!this.flagged) {
                //     each_cell.revealed_already = true;
                // }
            }
        }
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let each_cell = grid[i][j]
            if (each_cell.revealed) {
                each_cell.revealed_already = true;
            }
        }
    }

    if (win_state != false){
        check_for_win()
    }
    
}

function game_over(){
    reveal_all()
    end_game()            
    draw()
}

function reveal_all() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j].revealed = true;
        }
    }
}

function end_game(){
    // game_state = false;
    win_state = false;
    post_game()
}



function right_mouse_pressed() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let each_cell = grid[i][j]
            if (each_cell.mouse_inside(mouse.x, mouse.y) && !this.revealed_already) {
                // console.log('here')
                each_cell.flag()
                // each_cell.show()
                // if (each_cell.bomb) {
                //     game_over();
                // }
                // // draw()
                // each_cell.flagged = true;
            }
        }
    }
    // console.log(mouse.button)
    // console.log(mouse.buttons)
}

function check_for_win() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let each_cell = grid[i][j]
            if (!each_cell.bomb && !each_cell.revealed_already) {
                return;
            }
            if (i == grid.length - 1 && j == grid[i].length - 1) {
                // console.log(grid)
                // console.log('you won')
                // game_over()
                win_state = true;
                // game_state = false;
                post_game()
            }
        }
    }

    // if (game_state != false){
        
    // }
    
    // console.log('no win')
}



function post_game() {
    if (win_state != null) {
        if (win_state) {
            console.log('You won')
        }
        else {
            console.log('You lost')
        }
    }
}

function check_board_easy() {
    canvas.height = 200;
    canvas.width = 200;
    set_up()
    draw()
    win_state = null
    // game_state = true;
}

function check_board_medium() {
    canvas.height = 400;
    canvas.width = 400;
    set_up()
    draw()
    win_state = null
    // game_state = true;
}

function check_board_hard() {
    canvas.height = 800;
    canvas.width = 800;
    set_up()
    draw()
    win_state = null
    // game_state = true;
}


// if (str == 'easy'){

// }
// if (str == 'medium'){
//     canvas.height = 400;
//     canvas.width = 400;
//     set_up()
//     draw()
// }
// if (str == 'hard'){
//     canvas.height = 800;
//     canvas.width = 800;
//     set_up()
//     draw()
// }
// else{
//     console.log('you messed up')
// }





let grid
let cols;
let rows;
let w = 40
let win_state = null
// let game_state = true


function set_up() {
    cols = Math.floor(canvas.width / w)
    rows = Math.floor(canvas.height / w)
    grid = makeArray(cols, rows)

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j] = new Cell(i, j, w)
        }
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j].countNeighbors();
        }
    }
    // console.log(grid)
}

function draw() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j].show();
        }
    }
}




set_up()
draw()
