const BACKGROUND = "#000000";
const FOREGROUND = "#50FF50";
const CAMVIEW = "#FFFFFF";

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

let mouseLook = false;
const MOUSE_SENS = 0.002;

game.addEventListener("click", () => {
    game.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
    mouseLook = document.pointerLockElement === game;
});

document.addEventListener("mousemove", (e) => {
    if (mouseLook) {
        camera.rx += e.movementY * MOUSE_SENS;
        camera.ry += e.movementX * MOUSE_SENS;
    }

    // clamp the pitch to the max and min pitch
    camera.rx = Math.max(Math.min(camera.rx, MAX_PITCH), MIN_PITCH);
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

function line(p1, p2, color){
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = color || FOREGROUND;
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
    if (z > 0) return {
        x: x/z,
        y: y/z,
    }
    return {
        x: Infinity,
        y: Infinity,
    }
}

// camera functions
const MAX_PITCH = Math.PI / 2;
const MIN_PITCH = -MAX_PITCH;

let camera = {
    x: 0,
    y: 0,
    z: 0,
    rx: 0,
    ry: 0,
}

function moveCameraLocal(dx, dy, dz) {
    const cy = Math.cos(camera.ry);
    const sy = Math.sin(camera.ry);

    const right = { x: cy, y: 0, z: -sy };
    const forward = { x: sy, y: 0, z: cy };

    camera.x += right.x * dx + forward.x * dz;
    camera.y += dy;
    camera.z += right.z * dx + forward.z * dz;
}

function camera_translate({x, y, z}) {
    return {
        x: x - camera.x,
        y: y - camera.y,
        z: z - camera.z,
    }
}

function camera_rotate_x({x, y, z}, rx) {
    const c = Math.cos(rx);
    const s = Math.sin(rx);
    return {
        x: x,
        y: y*c - z*s,
        z: y*s + z*c,
    }
}

function camera_rotate_y({x, y, z}, ry) {
    const c = Math.cos(ry);
    const s = Math.sin(ry);
    return {
        x: x*c + z*s,
        y: y,
        z: -x*s + z*c,
    }
}

function camera_rotate({x, y, z}, rx, ry) {
    return camera_rotate_x(camera_rotate_y({x, y, z}, ry), rx);

}

// function to render in the camera's perspective
function camview({x, y, z}) {
    const t = camera_translate({x, y, z});
    const r = camera_rotate(t, -camera.rx, -camera.ry);

    return screen(project(r));
}

function draw_axis(unit = 1){
    return line(camview({x: -unit, y: 0, z: 0}), camview({x: unit, y: 0, z: 0}), "red"), 
           line(camview({x: 0, y: -unit, z: 0}), camview({x: 0, y: unit, z: 0}), "green"), 
           line(camview({x: 0, y: 0, z: -unit}), camview({x: 0, y: 0, z: unit}), "blue");
}


function draw_grid(){
    for (let i = -10; i < 10; i++) {
        line(camview({x: i, y: 0, z: -10}), camview({x: i, y: 0, z: 10}), "gray");
        line(camview({x: -10, y: 0, z: i}), camview({x: 10, y: 0, z: i}), "gray");
    }
}


// draw a cube
function draw_cube(p, s, color = FOREGROUND){
    const vs = [
        {x: p.x + (s/2), y: p.y + (s/2), z: p.z + (s/2)},
        {x: p.x - (s/2), y: p.y + (s/2), z: p.z + (s/2)},
        {x: p.x + (s/2), y: p.y - (s/2), z: p.z + (s/2)},
        {x: p.x - (s/2), y: p.y - (s/2), z: p.z + (s/2)},

        {x: p.x + (s/2), y: p.y + (s/2), z: p.z - (s/2)},
        {x: p.x - (s/2), y: p.y + (s/2), z: p.z - (s/2)},
        {x: p.x + (s/2), y: p.y - (s/2), z: p.z - (s/2)},
        {x: p.x - (s/2), y: p.y - (s/2), z: p.z - (s/2)},
    ]
    const fs = [
        [0, 1, 3, 2],
        [4, 5, 7, 6],
        [0, 4 ],
        [1, 5],
        [2, 6],
        [3, 7],
    ]

    for (const f of fs) {
        for (let i = 0; i < f.length; i++) {
            const a = vs[f[i]];
            const b = vs[f[(i + 1) % f.length]];
            line(camview(a), camview(b), color || FOREGROUND);
        }
    }
}

function draw_circle({h, k}, r, n, color = FOREGROUND){
    const vs = [];
    for (let i = 0; i < 360; i += 360/n) {
        const x = h + r * Math.cos(i * Math.PI / 180);
        const y = k + r * Math.sin(i * Math.PI / 180);
        vs.push({x, y, z: 0});
    }
    for (let i = 0; i < vs.length; i++) {
        line(camview(vs[i]), camview(vs[(i + 1) % vs.length]), color || FOREGROUND);
    }
}

function draw_sphere({h, k, l}, r, n, color = FOREGROUND){
    const vs = [];
    for (let i = 0; i < 360; i += 360/n) {
        for (let j = 0; j < 360; j += 360/n) {
            const x = h + r * Math.cos(i * Math.PI / 180) * Math.sin(j * Math.PI / 180);
            const y = k + r * Math.cos(j * Math.PI / 180);
            const z = l + r * Math.sin(i * Math.PI / 180) * Math.sin(j * Math.PI / 180);
            vs.push({x, y, z});
        }
    }
    for (let i = 0; i < vs.length; i++) {
        line(camview(vs[i]), camview(vs[(i + 1) % vs.length]), color || FOREGROUND );
    }
    for (let i = 0; i < vs.length; i++) {
        line(camview(vs[i]), camview(vs[(i + n) % vs.length]), color || FOREGROUND);
    }

}

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


let angle = 0;
let speed = 0.5;
let camspeed = 2;

function frame() {
    const dt = 1/FPS;
    
    clear();
    draw_axis();
    draw_grid();

    //Keyboard inputs
    let dx = 0, dy = 0, dz = 0;

    if (keys["a"]) dx -= speed * dt;      // strafe left
    if (keys["d"]) dx += speed * dt;      // strafe right
    if (keys["w"]) dz += speed * dt;      // forward
    if (keys["s"]) dz -= speed * dt;      // backward
    
    if (keys[" "]) dy += speed * dt;      // up
    if (keys["shift"]) dy -= speed * dt;  // down
    
    moveCameraLocal(dx, dy, dz);

    if (keys["arrowleft"]) camera.ry -= camspeed*dt;
    if (keys["arrowright"]) camera.ry += camspeed*dt;
    if (keys["arrowup"]) camera.rx -= camspeed*dt;
    if (keys["arrowdown"]) camera.rx += camspeed*dt;

    // clamp the pitch to the max and min pitch
    camera.rx = Math.max(Math.min(camera.rx, MAX_PITCH), MIN_PITCH);

    draw_cube({x: 0, y: 0, z: 1}, 0.5);
    draw_cube({x: 0, y: 0, z: -1}, 0.5);
    draw_cube({x: 1, y: 0, z: 0}, 0.5);
    draw_cube({x: -1, y: 0, z: 0}, 0.5);

    // draw_sphere({h: 0, k: 0, l: 0}, 1, 20);


    setTimeout(frame, 1000/FPS);
}

setTimeout(frame, 1000/FPS);