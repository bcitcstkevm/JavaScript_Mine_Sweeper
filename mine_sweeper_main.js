
arr_of_buttons = []
let board = document.createElement('div');
board.class = 'board'

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function create_board(row, column) {
    for (let i = 0; i < row; i++) {
        let r = []
        
        row_div = document.createElement('div')

        for (j = 0; j < column; j++) {
            let btn = document.createElement('button');
            let t = document.createTextNode('1');
            console.log('was');
            btn.appendChild(t);
            r.push(btn)
        }
        r.push(document.createElement('br'));
        arr_of_buttons.push(r);
        r = [];
    }
}

create_board(10, 10)
console.log(arr_of_buttons)

for (let i = 0; i < arr_of_buttons.length; i++) {
    for (j = 0; j < arr_of_buttons[i].length; j++) {
        board.appendChild(arr_of_buttons[i][j])
    }
}

document.body.appendChild(board)