import { generateNewBoard } from "./generateState";
import { getLegalMoves } from "./helpers";
import { evaluation } from "./evaluation";

const EXLORATION_CONSTANT = Math.sqrt(2);

export const monteCarloTreeSearch = (state, maxIterations) => {
  const root = new Node(state);
  let iterations = 0;

  while (iterations < maxIterations) {
    const node = select(root);
    const result = simulate(node.state);
    backpropagate(node, result);
    iterations += 1;
  }

  return bestChild(root).state;
};

class Node {
  constructor(state, parent = null) {
    this.state = state;
    this.parent = parent;
    this.children = [];
    this.visits = 0;
    this.score = 0;
  }
}

const select = (node) => {
  while (node.children.length > 0) {
    node = bestUCT(node);
  }

  return node;
};

const bestUCT = (node) => {
  let bestChild = null;
  let bestUCT = -Infinity;

  for (const child of node.children) {
    const uct =
      child.score +
      EXLORATION_CONSTANT *
        Math.sqrt((2 * Math.log(node.visits)) / child.visits);
    if (uct > bestUCT) {
      bestUCT = uct;
      bestChild = child;
    }
  }

  return bestChild;
};

const simulate = (state) => {
  let currentState = JSON.parse(JSON.stringify(state));

  while (!isTerminal(currentState)) {
    const legalMoves = getLegalMoves(
      currentState.snakes[0].body,
      currentState.board.width,
      currentState.board.height,
      currentState.snakes
    );
    const safeMoves = Object.keys(legalMoves).filter((key) => legalMoves[key]);
    const randomMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

    currentState = generateNewBoard(
      currentState,
      currentState.snakes[0].id,
      randomMove
    );
  }

  return evaluation(
    [currentState.snakes[0]],
    currentState.snakes.filter(
      (snake) => snake.id !== currentState.snakes[0].id
    )
  );
};

const isTerminal = (state) => {
  return state.snakes.length === 1;
};

const backpropagate = (node, result) => {
  while (node !== null) {
    node.visits += 1;
    node.score += result;
    node = node.parent;
  }
};

const bestChild = (node) => {
  let bestChild = null;
  let bestScore = -Infinity;

  for (const child of node.children) {
    const score = child.score / child.visits;
    if (score > bestScore) {
      bestScore = score;
      bestChild = child;
    }
  }

  return bestChild;
};
