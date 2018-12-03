//Initialize canvas
const canvas = document.getElementById("canvus");
const c = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;

//Global variables
let grid;
let cols;
let rows;
let w;
let win_state;
let clock;
let mode;
let explosion;

//Initialize
clock = new Timer();
mode = 'medium';
w = 40;
win_state = null;
explosion = new Audio('sound/explosion.mp3')

// Mouse enum
const mouse = {
    x: 800,
    y: 800,
    button: 0,
    buttons: 0
}

// Event Listeners
canvas.addEventListener('contextmenu', event => {
    ///This event listens for right click

    event.preventDefault();
    //^prevents default stuff from happening when you right click

    mouse.x = getMousePos(canvas, event).x
    mouse.y = getMousePos(canvas, event).y
    mouse.button = event.button;
    mouse.button = event.buttons;
    // set Mouse enum variables

    if (win_state == null) {
        // win_state describes the state of the game, win_state == null if game is still running
        right_mouse_pressed()
    }
})


canvas.addEventListener('click', event => {
    //This event listens for a left click
    mouse.x = getMousePos(canvas, event).x
    mouse.y = getMousePos(canvas, event).y
    //set Mouse enum variables

    if (win_state == null) {
        //if win_state == null, the game is still running
        left_mouse_pressed()

        if (!clock.timer_started && win_state == null) {
            //if the timer has not started and the game is still running, start timer
            //timer starts when user left clicks
            clock.start_timer()
        }
    }
})

