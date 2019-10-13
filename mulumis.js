"use strict";
/* jshint esversion: 6 */
/* jshint -W097 */

// animation on?
let animate = true;
// zoom factor
let zoom = 2000.0;
// angle step
let angle = 0.001;
// movement step
let step = 0.001;
// star brightness
let brightness = 255;
// star alpha
let alpha = 0.9;
// clear screen?
let clear = true;
// star number
let star_number = 2000;
// star field
let stars = [];

// noinspection JSLint
let zero = {
    x: 0.0,
    y: 0.0,
    z: 0.0,
};

let viewpoint_movement = {
    zoom: 0.0,
    mouse: false,
    mouseX: 0,
    mouseY: 0,
    turnX: 0.0,
    turnY: 0.0,
    turnZ: 0.0,
    turnToZero: false,
    thrust: 3.0,
};

let animation = null;

let canvas = document.getElementById("mulumis");
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

let context = canvas.getContext("2d");

if (!clear) {
    context.save();
    context.fillStyle = "#111";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
}

function updateZoom(value) {
    let z = parseFloat((value));
    if (z > 0) {
        zoom = z;
    }
}

function updateAlpha(value) {
    let z = parseFloat((value));
    if (z > 0) {
        alpha = z;
    }
}

function updateStars(value) {
    let z = parseInt((value));
    if (z > 0) {
        star_number = z;
        initializeStarField();
    }
}

function changeAnimation() {
    animate = !animate;
    let b = document.getElementById("starter");
    let help = document.getElementById('help');
    if (animate) {
        b.innerText = 'Stop Animation';
        help.hidden = true;
        draw();
    } else {
        b.innerText = 'Start Animation';
        help.hidden = false;
        stop();
    }
}

function changeClear() {
    clear = !clear;
}

function turnToZero() {
    viewpoint_movement.turnToZero = true;
}

function left() {
    viewpoint_movement.turnX = -1;
    viewpoint_movement.turnZ = 0;
}

function right() {
    viewpoint_movement.turnX = 1;
    viewpoint_movement.turnZ = 0;
}

function turnLeft() {
    viewpoint_movement.turnX = 0;
    viewpoint_movement.turnZ += -1;
}

function turnRight() {
    viewpoint_movement.turnX = 0;
    viewpoint_movement.turnZ += 1;
}

function up() {
    viewpoint_movement.turnY = -1;
}

function down() {
    viewpoint_movement.turnY = 1;
}

function stopMovement() {
    viewpoint_movement.turnX = 0;
    viewpoint_movement.turnY = 0;
    viewpoint_movement.turnZ = 0;
    viewpoint_movement.thrust = 0;
}

// start animation
function draw() {

    // for auto resizing, sse  https://stackoverflow.com/questions/1664785/resize-html5-canvas-to-fit-window
    // canvas.width  = window.innerWidth;
    // canvas.height = window.innerHeight;

    // Clear entire screen
    if (clear) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawStars();
    move_viewpoint();

    animation = requestAnimationFrame(draw);
}

// stop animation
function stop() {
    cancelAnimationFrame(animation);
}



// Runs each time the DOM window resize event fires.
// Resets the canvas dimensions to match window,
// then draws the new borders accordingly.
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width  != displayWidth ||
        canvas.height != displayHeight) {

        // Make the canvas the same size
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }

    // draw();
}

window.addEventListener('resize', resizeCanvas, false);


document.addEventListener('keypress', event => {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }
    const key = event.key;
    const code = event.code;

    switch(key)
    {
        case 'c':
        case 'C':
            changeClear();
            break;
        case 'Z':
        case 'z':
            turnToZero();
            break;
        case 'S':
        case 's':
            stopMovement();
            break;
        case "Escape":
        case "Esc":        // IE/Edge specific value
            // Do something for "esc" key press.
            // alert("escape")
            changeAnimation();
            break;
        default:
            return; // Quit when this doesn't handle the key event.
    }
    event.preventDefault();
});

