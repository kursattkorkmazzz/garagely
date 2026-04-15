import React, { useImperativeHandle } from "react";

export const AsyncStates = {
  IDLE: "idle",
  PENDING: "pending",
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type AsyncState = (typeof AsyncStates)[keyof typeof AsyncStates];

export function useAsyncState(ref?: React.RefObject<AsyncStateRef>) {
  const [state, _setState] = React.useState<AsyncState>("idle");

  const setState = React.useCallback((newState: AsyncState) => {
    _setState(newState);
  }, []);

  useImperativeHandle(ref, () => ({
    state,
  }));

  return { state, setState };
}

// Imperative API for async state.
export type AsyncStateRef = {
  state: AsyncState;
};
