
arr_of_buttons = []
let board = document.createElement('div');
board.class = 'board'

function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function create_board() {
    for (let i = 1; i < 101; i++) {
        let btn_div = document.createElement('div');
        let btn = document.createElement('button');        
        let t = document.createTextNode('1');
        btn.appendChild(t)
        btn_div.appendChild(btn);

        arr_of_buttons.push(btn_div)

        if (i % 10 == 0){
            arr_of_buttons.push(document.createElement('br'))
        }

        // for (j = 0; j < column; j++) {
        //     let btn = document.createElement('button');
        //     let t = document.createTextNode('1');
        //     console.log('was');
        //     btn.appendChild(t);
        //     row_div.appendChild(btn)
        //     r.push(btn)

        // }

        // r.push(document.createElement('br'));
        // arr_of_buttons.push(r);
        // r = [];
    }
}

function lay_bombs(){
    for (let i = 0; i < arr_of_buttons; i++){
        if (True){
            arr_of_buttons[i].className = 'bomb'
        }
    }
}

create_board()
lay_bombs()
console.log(arr_of_buttons)

for (let i = 0; i < arr_of_buttons.length; i++) {
    board.appendChild(arr_of_buttons[i])
}

document.body.appendChild(board)