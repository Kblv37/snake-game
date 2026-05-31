const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");

const size = 25;
const cells = canvas.width / size;

let snake;
let food;
let dx;
let dy;
let score;
let gameLoop;

bestEl.textContent =
localStorage.getItem("snakeBest") || 0;

function startGame() {

  snake = [
    {x: 10, y: 10}
  ];

  food = spawnFood();

  dx = 1;
  dy = 0;

  score = 0;
  scoreEl.textContent = score;

  clearInterval(gameLoop);
  gameLoop = setInterval(update, 120);

  document
    .getElementById("gameOver")
    .classList.add("hidden");
}

function spawnFood() {
  return {
    x: Math.floor(Math.random() * cells),
    y: Math.floor(Math.random() * cells)
  };
}

document.addEventListener("keydown", e => {

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

});

function update() {

  let head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= cells ||
    head.y >= cells
  ) {
    return gameOver();
  }

  for (let part of snake) {
    if (
      head.x === part.x &&
      head.y === part.y
    ) {
      return gameOver();
    }
  }

  snake.unshift(head);

  if (
    head.x === food.x &&
    head.y === food.y
  ) {

    score++;
    scoreEl.textContent = score;

    let best =
      Number(localStorage.getItem("snakeBest")) || 0;

    if (score > best) {
      localStorage.setItem(
        "snakeBest",
        score
      );

      bestEl.textContent = score;
    }

    food = spawnFood();

  } else {
    snake.pop();
  }

  draw();
}

function draw() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle = "red";

  ctx.fillRect(
    food.x * size,
    food.y * size,
    size,
    size
  );

  snake.forEach((part, index) => {

    ctx.fillStyle =
      index === 0
        ? "#00ff88"
        : "#00aa55";

    ctx.fillRect(
      part.x * size,
      part.y * size,
      size - 2,
      size - 2
    );

  });

}

function gameOver() {
  clearInterval(gameLoop);

  document
    .getElementById("gameOver")
    .classList.remove("hidden");
}

function restart() {
  startGame();
}

startGame();
