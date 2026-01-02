const BACKGROUND = "#000000";
const FOREGROUND = "#50FF50";

const game = document.getElementById("game");
game.width = 800;
game.height = 800;
const ctx = game.getContext("2d");

// Keyboard input handling
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

function clear(){
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, game.width, game.height);
}

// functions to draw objects

function point ({x, y}){
    ctx.fillStyle = FOREGROUND;
    const s = 10;

    ctx.fillRect(x - s/2, y - s/2, s, s);
}

function line(p1, p2){
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = FOREGROUND;
    ctx.stroke();
}

// function to normalize coordinate plane (0, 0) in the center of the screen
function screen(p) {
    // -1..1

    return {
        x: (p.x + 1) / 2 * game.width,
        y: (1 - (p.y + 1) / 2) * game.height,
    }
}

// function to project 3D coordinates to 2D coordinates
function project({x, y, z}) {
    if (z > 0) {
    return {
            x: x/z,
            y: y/z,
            z: z,
        }
    }
    // if the point is behind the camera, return infinity
    return {
        x: Infinity,
        y: Infinity,
        z: Infinity,
    }
}

// camera functions
let camera = {
    x: 0,
    y: 0,
    z: 0,
}

function camera_translate({x, y, z}) {
    return {
        x: x - camera.x,
        y: y - camera.y,
        z: z - camera.z,
    }
}

// vertices of the cube
const vs = [
    {x: 0.25, y: 0.25, z: 0.25},
    {x: -0.25, y: -0.25, z: 0.25},
    {x: 0.25, y: -0.25, z: 0.25},
    {x: -0.25, y: 0.25, z: 0.25},

    {x: 0.25, y: 0.25, z: -0.25},
    {x: -0.25, y: -0.25, z: -0.25},
    {x: 0.25, y: -0.25, z: -0.25},
    {x: -0.25, y: 0.25, z: -0.25},
];

// faces of the cube
const fs = [
    [0, 2, 1, 3],
    [4, 6, 5, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
]

// frames per second
const FPS = 60;

// function to translate the cube along the z-axis
function translate_z({x, y, z}, dz) {
    return {
        x: x,
        y: y,
        z: z + dz,
    }
}

function rotate_xz({x, y, z}, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x: x*c - z*s,
        y: y,
        z: x*s + z*c
    }
}

let dz = 1;
let angle = 0;
let speed = 0.5;

function frame() {
    const dt = 1/FPS;
    
    dz += 1*dt;
    angle += Math.PI*dt;

    clear();

    //Keyboard inputs
    if (keys["w"]) camera.y += speed*dt;
    if (keys["a"]) camera.x -= speed*dt;
    if (keys["s"]) camera.y -= speed*dt;
    if (keys["d"]) camera.x += speed*dt;
    if (keys["q"]) camera.z += speed*dt;
    if (keys["e"]) camera.z -= speed*dt;

    for (const v of vs) {
        //point(screen(project(translate_z(rotate_xz(v, angle), 1))));
    }
    for (const f of fs) {
        for (let i = 0; i < f.length; i++) {
            const a = vs[f[i]];
            const b = vs[f[(i + 1) % f.length]];

            line(
            screen(project(camera_translate(translate_z(rotate_xz(a, angle), 1)))),
            screen(project(camera_translate(translate_z(rotate_xz(b, angle), 1))))
            );
        }
    }
    setTimeout(frame, 1000/FPS);
}

setTimeout(frame, 1000/FPS);