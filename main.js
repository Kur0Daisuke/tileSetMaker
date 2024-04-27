const canvas = document.querySelector('.editor');
const ctx = canvas.getContext('2d');

const tileCanvas = document.querySelector(".tiles")
const tilectx = tileCanvas.getContext('2d')

const tileInput = document.getElementById("tileSelect")

let cursorToOutline = {x:0,y:0}
const tilesize = 32;
var step = tilesize; // tile size

// TILE IMAGE
let tile = null;
let tileW = 32;
let tileH = 32;

// Mouse event handling:
let start;
let mousePos = {x: 0, y: 0}
var canMove = false;
var painting = true;
var erase = false;
var select = false;

let currentScreen = canvas;
let translation = {x: 0, y: 0};
let dragPainting = false;

var placedTiles = []

let currentTile = { x: 0, y: 0 }

let debugMessage = "Enter The Canvas."


let canvasScreen = document.querySelector(".canvasScreen")

function fillGrid(ctx, canvas) {
    let left = 0.5 - Math.ceil(canvas.width / step) * step * 10;
    let top = 0.5 - Math.ceil(canvas.height / step) * step * 10;
    let right = 5*canvas.width;
    let bottom = 5*canvas.height;
    ctx.strokeStyle = "#dedede";
    ctx.clearRect(left, top, right - left, bottom - top);
    ctx.beginPath();
    for (let x = left; x < right; x += step) {
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
    }
    for (let y = top; y < bottom; y += step) {
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
    }
    
    ctx.stroke();

    // 0, 0 point visualized
    ctx.strokeStyle = "blue"
    ctx.beginPath();
    ctx.moveTo(0, top)
    ctx.lineTo(0,bottom)
    ctx.stroke()

    ctx.font = "20px sans"
    ctx.fillText("(0,0)", 
        0, 0)

    ctx.strokeStyle = "red"
    ctx.beginPath();
    ctx.moveTo(left, 0)
    ctx.lineTo(right, 0)
    ctx.stroke()
}

function draw() {
    translation = (currentScreen.classList.contains("editor") ? ctx.getTransform() : tilectx.getTransform()).transformPoint(new DOMPoint(1, 1))
    let canvasTranslation = (ctx.getTransform()).transformPoint(new DOMPoint(1, 1))

    //Tiles
    if(tile !== null) {
        fillGrid(tilectx, tileCanvas)
        for (let x = 0; x < tile.width/step; x++) {
            for (let y = 0; y < tile.height/step; y++) {
                tilectx.drawImage(tile, 32*x, 32*y, 32, 32, step*x, step*y, step, step)
            }
        }
    }
    
    fillGrid(ctx, canvas)

    for (let i = 0; i < placedTiles.length; i++) {
        let data = placedTiles[i]
        ctx.drawImage(tile, 
            data.tile.x*32, data.tile.y*32, 
            32, 32, 
            Math.floor(data.pos.x/step)*step, Math.floor(data.pos.y/step)*step, 
            step, step)
    }
    // debug info
    ctx.font = "15px sans"
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    tilectx.fillStyle = "rgba(0, 0, 0, 0.4)";

    if(!select) {
        currentScreen.classList.contains("editor") ? 
        ctx.fillRect(cursorToOutline.x, cursorToOutline.y, step, step) : 
        tile !== null && tilectx.fillRect(cursorToOutline.x, cursorToOutline.y, step, step);
    }
    

    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillText(debugMessage, 
    (canvas.width-(debugMessage.length*9))-canvasTranslation.x, 50-canvasTranslation.y)

    requestAnimationFrame(draw)
}


const getPos = (e, canvas) => ({
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop 
});

const reset = () => start = null;

const cursorSelector = () => {
    let x = Math.floor((mousePos.x)/step)*step;
    let y = Math.floor((mousePos.y)/step)*step;
    
    cursorToOutline.x = x;
    cursorToOutline.y = y;
}

function mousedown(e, canvas) {
    if(e.button == 1) canMove = true
    reset();
    start = getPos(e, canvas)
}

function mouseup(e) {
    if(e.button == 1) canMove = false;
    reset()
}

function PlaceTiles() {
    if(select || tile == null || !painting) return
    for (let i = 0; i < placedTiles.length; i++) {
        if(Math.floor(placedTiles[i].pos.x/step)*step == Math.floor(mousePos.x/step)*step && 
            Math.floor(placedTiles[i].pos.y/step)*step == Math.floor(mousePos.y/step)*step) {
            if(!erase)placedTiles[i] = {tile: {...currentTile}, pos: {...mousePos}}
            else {
                if(i > -1) {
                    placedTiles.splice(i, 1)
                }
            }
            return
        }
    }
    if(!erase)placedTiles.push({tile: {...currentTile}, pos: {...mousePos}})
}

