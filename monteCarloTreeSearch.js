import { generateNewState } from "./generateState";
import { getLegalMoves } from "./helpers";
import { evaluation } from "./evaluation";

const EXLORATION_CONSTANT = Math.sqrt(2);
const MAX_SIMULATIONS_DEPTH = 40;
const MAX_TIME = 100; // 100 ms

export const monteCarloTreeSearch = (state) => {
  const root = new Node(state);

  const start = Date.now();
  while (Date.now() - start < MAX_TIME) {
    const node = select(root);
    const result = simulate(node.state, 0);
    backpropagate(node, result);
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

  addChild(child) {
    this.children.push(child);
  }

  reCalculateScore() {
    const totalScore = this.children.reduce((acc, child) => {
      return acc + child.score;
    }, 0);
    this.score = totalScore / this.visits;
  }
}

const select = (node) => {
  if (node.children.length === 0) {
    return null;
  }

  return bestUCT(node);
};

const bestUCT = (node) => {
  let bestChild = null;
  let bestUCT = -Infinity;

  for (const child of node.children) {
    const uct =
      child.score +
      EXLORATION_CONSTANT *
        Math.sqrt((2 * Math.log(node.visits)) / (child.visits + 0.0001)); // Avoid division by zero
    if (uct > bestUCT) {
      bestUCT = uct;
      bestChild = child;
    }
  }

  return bestChild;
};

const simulate = (node, depth) => {
  if (depth > MAX_SIMULATIONS_DEPTH) {
    return evaluation(currentState.snakes, currentState.snakes);
  }

  if (this.children.length === 0) {
    for (const move of getLegalMoves(node.state.snakes[0])) {
      const newState = generateNewState(node.state, move);
      node.addChild(new Node(newState, node));
    }
  }

  const bestChild = select(node);
  if (bestChild === null) {
    return evaluation(currentState.snakes, currentState.snakes);
  }

  return simulate(bestChild, depth + 1);
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