function getMousePos(canvas, evt) {
    //This function takes a canvas and event
    //The function accounts for the X and Y position within the canvas element as compared to the DOM window.
    //(DOM window - canvas) * scale factors zeros the x and y positions

    let rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y  
    return {
        x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}

//This section describes all the classes we have designed.

function Cell(i, j, w) {
    //Cell describes each cell in our cols by row MS board
    //Param: i,j,w are ints, i describes ith column, j describes jth rows, and w is the width of each cell.
    this.i = i;
    this.j = j;
    this.w = w;

    // x and y are the position of the cell 
    this.x = i * w;
    this.y = j * w;

    //revealed = true, means the cell was clicked  
    //revealed_already, means the cell was clicked before the function was called
    this.revealed = false;
    this.revealed_already = false;

    //neighborCount is the number of mines around a given cell.
    this.neighborCount = 0;

    //flagged = true, means the current cell is flagged
    this.flagged = false;

    //bomb = true, means the cell is a mine
    if (Math.random() < 0.2) {
        this.bomb = true;
    }
    else {
        this.bomb = false;
    }

    this.shade_color = '#D1E8E2';
    this.stroke_color = 'black';
    // Cells methods begin here

    this.countNeighbors = () => {
        //This function counts the number of bombs around each cell

        if (!this.bomb) {
            //This cell cannot be a bomb, else neighborcount = -1
            let num_of_bombs = 0;
            //loop one square in all possible directions
            for (let x_bound = -1; x_bound < 2; x_bound++) {
                for (let y_bound = -1; y_bound < 2; y_bound++) {
                    let i = this.i + x_bound;
                    let j = this.j + y_bound;
                    if (i > -1 && i < grid.length && j > -1 && j < grid[i].length) {
                        //The i and j must be within the 2D array to be valid.
                        let neighbor = grid[i][j];
                        if (neighbor.bomb) {
                            //check bomb status, if bomb, add one to count.
                            num_of_bombs++;
                        }
                    }
                }
            }
            //When loop ends, record state of neighboring bombs
            this.neighborCount = num_of_bombs;
        }
        else {
            this.neighborCount = -1;
            return;
        }
    }

    this.mouse_inside = (x, y) => {
        //This method assists the left mouse clicks.
        //Param x and y are mouse coordinates
        //returns a boolean, if mouse coordinates are inside the cell return true, else false.        
        return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
    }

    this.reveal = () => {
        //Update the revealed state of this cell        
        this.revealed = true;
        if (this.neighborCount == 0) {
            //and if this cell has no bombs nearby, show adjacent cells.
            this.show_adjacent_cells();
        }
    }

    this.show_adjacent_cells = () => {
        //Reveal adjacent cells if they are bombs, not revealed, and not flagged.
        for (let x_bound = -1; x_bound < 2; x_bound++) {
            for (let y_bound = -1; y_bound < 2; y_bound++) {
                //loop one square in all possible directions
                let i = this.i + x_bound
                let j = this.j + y_bound
                //The i and j must be within the 2D array to be valid.
                if (i > -1 && i < grid.length && j > -1 && j < grid[i].length) {
                    let adjacent_cell = grid[i][j]
                    if (!adjacent_cell.bomb && !adjacent_cell.revealed && !adjacent_cell.flagged) {
                        //if adjacent cell is not a bomb, not revealed and not flagged, reveal
                        adjacent_cell.reveal();
                    }
                }
            }
        }
    }

    this.flag = () => {
        //Flag the cell, which locks it from modification
        if (!this.revealed_already) {
            //If not revealed, then ...
            if (!this.flagged) {
                //if not flagged, draw the flag
                c.beginPath();
                c.font = '30px Comic Sans MS';
                c.fillStyle = 'red';
                c.fillText("X", this.x + this.w / 2 - 11, this.y + this.w / 2 + 11);
                c.closePath();
                //change flag status
                this.flagged = true;
            }
            else {
                //if flagged, then clear flag
                c.clearRect(this.x + 1, this.y + 1, this.w - 3, this.w - 3);
                c.rect(this.x + 1, this.y + 1, this.w - 3, this.w - 3)
                c.fillStyle = '#D9B08C'
                c.fill();
                //change flag status
                this.flagged = false;
            }
        }
    }

    this.draw_grid = () => {
        //Draw the square grid
        if (!this.revealed && !this.revealed_already && !this.flagged) {
            //if the cell has never been revealed
            c.beginPath();
            c.strokeStyle = this.stroke_color;
            c.fillStyle = '#D9B08C'
            c.rect(this.x, this.y, this.w, this.w);
            c.stroke();
            c.fill();
            c.closePath();
        }
    }

    this.draw_bomb = () => {
        this.shade_cell()
        //draw bomb
        c.beginPath();
        c.strokeStyle = 'green';
        c.fillStyle = 'red';
        c.arc(this.x + w / 2, this.y + w / 2, 10, 0, 2 * Math.PI, false);
        c.stroke();
        c.fill();
        c.closePath();
    }

    this.draw_neigh_count = () => {
        this.shade_cell()
        //draw count
        if (!this.neighborCount == 0) {
            //if the count isnt zero, render the neightbor count
            c.font = '20px Comic Sans MS';
            c.fillStyle = 'black';
            c.fillText(this.neighborCount, this.x + this.w / 2 - 5, this.y + this.w / 2 + 6)
            c.closePath()
        }
    }

    this.shade_cell = () => {
        //Shade the cell to show it has been clicked.
        c.beginPath();
        c.fillStyle = this.shade_color;
        c.strokeStyle = this.stroke_color;
        c.rect(this.x, this.y, this.w, this.w);
        c.fill();
        c.stroke();

    }

    this.show = () => {
        //Render the changes made.
        //Draw the grid outline.
        this.draw_grid()

        if (this.revealed && !this.revealed_already) {
            //only make a change if a cell has been revealed, but has not been revealed before.
            if (this.bomb) {
                this.draw_bomb();
            }
            else {
                this.draw_neigh_count()
            }
        }
    }
}

function Timer() {
    // This class describes the timer used to keep track of score.

    // The time right now
    this.right_now = 0

    // THe time at when timer ends
    this.end_now = 0

    // The time elasped
    this.time = 0

    // timer_started = true, means the timer has started
    this.timer_started = false;

    // interval_id is the id required to clear a setinterval.
    this.interval_id = 0;

    // Methods for timer start here.

    this.start_timer = () => {
        //Start the timer

        //Get the time right now
        this.right_now = Date.now();

        //Change the state of the timer
        this.timer_started = true;

        //Start counting
        this.time_right_now_seconds();
    }

    this.time_right_now_seconds = () => {
        //Tick Tock occurs here.

        //Store the interval_id for shutdown
        this.interval_id = setInterval(() => {
            //Get the time elapsed
            this.end_timer()
            this.time = Math.floor((this.end_now - this.right_now) / 1000);

            //update the DOM
            this.update_doc('timer')

            //clear the setinterval when timer stops
            if (!this.timer_started) {
                clearInterval(timer.interval_id)
            }

            // Repeat this every second
        }, 1000)
    }

    this.end_timer = () => {
        // Get the time right now.
        this.end_now = Date.now();
    }

    this.stop_timer = () => {
        //Stop the timer
        this.timer_started = false;
    }

    this.update_doc = (id) => {
        //Updates the dom
        //Param, id is a string corresponding to a HTML DOM element's id

        if (this.timer_started) {
            //only update if timer is live
            document.getElementById(id).innerHTML = Math.floor(this.time);
        }
    }

    this.reset_time = () => {
        //Reset the timer instance and DOM elements state.
        this.right_now = 0
        this.end_now = 0
        this.time = 0
        document.getElementById('timer').innerHTML = Math.floor(this.time)
    }

    this.get_time = () => {
        //getter for time
        return this.time;
    }
}

// Utility functions

function makeArray(cols, rows) {
    //Make a 2D array thats cols by rows in diameter
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
    }
    return arr;
}