document.addEventListener('keydown', event => {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }
    const key = event.key;
    const code = event.code;
    switch(key)
    {
        case ' ':
            if (event.shiftKey) {
                viewpoint_movement.thrust += -1;
            } else {
                viewpoint_movement.thrust += 1;
            }
            break;
        case 'ArrowLeft':
        case "Left":       // IE/Edge specific value
            if (event.shiftKey) {
                turnLeft();
            } else {
                left();
            }
            break;
        case 'ArrowRight':
        case "Right":      // IE/Edge specific value
            if (event.shiftKey) {
                turnRight();
            } else {
                right();
            }
            break;
        case 'ArrowUp':
        case "Up":         // IE/Edge specific value
            up();
            break;
        case 'ArrowDown':
        case "Down":       // IE/Edge specific value
            down();
            break;
        case '+':
            zoom *= 1.01;
            break;
        case '-':
            zoom /= 1.01;
            break;
        default:
            return; // Quit when this doesn't handle the key event.
    }
    event.preventDefault();
});

document.addEventListener('keyup', event => {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }
    const key = event.key;
    const code = event.code;
    switch(key)
    {
        case 'ArrowLeft':
        case "Left":       // IE/Edge specific value
            if (!event.shiftKey) {
                viewpoint_movement.turnX = 0;
                viewpoint_movement.turnZ = 0;
            }
            break;
        case 'ArrowRight':
        case "Right":      // IE/Edge specific value
            if (!event.shiftKey) {
                viewpoint_movement.turnX = 0;
                viewpoint_movement.turnZ = 0;
            }
            break;
        case 'ArrowUp':
        case "Up":         // IE/Edge specific value
            viewpoint_movement.turnY = 0;
            break;
        case 'ArrowDown':
        case "Down":       // IE/Edge specific value
            viewpoint_movement.turnY = 0;
            break;
        default:
            return; // Quit when this doesn't handle the key event.
    }
    event.preventDefault();
});

canvas.addEventListener("mousedown", event => {
    viewpoint_movement.mouse = true;
    let w = canvas.width / 2;
    let h = canvas.height / 2;
    viewpoint_movement.mouseX = 4 * (event.pageX - w) / w;
    viewpoint_movement.mouseY = 4 * (h - event.pageY) / h;
    // log("mousedown " +  viewpoint_movement.mouseX + ", " + viewpoint_movement.mouseY + "");
    event.preventDefault();
});

canvas.addEventListener("mousemove", event => {
    // viewpoint_movement.mouse = true;
    let w = canvas.width / 2;
    let h = canvas.height / 2;
    viewpoint_movement.mouseX = 4 * (event.pageX - w) / w;
    viewpoint_movement.mouseY = 4 * (h - event.pageY) / h;
    // log("mousemove " +  viewpoint_movement.mouseX + ", " + viewpoint_movement.mouseY + "");
    event.preventDefault();
});

canvas.addEventListener("mouseup", event => {
    viewpoint_movement.mouse = false;
    // log("mouseup " +  (event.pageX - 4) + " px, " + (event.pageY - 4) + "px");
    event.preventDefault();
});

function log(text) {
    let dot = document.createElement("div");
    dot.innerText = text;
    let menu = document.getElementById("console");
    menu.appendChild(dot);
}

// (a - b) x c
function minusScalar(a, b, c) {
    return (a.x - b.x) * c.x + (a.y - b.y) * c.y + (a.z - b.z) * c.z;
}

// initialize star field
function initializeStarField() {
    stars = [];
    for (let i = 0; i < star_number; i++) {
        stars[i] = {
            x: Math.random() - 0.5,
            y: Math.random() - 0.5,
            z: Math.random() - 0.5,
            vx: 0.0,
            vy: 0.0,
            vz: 0.0,
            radius: 0.001,
            mass: 1,
        };
    }
}

// we are here and look this way
let viewpoint = {
    position: {
        x: 0.0,
        y: 0.0,
        z: 5.0,
    },
    xa: {
        x: 1.0,
        y: 0.0,
        z: 0.0,
    },
    ya: {
        x: 0.0,
        y: 1.0,
        z: 0.0,
    },
    za: {
        x: 0.0,
        y: 0.0,
        z: -1.0,
    },
};

// turn TODO
function rotate(ztheta, a, b) {
    // rotate around z axis
    let ct = Math.cos(ztheta);
    let st = Math.sin(ztheta);

    let n = {
        x: a.x * ct + b.x * st,
        y: a.y * ct + b.y * st,
        z: a.z * ct + b.z * st,
    };
    b.x = b.x * ct  - a.x * st;
    b.y = b.y * ct  - a.y * st;
    b.z = b.z * ct  - a.z * st;
    a.x = n.x;
    a.y = n.y;
    a.z = n.z;
}


