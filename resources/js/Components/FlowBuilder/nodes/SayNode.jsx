import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

function SayNode({ data }) {
  return (
    <div className="min-w-48 rounded-xl border border-emerald-200 bg-white shadow-xs dark:border-emerald-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 rounded-t-xl bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-emerald-500 text-[10px] font-bold text-white">S</span>
        <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Say</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs text-zinc-600 line-clamp-2 dark:text-zinc-400">
          {data.text || 'Empty response'}
        </p>
      </div>
      <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-emerald-400 !bg-white" />
      <Handle type="source" position={Position.Bottom} className="!size-2.5 !border-2 !border-emerald-400 !bg-white" />
    </div>
  );
}

export default memo(SayNode);