canvas.addEventListener("mousedown", e => {
    mousedown(e, canvas)
    if(e.buttons == 1) {
        if(select) {
            let mouseX = Math.floor(mousePos.x/step)*step;
            let mouseY = Math.floor(mousePos.y/step)*step;
            
            for (let i = 0; i < placedTiles.length; i++) {
                let posX = Math.floor(placedTiles[i].pos.x/step)*step;
                let posY = Math.floor(placedTiles[i].pos.y/step)*step;

                if(posX == mouseX && posY == mouseY) {
                    document.querySelector(".tab").show("inspect")
                    document.getElementById("x").value = posX;
                    document.getElementById("y").value = posY;
                    let tempcanvas = document.createElement('canvas');
                    tempcanvas.width = 32;
                    tempcanvas.height = 32;
                    tempcanvas.getContext('2d').drawImage(tile, 
                        placedTiles[i].tile.x*32, placedTiles[i].tile.y*32, 
                        32, 32, 
                        0, 0, 
                        step, step);
                    result = tempcanvas.toDataURL("image/jpeg")
                    document.getElementById("tileImage").src = result
                    break;
                }
            }
        }else {
            PlaceTiles()
            dragPainting = true;
        }
    }
});

canvas.addEventListener("mouseup", e => {
    mouseup(e)
    dragPainting = false;
});
canvas.addEventListener("mouseleave", reset);

// tile canvas
tileCanvas.addEventListener("mousedown", e => {
    mousedown(e, tileCanvas)
    if(tile !== null && painting) {
        currentTile.x = Math.floor(mousePos.x/step)
        currentTile.y = Math.floor(mousePos.y/step)
    }
});

tileCanvas.addEventListener("mouseup", e => mouseup(e));
tileCanvas.addEventListener("mouseleave", reset);

function moveScreen(e, ctx, canvas) {
    let pos = getPos(e, canvas);
    cursorSelector()
    if(canMove && start) document.body.style.cursor = "grabbing"
    else if(canMove) document.body.style.cursor = "grab"
    else if(erase) document.body.style.cursor = "pointer"
    else document.body.style.cursor = "default"

    if (!start || !canMove) return;
    
    ctx.translate(pos.x - start.x, pos.y - start.y);
    start = pos;
}

window.addEventListener("mousemove", e => {
    if(e.target.classList.contains("editor") || e.target.classList.contains("tiles")) {
        currentScreen = e.target;
    }else debugMessage = `outside of canvas`
    let pos = getPos(e, currentScreen);

    mousePos.x = pos.x - translation.x
    mousePos.y = pos.y - translation.y
    
})

canvas.addEventListener("mousemove", e => {
    if(dragPainting) {
        PlaceTiles()
    }
    moveScreen(e, ctx, canvas)
    debugMessage = `x: ${mousePos.x}, y: ${mousePos.y} tileX: ${Math.floor(mousePos.x/step)}, tileY: ${Math.floor(mousePos.y/step)}`
});

tileCanvas.addEventListener("mousemove", e => {
    moveScreen(e,tilectx, tileCanvas)
    debugMessage = `selecting tile`
})


function changeMode(move, paint, Iserase, IsSelecting) {
    canMove = move;
    painting = paint;
    erase = Iserase;
    select = IsSelecting;
}

// MENU HANDLER
function SetTool(tool) {
    switch(tool) {
        case "move":
            changeMode(true, false, false, false)
            break;
        case "paint":
            changeMode(false, true, false, false)
            break;
        case "eraser":
            changeMode(false, true, true, false)
            break;
        case "select":
            changeMode(false, false, false, true)
            break;
    }
}

document.addEventListener("keydown", e => {
    switch(e.key) {
        case "p":
            changeMode(false, true, false, false)
            break;
        case "e":
            changeMode(false, true, true, false)
            break;
        case " ":
            changeMode(true, false, false, false)
            break;
        case "select":
            changeMode(false, false, false, true)
            break;
    }
})

document.addEventListener("keyup", e => {
    switch(e.key) {
        case " ":
            changeMode(false, true, false)
            break;
    }
})

function resizeHandler(e) {
    if(canvasScreen.clientWidth == 0 || canvasScreen.clientHeight == 0) {
        canvas.width = window.innerWidth-200;
        canvas.height = window.innerHeight;
    }else {
        canvas.width = canvasScreen.clientWidth;
    canvas.height = canvasScreen.clientHeight;
    }
    
    cursorSelector(e)
}

document.querySelector(".editorScreen").addEventListener("sl-reposition", (e) => resizeHandler(e))

window.onresize = (e) => resizeHandler(e)

draw(); // on page load

document.getElementById("tileW").addEventListener("sl-change", () => {
    tileW = document.getElementById("tileW").value
})

document.getElementById("tileH").addEventListener("sl-change", () => {
    tileH = document.getElementById("tileH").value
})

tileInput.addEventListener("change", () => {
    tile = new Image()
    tile.src = URL.createObjectURL(tileInput.files[0])
})