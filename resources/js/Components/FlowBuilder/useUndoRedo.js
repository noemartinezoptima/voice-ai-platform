import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

export default function useUndoRedo() {
  const historyRef = useRef([]);
  const futureRef = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushState = useCallback((nodes, edges) => {
    historyRef.current = [...historyRef.current, JSON.stringify({ nodes, edges })].slice(-MAX_HISTORY);
    futureRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback((currentNodes, currentEdges) => {
    if (historyRef.current.length === 0) return null;
    futureRef.current = [JSON.stringify({ nodes: currentNodes, edges: currentEdges }), ...futureRef.current].slice(0, MAX_HISTORY);
    const prev = historyRef.current.pop();
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
    return JSON.parse(prev);
  }, []);

  const redo = useCallback((currentNodes, currentEdges) => {
    if (futureRef.current.length === 0) return null;
    historyRef.current = [...historyRef.current, JSON.stringify({ nodes: currentNodes, edges: currentEdges })].slice(-MAX_HISTORY);
    const next = futureRef.current.shift();
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
    return JSON.parse(next);
  }, []);

  const reset = useCallback(() => {
    historyRef.current = [];
    futureRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  return { pushState, undo, redo, canUndo, canRedo, reset };
}