function length(point) {
    return Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
}

// if normalization fails, we take def as fallback
function normalize(point, def) {
    let len = length(point);
    if (len <= 1000 * Number.MIN_VALUE) {
        point.x = def[0];
        point.y = def[1];
        point.z = def[2];
    } else {
        point.x /= len;
        point.y /= len;
        point.z /= len;
    }
}

function pointToZero(zero, viewpoint) {
    // step 1: point z axis towards zero:
    viewpoint.za.x = zero.x - viewpoint.position.x;
    viewpoint.za.y = zero.y - viewpoint.position.y;
    viewpoint.za.z = zero.z - viewpoint.position.z;
    normalize(viewpoint.za, [0, 0, 1]);
    // step 2: point x axis orthogonal to z and y:
    viewpoint.xa.x = viewpoint.ya.y * viewpoint.za.z - viewpoint.ya.z * viewpoint.za.y;
    viewpoint.xa.y = viewpoint.ya.z * viewpoint.za.x - viewpoint.ya.x * viewpoint.za.z;
    viewpoint.xa.z = viewpoint.ya.x * viewpoint.za.y - viewpoint.ya.y * viewpoint.za.x;
    normalize(viewpoint.xa, [1, 0, 0]);
    // step 3: point y axis orthogonal to z and x
    viewpoint.ya.x = viewpoint.za.y * viewpoint.xa.z - viewpoint.za.z * viewpoint.xa.y;
    viewpoint.ya.y = viewpoint.za.z * viewpoint.xa.x - viewpoint.za.x * viewpoint.xa.z;
    viewpoint.ya.z = viewpoint.za.x * viewpoint.xa.y - viewpoint.za.y * viewpoint.xa.x;
    normalize(viewpoint.ya, [0, 1, 0]);
}

function move_viewpoint() {
    if (viewpoint_movement.mouse)
    {
        rotate(-viewpoint_movement.mouseX * angle, viewpoint.xa, viewpoint.za);
        rotate(viewpoint_movement.mouseY * angle, viewpoint.ya, viewpoint.za);
    }
    if (viewpoint_movement.turnX !== 0)
    {
        rotate(-viewpoint_movement.turnX * angle, viewpoint.xa, viewpoint.za);
    }
    if (viewpoint_movement.turnY !== 0)
    {
        rotate(viewpoint_movement.turnY * angle, viewpoint.ya, viewpoint.za);
    }
    if (viewpoint_movement.turnZ !== 0)
    {
        rotate(-viewpoint_movement.turnZ * angle, viewpoint.xa, viewpoint.ya);
    }
    if (viewpoint_movement.thrust !== 0)
    {
        viewpoint.position.x += viewpoint_movement.thrust * step * viewpoint.za.x;
        viewpoint.position.y += viewpoint_movement.thrust * step * viewpoint.za.y;
        viewpoint.position.z += viewpoint_movement.thrust * step * viewpoint.za.z;
    }
    if (viewpoint_movement.turnToZero) {
        pointToZero(zero, viewpoint);
        viewpoint_movement.turnToZero = false;
    }
}

function drawStars() {
    context.save();
    if (clear) {
       context.fillStyle = "#111";
       context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.fillStyle = "rgba(255,255,255,1)";
    context.font = "16px Courier";
    context.fillText("Zoom:     " + zoom, 8, canvas.height - 20);
    context.fillText("Distance: " + length(viewpoint.position), 8, canvas.height - 40);
    context.fillStyle = "rgba(" + brightness + "," + brightness + "," + brightness + "," + alpha + ")";
    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        context.beginPath();
        let d = minusScalar(star, viewpoint.position, viewpoint.za);

        if (d <= 0)
        {
            continue;
        }
        let xr = zoom * minusScalar(star, viewpoint.position, viewpoint.xa) / d + canvas.width / 2;
        if (xr < 0 || xr >= canvas.width)
        {
            continue;
        }
        let yr = zoom * minusScalar(star, viewpoint.position, viewpoint.ya) / d + canvas.height / 2;
        if (yr < 0 || yr >= canvas.height)
        {
            continue;
        }

        let radius = zoom * star.radius / d;
        context.arc(xr, yr, radius , 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    }
    context.restore();
}


context.fillRect(0, 0, canvas.width, canvas.height);

initializeStarField();
draw();