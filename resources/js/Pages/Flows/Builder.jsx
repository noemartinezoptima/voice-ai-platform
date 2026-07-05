import { useState, useCallback, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Phone } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FlowBuilderComponent from '@/Components/FlowBuilder';
import { Heading } from '@/Components/catalyst/heading';
import { Text } from '@/Components/catalyst/text';
import { Button } from '@/Components/catalyst/button';
import { Input } from '@/Components/catalyst/input';
import { Alert, AlertTitle, AlertDescription, AlertActions, AlertBody } from '@/Components/catalyst/alert';
import { update } from '@/actions/App/Http/Controllers/Web/FlowController';

export default function Builder({ flow }) {
  const [config, setConfig] = useState(flow.config);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const builderRef = useRef(null);

  const handleConfigChange = useCallback((newConfig) => {
    setConfig(newConfig);
  }, []);

  const handleSave = useCallback(() => {
    builderRef.current?.syncToConfig();
    setSaving(true);

    setTimeout(() => {
      router.patch(update({ flow: flow.id }).url, {
        name: flow.name,
        description: flow.description,
        phone_number: flow.phone_number,
        is_active: flow.is_active,
        config: JSON.stringify(config),
      }, {
        onSuccess: () => toast.success('Flow saved successfully'),
        onError: () => toast.error('Failed to save flow'),
        onFinish: () => setSaving(false),
        preserveScroll: true,
      });
    }, 0);
  }, [flow, config]);

  const handleTestFlow = useCallback(async () => {
    if (!testPhone || testPhone.trim() === '') {
      toast.error('Please enter a phone number');
      return;
    }
    setTesting(true);
    try {
      await axios.post(`/flows/${flow.id}/test`, {
        phone_number: testPhone,
      });
      toast.success('Test call initiated!');
      setShowTestModal(false);
      setTestPhone('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate test call');
    } finally {
      setTesting(false);
    }
  }, [flow.id, testPhone]);

  return (
    <AuthenticatedLayout>
      <Head title={flow.name} />

      <div className="flex items-center gap-3">
        <Link href="/flows" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          <ArrowLeft className="size-4" />
        </Link>
        <Heading>{flow.name}</Heading>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          v{flow.version}
        </span>
      </div>

      <div className="mt-4 flex h-[calc(100vh-12rem)] flex-col">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Drag steps from the toolbox onto the canvas. Connect them by dragging from the bottom handle of a step.
          </p>
          <div className="flex items-center gap-2">
            <Button outline onClick={() => setShowTestModal(true)}>
              <Phone className="size-4" />
              Test Flow
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Flow'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-xl border border-zinc-950/5 bg-white shadow-xs dark:border-white/10 dark:bg-zinc-900">
          <FlowBuilderComponent ref={builderRef} config={config} onConfigChange={handleConfigChange} />
        </div>
      </div>

      <Alert open={showTestModal} onClose={() => setShowTestModal(false)}>
        <AlertTitle>Test Flow: {flow.name}</AlertTitle>
        <AlertDescription>
          Enter a phone number to call and test this flow.
        </AlertDescription>
        <AlertBody>
          <Input
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
          />
        </AlertBody>
        <AlertActions>
          <Button plain onClick={() => setShowTestModal(false)}>Cancel</Button>
          <Button onClick={handleTestFlow} disabled={testing}>
            {testing ? 'Calling...' : 'Call Now'}
          </Button>
        </AlertActions>
      </Alert>
    </AuthenticatedLayout>
  );
}