function update_reveal_already() {
    //Updates revealed already for all cells
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let each_cell = grid[i][j]
            if (each_cell.revealed) {
                each_cell.revealed_already = true;
            }
        }
    }
}

function reveal_all() {
    //Reveal all cells
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j].revealed = true;
        }
    }
}

function check_for_win() {
    //Check 2D array to see if you reach the end
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let each_cell = grid[i][j]
            if (!each_cell.bomb && !each_cell.revealed_already) {
                //found a cell that hasnt been revealed and is not a bomb
                return;
            }
            if (i == grid.length - 1 && j == grid[i].length - 1) {
                //If we hit the end of hte loop, means game is over and user wins   
                //Change win_state = true, means we won                        
                win_state = true;
                //deal with post game stuff 
                post_game()
            }
        }
    }
}

function post_game() {
    //Deal with what happens after game ends.
    if (win_state != null) {
        //only access if game isnt running
        if (win_state) {
            //if we won,
            //update leaderboard
            update_leaderBoard(clock.get_time(), mode)
            //stop timer
            clock.stop_timer()
            console.log('You won')
            console.log(clock.get_time())
        }
        else {
            //we lost
            //stop timer
            clock.stop_timer()
            explosion.play()
            console.log('You lost')
        }
    }
}

function left_mouse_pressed() {
    //Left mouse has been clicked
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            //loop through the 2D array
            let each_cell = grid[i][j];
            if (each_cell.mouse_inside(mouse.x, mouse.y) && !each_cell.flagged) {
                //if mouse was clicked inside a cell, reveal it
                each_cell.reveal()
                // if they clicked a bomb
                if (each_cell.bomb) {
                    reveal_all()
                    //Change game state
                    win_state = false;
                    //deal with post game stuff
                    post_game()
                    //render final frame of game
                    draw()
                    //break out of loop
                    break;
                }
                //if the cell isnt a bomb then just render updated cell.
                draw()
            }
        }
    }
    //update cell revealed_already status
    update_reveal_already();

    //check 2D array to see if all mines are found
    if (win_state != false) {
        check_for_win()
    }
}

function right_mouse_pressed() {
    //Right mouse click event
    //Loop through 
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let each_cell = grid[i][j]
            if (each_cell.mouse_inside(mouse.x, mouse.y) && !this.revealed_already) {
                //and if mouse was clicked in a cell, flag it.            
                each_cell.flag()
            }
        }
    }
}

function check_board_easy() {
    //Handle when the easy button is clicked.
    //Adjust canvas size
    canvas.height = 200;
    canvas.width = 200;
    //Stop and reset timer
    clock.stop_timer()
    clock.reset_time()
    //Restart with new canvas code
    set_up()
    draw()
    //Reset win_state
    win_state = null
    //update mode
    mode = 'easy';
    //Hide leader board
    document.getElementById('display_leader_board').style.display = 'none';
}

function check_board_medium() {
    //Handle when the medium button is clicked.
    //Adjust canvas size
    canvas.height = 400;
    canvas.width = 400;
    //Stop and reset timer
    clock.stop_timer()
    clock.reset_time()
    //Restart with new canvas code
    set_up()
    draw()
    //Reset win_state
    win_state = null;
    //update mode
    mode = 'medium';
    //Hide leader board
    document.getElementById('display_leader_board').style.display = 'none';
}

function check_board_hard() {
    //Handle when the hard button is clicked.
    //Adjust canvas size
    canvas.height = 800;
    canvas.width = 800;
    //Stop and reset timer
    set_up()
    draw()
    //Reset win_state
    win_state = null;
    //update mode
    mode = 'hard';
    //Hide leader board
    document.getElementById('display_leader_board').style.display = 'none';
}

