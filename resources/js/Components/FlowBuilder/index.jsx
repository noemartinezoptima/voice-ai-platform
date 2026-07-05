import { useCallback, useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import nodeTypes from './nodes';
import Toolbox from './Toolbox';
import PropertiesPanel from './PropertiesPanel';
import { configToReactFlow, reactFlowToConfig, generateId, NODE_DEFAULTS } from './flowConfig';

function FlowCanvas({ config, onConfigChange, innerRef }) {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition, setCenter } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState(null);

  const { nodes: initialNodes, edges: initialEdges } = configToReactFlow(config);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: n, edges: e } = configToReactFlow(config);
    setNodes(n);
    setEdges(e);
  }, [config]);

  const syncToConfig = useCallback(() => {
    const startNodeId = nodes.length > 0 ? nodes[0].id : '';
    const newConfig = reactFlowToConfig(nodes, edges, startNodeId);
    onConfigChange(newConfig);
  }, [nodes, edges, onConfigChange]);

  useImperativeHandle(innerRef, () => ({ syncToConfig }), [syncToConfig]);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds));
    },
    [setEdges],
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const id = generateId();
      const defaults = NODE_DEFAULTS[type];
      const label = type.charAt(0).toUpperCase() + type.slice(1);

      const newNode = {
        id,
        type,
        position,
        data: { ...defaults.config, label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeUpdate = useCallback(
    (id, data) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
      );
      setSelectedNode((prev) => (prev?.id === id ? { ...prev, data: { ...prev.data, ...data } } : prev));
    },
    [setNodes],
  );

  return (
    <div className="flex h-full">
      <Toolbox />

      <div ref={reactFlowWrapper} className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
          className="bg-zinc-50/50 dark:bg-zinc-950/50"
        >
          <Controls className="!rounded-lg !border !border-zinc-200 !shadow-xs dark:!border-zinc-800" />
          <MiniMap
            nodeStrokeWidth={3}
            className="!rounded-lg !border !border-zinc-200 !shadow-xs dark:!border-zinc-800"
          />
          <Background gap={16} className="!bg-zinc-50/50 dark:!bg-zinc-950/50" />
        </ReactFlow>
      </div>

      <PropertiesPanel node={selectedNode} onUpdate={onNodeUpdate} nodes={nodes} />
    </div>
  );
}

const FlowBuilder = forwardRef(function FlowBuilder({ config, onConfigChange }, ref) {
  return (
    <ReactFlowProvider>
      <FlowCanvas config={config} onConfigChange={onConfigChange} innerRef={ref} />
    </ReactFlowProvider>
  );
});

export default FlowBuilder;
