export const getLegalMoves = (state, id) => {
  let isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true,
    death: false,
  };

  const snakes = [...state.ourSnakes, ...state.enemySnakes];
  const myBody = snakes.find((snake) => snake.id === id).body;

  const myHead = myBody[0];
  const myNeck = myBody[1];

  // Don't let the snake move back on itself
  if (myNeck.x < myHead.x) {
    isMoveSafe.left = false;
  } else if (myNeck.x > myHead.x) {
    isMoveSafe.right = false;
  } else if (myNeck.y < myHead.y) {
    isMoveSafe.down = false;
  } else if (myNeck.y > myHead.y) {
    isMoveSafe.up = false;
  }

  // Check out of bounds X
  if (myHead.x === 0) {
    isMoveSafe.left = false;
  } else if (myHead.x === state.width - 1) {
    isMoveSafe.right = false;
  }
  // Check out of bounds Y
  if (myHead.y === 0) {
    isMoveSafe.down = false;
  } else if (myHead.y === state.height - 1) {
    isMoveSafe.up = false;
  }

  // Check for collisions with some snake
  const newHeadPositions = {
    up: { x: myHead.x, y: myHead.y + 1 },
    down: { x: myHead.x, y: myHead.y - 1 },
    left: { x: myHead.x - 1, y: myHead.y },
    right: { x: myHead.x + 1, y: myHead.y },
  };

  for (const snake of snakes) {
    for (const move in newHeadPositions) {
      if (!isMoveSafe[move]) {
        continue;
      }

      const newHead = newHeadPositions[move];
      if (
        snake.body.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        isMoveSafe[move] = false;
      }
    }
  }

  if (!Object.values(isMoveSafe).some((value) => value)) {
    isMoveSafe.death = true;
  }

  return isMoveSafe;
};

export const transformGameStateToOurState = (gameState) => {
  const state = {
    width: gameState.board.width,
    height: gameState.board.height,
    food: gameState.board.food,
    ourSnakes: gameState.board.snakes.filter(
      (snake) => snake.name === "VilmerJ"
    ),
    enemySnakes: gameState.board.snakes.filter(
      (snake) => snake.name !== "VilmerJ"
    ),
  };

  const ourSnake = gameState.board.snakes.find(
    (snake) => snake.id === gameState.you.id
  );
  const ourOtherSnakes = gameState.board.snakes.filter(
    (snake) => snake.id !== gameState.you.id
  );
  state.ourSnakes = [ourSnake, ...ourOtherSnakes];
  return state;
};
