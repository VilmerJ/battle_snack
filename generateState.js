import { copyState } from "./helpers.js";

export const generateNewState = (state, snakeId, move, turn) => {
  // Create a deep copy of the board
  const newState = copyState(state);
  const ourSnakes = turn % 2 === 0 ? newState.ourSnakes : newState.enemySnakes;

  // Find the snake that is moving
  const snakeIndex = ourSnakes.findIndex((snake) => snake.id === snakeId);
  const snake = ourSnakes[snakeIndex];

  // If the snake is dead we remove the snake and return the new state
  if (move === "death") {
    ourSnakes.splice(snakeIndex, 1);
    return newState;
  }

  moveSnake(newState, move, snake);
  return newState;
};

const moveSnake = (state, move, snake) => {
  const newHead = moveHead(snake.head, move);
  snake.body.unshift(newHead);
  snake.head = newHead;

  const ateFood = state.food.some((food, index) => {
    if (food.x === newHead.x && food.y === newHead.y) {
      state.food.splice(index, 1); // Remove the food from the board
      return true;
    }
    return false;
  });

  if (!ateFood) {
    snake.body.pop();
    snake.health -= 1;
  } else {
    snake.health = 100;
    snake.length += 1;
  }
};

const moveHead = (head, move) => {
  switch (move) {
    case "up":
      return { x: head.x, y: head.y + 1 };
    case "down":
      return { x: head.x, y: head.y - 1 };
    case "left":
      return { x: head.x - 1, y: head.y };
    case "right":
      return { x: head.x + 1, y: head.y };
  }
};

export const deepCopy = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  const copy = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }
  return copy;
};

export const isTerminal = (state) => {
  if (!state.ourSnakes || !state.enemySnakes) return true;
  return state.ourSnakes.length === 0 || state.enemySnakes.length === 0;
};
