const canvas = document.getElementById("canvus");
const c = canvas.getContext('2d')
canvas.width = 800
canvas.height = 800

console.log(canvas.getBoundingClientRect())

addEventListener('click', event => {
    console.log(event)
    // mouse.x = getMousePos(canvas, event).x
    // mouse.y = getMousePos(canvas, event).y
})