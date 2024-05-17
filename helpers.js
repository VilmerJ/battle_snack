export const getLegalMoves = (state, id, turn) => {
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

  // Iterate over snakes
  for (const snake of snakes) {
    // Iterate over the possible new head positions
    for (const move in newHeadPositions) {
      // If the move is not safe then we skip
      if (!isMoveSafe[move]) {
        continue;
      }
      // Get the new head position
      const newHead = newHeadPositions[move];
      // If the new head position is some other snakes body
      // 1. For turn % 2 = 0 => cannot collide with either head or body
      // So: turn % 2 = 0 AND pos(Head) = pos(segment) => move is unsafe
      // 2. For turn % 2 = 1 => cannot collide with body, but can collide with head
      // So: turn % 2 = 1 AND pos(Head) = pos(segment) AND segment != snake.head => move is unsafe
      if (
        snake.body.some(
          (segment) =>
            (turn % 2 === 0 &&
              segment.x === newHead.x &&
              segment.y === newHead.y) ||
            (turn % 2 === 1 &&
              segment !== snake.head &&
              segment.x === newHead.x &&
              segment.y === newHead.y)
        )
      ) {
        isMoveSafe[move] = false;
      }
    }
  }

  // We die if no moves are safe
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
    ourSnakes: gameState.board.snakes
      .filter((snake) => snake.name === "VilmerJ" || snake.name === "TorS")
      .map((snake) => {
        return {
          id: snake.id,
          head: snake.head,
          health: snake.health,
          body: snake.body,
          length: snake.length,
        };
      }),
    enemySnakes: gameState.board.snakes
      .filter((snake) => snake.name !== "VilmerJ" && snake.name !== "TorS")
      .map((snake) => {
        return {
          id: snake.id,
          head: snake.head,
          health: snake.health,
          body: snake.body,
          length: snake.length,
        };
      }),
  };

  const ourSnake = state.ourSnakes.find(
    (snake) => snake.id === gameState.you.id
  );
  const ourOtherSnakes = state.ourSnakes.filter(
    (snake) => snake.id !== gameState.you.id
  );
  state.ourSnakes = [ourSnake, ...ourOtherSnakes];
  return state;
};

export const purgeSnakes = (state) => {
  const enemySnakes = state.enemySnakes;
  const ourSnakes = state.ourSnakes;

  const allSnakes = [...ourSnakes, ...enemySnakes];

  // Iterate over all snakes snakes, if two snakes have the same head position and one is longer than the other, remove the shorter snake

  const filteredSnakes = allSnakes.filter((snake, index, array) => {
    // Check if snake has its head in the same position as another snake's head
    return !array.some((otherSnake) => {
      return (
        snake.id !== otherSnake.id &&
        snake.head.x === otherSnake.head.x &&
        snake.head.y === otherSnake.head.y &&
        snake.length <= otherSnake.length
      );
    });
  });

  state.enemySnakes = filteredSnakes.filter(
    (snake) => !ourSnakes.includes(snake)
  );
  state.ourSnakes = filteredSnakes.filter((snake) => ourSnakes.includes(snake));
  return state;
};

export const copyState = (state) => {
  return {
    width: state.width,
    height: state.height,
    food: state.food.map((xy) => ({ ...xy })),
    ourSnakes: state.ourSnakes.map(copySnakes),
    enemySnakes: state.enemySnakes.map(copySnakes),
  };
};

const copySnakes = (snake) => {
  return {
    id: snake.id,
    name: snake.name,
    health: snake.health,
    body: snake.body.map((body) => ({ ...body })),
    head: { ...snake.head },
    length: snake.length,
  };
};
