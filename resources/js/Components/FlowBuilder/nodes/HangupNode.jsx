import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

function HangupNode({ data }) {
  return (
    <div className="min-w-36 rounded-xl border border-red-200 bg-white shadow-xs dark:border-red-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 rounded-t-xl bg-red-50 px-3 py-2 dark:bg-red-950/30">
        <span className="flex size-5 items-center justify-center rounded bg-red-500 text-[10px] font-bold text-white">■</span>
        <span className="text-xs font-semibold text-red-800 dark:text-red-300">Hangup</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs text-zinc-400 italic">End call</p>
      </div>
      <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-red-400 !bg-white" />
    </div>
  );
}

export default memo(HangupNode);
