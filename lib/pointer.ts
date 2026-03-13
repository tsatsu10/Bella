export type PointerState = {
  x: number;
  y: number;
  ndcX: number;
  ndcY: number;
};

let pointerState: PointerState = {
  x: 0,
  y: 0,
  ndcX: 0,
  ndcY: 0,
};

const listeners = new Set<(state: PointerState) => void>();

export function setPointerState(next: PointerState) {
  pointerState = next;
  listeners.forEach((listener) => listener(next));
}

export function subscribePointer(listener: (state: PointerState) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPointerState() {
  return pointerState;
}

