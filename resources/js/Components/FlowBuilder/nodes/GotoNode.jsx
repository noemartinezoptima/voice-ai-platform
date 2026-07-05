import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

function GotoNode({ data }) {
  return (
    <div className="min-w-40 rounded-xl border border-orange-200 bg-white shadow-xs dark:border-orange-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 rounded-t-xl bg-orange-50 px-3 py-2 dark:bg-orange-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-orange-500 text-[10px] font-bold text-white">↪</span>
        <span className="text-xs font-semibold text-orange-800 dark:text-orange-300">Goto</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          → {data.target || 'Select target...'}
        </p>
      </div>
      <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-orange-400 !bg-white" />
    </div>
  );
}

export default memo(GotoNode);
