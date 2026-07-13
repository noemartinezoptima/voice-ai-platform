import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

const FIELDS = {
  say: [
    { key: 'text', label: 'Text', type: 'textarea', placeholder: 'What the AI says...' },
  ],
  ask: [
    { key: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Question to ask caller...' },
    {
      key: 'inputType', label: 'Input Type', type: 'select',
      options: [
        { value: 'speech', label: 'Speech' },
        { value: 'dtmf', label: 'DTMF (keypad)' },
      ],
    },
    { key: 'variable', label: 'Save to variable', type: 'input', placeholder: '$input' },
    { key: 'timeoutSec', label: 'Timeout (seconds)', type: 'input', placeholder: '10' },
  ],
  llm: [
    { key: 'systemPrompt', label: 'System Prompt', type: 'textarea', placeholder: 'You are a helpful assistant...' },
    { key: 'userPromptTemplate', label: 'User Prompt Template', type: 'textarea', placeholder: 'The caller said: {{input}}' },
    {
      key: 'model', label: 'Model', type: 'select',
      options: [
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
      ],
    },
  ],
  condition: [
    {
      key: 'branches', label: 'Branches', type: 'branches',
    },
    { key: 'elseNext', label: 'Else (default next)', type: 'input', placeholder: 'Node ID...' },
  ],
  goto: [
    { key: 'target', label: 'Target Step ID', type: 'input', placeholder: 'Enter node id...' },
  ],
  transfer: [
    {
      key: 'destination', label: 'Type', type: 'select',
      options: [
        { value: 'number', label: 'Phone Number' },
        { value: 'queue', label: 'Queue' },
        { value: 'sip', label: 'SIP URI' },
      ],
    },
    { key: 'value', label: 'Destination', type: 'input', placeholder: '+1 (555) 123-4567' },
  ],
  webhook: [
    { key: 'url', label: 'URL', type: 'input', placeholder: 'https://example.com/api/hook' },
    {
      key: 'method', label: 'Method', type: 'select',
      options: [
        { value: 'POST', label: 'POST' },
        { value: 'GET', label: 'GET' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
      ],
    },
    { key: 'body', label: 'Body (JSON)', type: 'textarea', placeholder: '{"key": "{{variable}}"}' },
  ],
  knowledge: [
    { key: 'query', label: 'Query', type: 'textarea', placeholder: 'What information to look up? Use {{variable}} for dynamic values.' },
    { key: 'topK', label: 'Top K Results', type: 'input', placeholder: '5' },
    {
      key: 'retrievalType', label: 'Retrieval Type', type: 'select',
      options: [
        { value: 'semantic', label: 'Semantic (raw chunks)' },
        { value: 'summary', label: 'Summary (condensed)' },
      ],
    },
    {
      key: 'resourceType', label: 'Filter by Type', type: 'select',
      options: [
        { value: '', label: 'All types' },
        { value: 'pdf', label: 'PDF' },
        { value: 'image', label: 'Image' },
        { value: 'csv', label: 'CSV' },
        { value: 'text', label: 'Text' },
      ],
    },
    { key: 'systemPrompt', label: 'System Prompt (optional)', type: 'textarea', placeholder: 'You are a helpful assistant. Use the context below to answer...' },
  ],
  hangup: [],
};

export default function PropertiesPanel({ node, onUpdate, nodes, validationErrors }) {
  const [localData, setLocalData] = useState({});

  useEffect(() => {
    if (node) {
      setLocalData({ ...node.data });
    }
  }, [node?.id]);

  const handleChange = useCallback((key, value) => {
    setLocalData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleBlur = useCallback(() => {
    if (node && localData) {
      onUpdate(node.id, localData);
    }
  }, [node, localData, onUpdate]);

  if (!node) {
    return (
      <div className="flex w-64 flex-col items-center justify-center border-l p-6 text-center dark:border-zinc-800">
        <p className="text-sm text-zinc-400">Select a node to edit</p>
        <p className="mt-1 text-xs text-zinc-500">Click on any step in the flow</p>
      </div>
    );
  }

  const fields = FIELDS[node.type] || [];
  const nodeErrors = validationErrors?.[node.id] || [];

  const getFieldError = (fieldKey) => {
    return nodeErrors.find((e) => e.field === fieldKey)?.message;
  };

  return (
    <div className="w-64 overflow-y-auto border-l bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-zinc-900 capitalize dark:text-white">{node.type}</p>
          {nodeErrors.length > 0 && (
            <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
          )}
        </div>
        <p className="text-xs text-zinc-400">ID: {node.id}</p>

        {nodeErrors.length > 0 && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-950/30">
            {nodeErrors.map((e, i) => (
              <p key={e.field || i} className="text-[10px] leading-relaxed text-red-600 dark:text-red-400">
                {e.message}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {fields.map((field) => {
          const error = getFieldError(field.key);

          if (field.type === 'branches') {
            return (
              <div key={field.key}>
                <BranchesEditor
                  branches={localData.branches || []}
                  nodes={nodes}
                  onChange={(b) => {
                    handleChange('branches', b);
                    setTimeout(handleBlur, 0);
                  }}
                />
                {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
              </div>
            );
          }

          if (field.type === 'select') {
            return (
              <div key={field.key}>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">{field.label}</label>
                <select
                  value={localData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border bg-white px-2.5 py-1.5 text-xs text-zinc-900 focus:border-blue-500 focus:outline-hidden dark:bg-zinc-800 dark:text-white ${error ? 'border-red-300 dark:border-red-700' : 'border-zinc-200 dark:border-zinc-700'}`}
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
              </div>
            );
          }

          if (field.type === 'textarea') {
            return (
              <div key={field.key}>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">{field.label}</label>
                <textarea
                  value={localData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  onBlur={handleBlur}
                  rows={3}
                  placeholder={field.placeholder}
                  className={`w-full rounded-lg border bg-white px-2.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-300 focus:border-blue-500 focus:outline-hidden dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-600 ${error ? 'border-red-300 dark:border-red-700' : 'border-zinc-200 dark:border-zinc-700'}`}
                />
                {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
              </div>
            );
          }

          return (
            <div key={field.key}>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">{field.label}</label>
              <input
                value={localData[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                onBlur={handleBlur}
                placeholder={field.placeholder}
                className={`w-full rounded-lg border bg-white px-2.5 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-300 focus:border-blue-500 focus:outline-hidden dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-600 ${error ? 'border-red-300 dark:border-red-700' : 'border-zinc-200 dark:border-zinc-700'}`}
              />
              {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BranchesEditor({ branches, nodes, onChange }) {
  const addBranch = () => {
    onChange([...branches, { label: `Branch ${branches.length + 1}`, expression: '', next: null }]);
  };

  const removeBranch = (i) => {
    onChange(branches.filter((_, idx) => idx !== i));
  };

  const updateBranch = (i, field, value) => {
    const updated = branches.map((b, idx) => (idx === i ? { ...b, [field]: value } : b));
    onChange(updated);
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Branches</label>
        <button onClick={addBranch} className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400">+ Add</button>
      </div>
      <div className="space-y-2">
        {branches.map((b, i) => (
          <div key={`${b.label || 'branch'}-${i}`} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="mb-1 flex items-center justify-between">
              <input
                value={b.label || ''}
                onChange={(e) => updateBranch(i, 'label', e.target.value)}
                placeholder="Label"
                className="w-20 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 focus:border-blue-500 focus:outline-hidden dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
              />
              <button onClick={() => removeBranch(i)} className="text-[10px] text-red-400 hover:text-red-500">&times;</button>
            </div>
            <input
              value={b.expression || ''}
              onChange={(e) => updateBranch(i, 'expression', e.target.value)}
              placeholder="e.g. input == '1'"
              className="w-full rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-600 focus:border-blue-500 focus:outline-hidden dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
