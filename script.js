const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;
const canvasSize = 400;

let snake = [
  { x: 200, y: 200 }
];

let food = randomFood();

let dx = box;
let dy = 0;

let score = 0;

document.addEventListener("keydown", changeDirection);

function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box
  };
}

function changeDirection(event) {
  if (event.key === "ArrowUp" && dy === 0) {
    dx = 0;
    dy = -box;
  }

  if (event.key === "ArrowDown" && dy === 0) {
    dx = 0;
    dy = box;
  }

  if (event.key === "ArrowLeft" && dx === 0) {
    dx = -box;
    dy = 0;
  }

  if (event.key === "ArrowRight" && dx === 0) {
    dx = box;
    dy = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // еда
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // змейка
  ctx.fillStyle = "lime";

  snake.forEach(segment => {
    ctx.fillRect(segment.x, segment.y, box, box);
  });

  let head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  // съели еду
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").textContent = score;
    food = randomFood();
  } else {
    snake.pop();
  }

  // выход за границы
  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= canvasSize ||
    head.y >= canvasSize
  ) {
    alert(`Игра окончена! Счёт: ${score}`);
    location.reload();
    return;
  }

  // столкновение с собой
  for (let part of snake) {
    if (head.x === part.x && head.y === part.y) {
      alert(`Игра окончена! Счёт: ${score}`);
      location.reload();
      return;
    }
  }

  snake.unshift(head);
}

setInterval(draw, 120);
