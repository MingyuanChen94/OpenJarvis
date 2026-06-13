import { useEffect, useState } from 'react';
import { getModels } from '@/lib/transport';
import { useSettings } from '@/store/settings';
import type { ModelInfo } from '@/types';

export function useModels() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const model = useSettings((s) => s.model);
  const setModel = useSettings((s) => s.setModel);
  const backendOnline = useSettings((s) => s.backendOnline);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getModels()
      .then((m) => {
        if (!active) return;
        setModels(m);
        const cur = useSettings.getState().model;
        if ((!cur || !m.some((x) => x.id === cur)) && m.length > 0) {
          useSettings.getState().setModel(m[0].id);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // refetch when backend availability flips (live ⇄ demo)
  }, [backendOnline]);

  return { models, loading, model, setModel };
}