function reset() {
    //Handle when the reset button is clicked
    c.clearRect(0, 0, canvas.width, canvas.height);
    //Clear canvas
    clock.stop_timer()
    clock.reset_time()
    //Reset timer 
    set_up()
    draw()
    //Reset game code
    win_state = null
    //Hide leader board
    document.getElementById('display_leader_board').style.display = 'none';
}

//The code here and below deals with the leaderboard. IE database stuff
//Database must be initialized in main file. prior to using this code

function update_leaderBoard(seconds, mode) {
    //This function controls anything related to database. //Make this into its own class in future.    

    //Declare variables
    let time = [];
    let name_for_database = prompt('You Win!!! Please Enter Your Name To Be Registered On The LeaderBoard :')

    //Check to ensure prompt was valid
    if (name_for_database == null) {
        name_for_database = 'Un-named bugger who pressed the cancel button';
    }

    let time_for_database = seconds;
    let database_root = firebase.database();


    database_root.ref('leaderboard/').once('value', function (snapshot) {
        //get database snapshot and read it
        read_snapshot(time, mode, snapshot)
    }).then(() => {
        //update the database
        send_new_data(time, time_for_database, name_for_database, mode, database_root)
    })
    //listen for changes to update.
    listen_for_update(database_root, mode);
}

function read_snapshot(time, mode, snapshot) {
    //Reads the current status of the database
    for (let i = 0; i < 5; i++) {
        //Store that data in array time.        
        time.push(snapshot.child(mode + '/' + (i + 1).toString() + '/time').val())
    }
}

function send_new_data(time, time_for_database, name_for_database, mode, database_root) {
    //Send updated data to database
    for (let i = 0; i < 5; i++) {
        //There are 5 positions in the database, this is why we must loop through each position     
        if (i == 4 && time[i] >= time_for_database) {
            //At last interation, no need to check for 6th position
            database_root.ref('leaderboard/' + mode + '/' + (i + 1).toString()).set({
                //write updated name and time if applicable
                name: name_for_database,
                time: time_for_database
            });
            // console.log('sent to database1')
        }
        else if (time[i] > time_for_database && time[i + 1] <= time_for_database) {
            //Check your time against database time. must be "fit" somewhere in database.
            // ie. if database is 13 and 15, only 14 on your side will allow for rewrite here.
            //If you scored higher than the data in the database, rewrite it
            database_root.ref('leaderboard/' + mode + '/' + (i + 1).toString()).set({
                name: name_for_database,
                time: time_for_database
            });
            // console.log('sent to database2')
        }
    }
}

function listen_for_update(database_root, mode) {
    //Lister for updates
    database_root.ref('leaderboard/').orderByValue().on('value', (snapshot) => {
        //if theres a change, this code is automatically executed
        //Create an ordered list object
        let new_list = document.createElement('ol')
        //loop through snapshot.
        for (let i = 4; i > -1; i--) {
            //Grab name value
            let name = snapshot.child(mode + '/' + (i + 1).toString() + '/name').val();
            //Grab time value      
            let value = snapshot.child(mode + '/' + (i + 1).toString() + '/time').val();
            //Create new list element object
            let li = document.createElement('li')
            //write text in new list element object
            li.innerHTML = name + ' has a time of ' + value + ' seconds';
            //append list object to ordered list object
            new_list.appendChild(li)
        }
        //Grab leader board node
        let leader_board_node = document.getElementById("leader_board");
        //Clear that current node
        while (leader_board_node.firstChild) {
            leader_board_node.removeChild(leader_board_node.firstChild)
        }
        //Append what we currently wrote
        leader_board_node.appendChild(new_list)
        document.getElementById('display_leader_board').style.display = 'inline';
    })
}

function set_up() {
    //This function sets up the game.
    //Grab global variables and initialize them
    cols = Math.floor(canvas.width / w)
    rows = Math.floor(canvas.height / w)
    grid = makeArray(cols, rows)

    //Create Cell objects at each grid location
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j] = new Cell(i, j, w)
        }
    }
    //initialize each Cell objects countneightbors method
    //which counts the number of bombs around each object.
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j].countNeighbors();
        }
    }
}

function draw() {
    //Initialize each cells show method.
    //which draws each cell on the canvas.
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            grid[i][j].show();
        }
    }
}

//First setup of the game.
set_up()
draw()