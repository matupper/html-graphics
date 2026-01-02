const BACKGROUND = "#000000";
const FOREGROUND = "#50FF50";

console.log(game);
game.width = 800;
game.height = 800;
const ctx = game.getContext("2d");
console.log(ctx);

function clear(){
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, game.width, game.height);
}

function point (x, y){
    ctx.fillStyle = FOREGROUND;
    const s = 10;
    
    ctx.fillRect(x, y, s, s);
}

clear();
point(100, 100);