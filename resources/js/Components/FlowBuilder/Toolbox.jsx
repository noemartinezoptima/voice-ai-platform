const NODE_ITEMS = [
  { type: 'say', label: 'Say', color: 'emerald', desc: 'Text-to-speech response' },
  { type: 'ask', label: 'Ask', color: 'violet', desc: 'Gather caller input' },
  { type: 'llm', label: 'LLM', color: 'blue', desc: 'AI prompt' },
  { type: 'condition', label: 'Condition', color: 'amber', desc: 'Branch logic' },
  { type: 'goto', label: 'Goto', color: 'orange', desc: 'Jump to step' },
  { type: 'transfer', label: 'Transfer', color: 'rose', desc: 'Call transfer' },
  { type: 'webhook', label: 'Webhook', color: 'cyan', desc: 'HTTP request' },
  { type: 'knowledge', label: 'Knowledge', color: 'teal', desc: 'Query knowledge base' },
  { type: 'hangup', label: 'Hangup', color: 'red', desc: 'End call' },
];

const colorMap = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300',
  violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300',
  blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300',
  amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
  orange: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-300',
  rose: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300',
  red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300',
  teal: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-300',
};

function DraggableItem({ type, label, color, desc }) {
  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`flex cursor-grab items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition hover:shadow-xs active:cursor-grabbing ${colorMap[color]}`}
      draggable
      onDragStart={onDragStart}
    >
      <span className="text-xs">{label}</span>
      <span className="text-[10px] font-normal opacity-60">{desc}</span>
    </div>
  );
}

export default function Toolbox() {
  return (
    <div className="flex w-56 flex-col gap-2 border-r bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Steps</div>
      {NODE_ITEMS.map((item) => (
        <DraggableItem key={item.type} {...item} />
      ))}
    </div>
  );
}
