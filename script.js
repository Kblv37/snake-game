const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");
const finalScore = document.getElementById("finalScore");

const CELL = 25;
const COUNT = canvas.width / CELL;

const settings = {
    speed: 100,
    walls: true,
    foodCount: 1,
    timedFood: false
};

const speedSelect =
    document.getElementById("speed");

const wallsSelect =
    document.getElementById("walls");

const foodCountSelect =
    document.getElementById("foodCount");

const timedFoodCheckbox =
    document.getElementById("timedFood");

console.log(speedSelect);
console.log(wallsSelect);
console.log(foodCountSelect);
console.log(timedFoodCheckbox);

speedSelect.addEventListener(
    "change",
    () => {

        if (started || paused) {
            speedSelect.value =
                settings.speed;

            return;
        }

        settings.speed =
            Number(speedSelect.value);

        startLoop();
    }
);

wallsSelect.addEventListener(
    "change",
    () => {

        if (started || paused) {
            wallsSelect.value =
                settings.walls
                    ? "on"
                    : "off";

            return;
        }

        settings.walls =
            wallsSelect.value === "on";
    }
);

foodCountSelect.addEventListener(
    "change",
    () => {

        if (started || paused) {
            foodCountSelect.value =
                settings.foodCount;

            return;
        }

        settings.foodCount =
            Number(
                foodCountSelect.value
            );
    }
);

timedFoodCheckbox.addEventListener(
    "change",
    () => {

        if (started || paused) {
            timedFoodCheckbox.checked =
                settings.timedFood;

            return;
        }

        settings.timedFood =
            timedFoodCheckbox.checked;
    }
);

let snake;
let foods = [];

let bonusFood = null;

let nextBonusSpawn =
    Date.now() + 20000;

let dx;
let dy;
let score;
let paused;
let gameOverState;

let started = false;

bestEl.textContent =
    localStorage.getItem("snake_best") || 0;

function randomFood() {

    let pos;

    do {

        pos = {
            x: Math.floor(Math.random() * COUNT),
            y: Math.floor(Math.random() * COUNT)
        };

    } while (

        snake.some(
            s =>
                s.x === pos.x &&
                s.y === pos.y
        )

        ||

        foods.some(f => {

            const distance =
                Math.abs(f.x - pos.x) +
                Math.abs(f.y - pos.y);

            return distance < 5;

        })

    );

    return pos;
}


function spawnBonusFood() {

    bonusFood = {
        x: Math.floor(Math.random() * COUNT),
        y: Math.floor(Math.random() * COUNT),
        expires: Date.now() + 4000
    };

}


function start() {

    snake = [
        { x: 12, y: 12 },
        { x: 11, y: 12 },
        { x: 10, y: 12 }
    ];

    dx = 1;
    dy = 0;

    score = 0;
    paused = false;
    gameOverState = false;

    started = false;

    foods = [];

    bonusFood = null;

    for (let i = 0; i < settings.foodCount; i++) {
        foods.push(randomFood());
    }

    scoreEl.textContent = 0;
    overlay.style.display = "none";
}

function drawGrid() {

    ctx.strokeStyle = "#111";

    for (let i = 0; i <= COUNT; i++) {

        ctx.beginPath();
        ctx.moveTo(i * CELL, 0);
        ctx.lineTo(i * CELL, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL);
        ctx.lineTo(canvas.width, i * CELL);
        ctx.stroke();
    }
}

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawGrid();

    foods.forEach(food => {

        ctx.fillStyle = "#ff3b30";

        ctx.beginPath();

        ctx.arc(
            food.x * CELL + CELL / 2,
            food.y * CELL + CELL / 2,
            CELL / 2.5,
            0,
            Math.PI * 2
        );

        ctx.fill();

    });

    if (
        bonusFood &&
        Math.floor(Date.now() / 250) % 2
    ) {

        ctx.fillStyle = "#ffd700";

        ctx.beginPath();

        ctx.arc(
            bonusFood.x * CELL + CELL / 2,
            bonusFood.y * CELL + CELL / 2,
            CELL / 2.2,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    snake.forEach((part, index) => {

        ctx.fillStyle =
            index === 0
                ? "#00ff88"
                : "#00bb66";

        ctx.fillRect(
            part.x * CELL + 1,
            part.y * CELL + 1,
            CELL - 2,
            CELL - 2
        );
    });
}

function update() {

    if (paused || gameOverState) return;

    started = true;

    if(
        settings.timedFood &&
        !bonusFood &&
        Date.now() >= nextBonusSpawn
    ){

        spawnBonusFood();

        nextBonusSpawn =
            Date.now() + 20000;

    }

    if (
        bonusFood &&
        Date.now() > bonusFood.expires
    ) {
        bonusFood = null;
    }

    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };

    if (settings.walls) {

        if (
            head.x < 0 ||
            head.y < 0 ||
            head.x >= COUNT ||
            head.y >= COUNT
        ) {
            return gameOver();
        }

    } else {

        if (head.x < 0) {
            head.x = COUNT - 1;
        }

        if (head.x >= COUNT) {
            head.x = 0;
        }

        if (head.y < 0) {
            head.y = COUNT - 1;
        }

        if (head.y >= COUNT) {
            head.y = 0;
        }

    }

    const foodIndex = foods.findIndex(
        food =>
            food.x === head.x &&
            food.y === head.y
    );

    const eating =
        foodIndex !== -1;

    if (!eating) {
        snake.pop();
    }

    if (
        snake.some(
            p => p.x === head.x &&
                p.y === head.y
        )
    ) {
        return gameOver();
    }

    snake.unshift(head);

    if (eating) {

        score++;

        scoreEl.textContent = score;

        let best =
            Number(
                localStorage.getItem(
                    "snake_best"
                )
            ) || 0;

        if (score > best) {

            best = score;

            localStorage.setItem(
                "snake_best",
                best
            );

            bestEl.textContent = best;
        }

        foods[foodIndex] = randomFood();
    }

    draw();
}

function gameOver() {

    gameOverState = true;
    started = false;

    finalScore.textContent =
        "Ваш счёт: " + score;

    overlay.style.display = "flex";
}

document.addEventListener(
    "keydown",
    e => {

        if (e.key === "ArrowUp" && dy !== 1) {
            dx = 0;
            dy = -1;
        }

        if (e.key === "ArrowDown" && dy !== -1) {
            dx = 0;
            dy = 1;
        }

        if (e.key === "ArrowLeft" && dx !== 1) {
            dx = -1;
            dy = 0;
        }

        if (e.key === "ArrowRight" && dx !== -1) {
            dx = 1;
            dy = 0;
        }

        if (
            e.key.toLowerCase() === "p"
        ) {
            paused = !paused;
        }

        if (
            e.key.toLowerCase() === "r"
        ) {
            start();
        }
    }
);

document
.getElementById("up")
.addEventListener("click",()=>{

    if(dy!==1){
        dx=0;
        dy=-1;
    }

});

document
.getElementById("down")
.addEventListener("click",()=>{

    if(dy!==-1){
        dx=0;
        dy=1;
    }

});

document
.getElementById("left")
.addEventListener("click",()=>{

    if(dx!==1){
        dx=-1;
        dy=0;
    }

});

document
.getElementById("right")
.addEventListener("click",()=>{

    if(dx!==-1){
        dx=1;
        dy=0;
    }

});

start();
draw();

let gameLoop;

function startLoop() {
    clearInterval(gameLoop);
    gameLoop = setInterval(
        update,
        settings.speed
    );
}

startLoop();
