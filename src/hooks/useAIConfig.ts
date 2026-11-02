import { useEffect, useRef, useState } from 'react';
import { createAISettings } from '../constants/ai';
import { clearAIKey, loadAISettings, saveAIProfile } from '../lib/aiConfig';
import { testAIConnection, validateAIProfile } from '../lib/aiClient';
import type { AIProfile, AIProvider } from '../types/ai';

type Notice = { kind: 'success' | 'error' | 'info'; text: string } | null;

export function useAIConfig() {
  const [settings, setSettings] = useState(createAISettings);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState<'save' | 'test' | 'clear' | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [dirty, setDirty] = useState(false);
  const mounted = useRef(true);
  const lock = useRef(false);
  const request = useRef<AbortController | null>(null);

  async function load() {
    setLoading(true);
    setLoadFailed(false);
    try {
      const saved = await loadAISettings();
      if (mounted.current) { setSettings(saved); setNotice(null); }
    } catch {
      if (mounted.current) {
        setLoadFailed(true);
        setNotice({ kind: 'error', text: '读取配置失败，请重试。原有配置未被覆盖。' });
      }
    } finally { if (mounted.current) setLoading(false); }
  }

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => { mounted.current = false; request.current?.abort(); };
  }, []);

  function selectProvider(provider: AIProvider) {
    setSettings(current => ({ ...current, provider }));
    setDirty(true);
    setNotice(null);
  }
  function update(field: keyof AIProfile, value: string) {
    setSettings(current => ({ ...current, profiles: {
      ...current.profiles,
      [current.provider]: { ...current.profiles[current.provider], [field]: value },
    } }));
    setDirty(true);
    setNotice(null);
  }
  async function run(action: 'save' | 'test' | 'clear') {
    if (lock.current || loading || loadFailed) return;
    lock.current = true;
    setBusy(action);
    setNotice(null);
    try {
      const provider = settings.provider;
      if (action === 'clear') {
        await clearAIKey(provider);
        if (mounted.current) {
          update('apiKey', '');
          setNotice({ kind: 'info', text: '此服务商的本地密钥已删除。' });
        }
      } else {
        const profile = validateAIProfile(settings.profiles[provider]);
        if (action === 'save') {
          await saveAIProfile(provider, profile);
          if (mounted.current) {
            setSettings(current => ({ ...current, profiles: { ...current.profiles, [provider]: profile } }));
            setDirty(false);
            setNotice({ kind: 'success', text: '当前服务商配置已保存。' });
          }
        } else {
          request.current = new AbortController();
          const result = await testAIConnection(provider, profile, request.current.signal);
          if (mounted.current) setNotice({ kind: 'success', text: `连接成功 · ${(result.elapsedMs / 1000).toFixed(1)} 秒。文本请求可用；图片能力需在拍摄指导中另行验证。` });
        }
      }
    } catch (error) {
      if (mounted.current) setNotice({ kind: 'error', text: action === 'test'
        ? (error instanceof Error ? error.message : '测试失败，请重试。')
        : (action === 'save' && error instanceof Error && /请|必须/.test(error.message)
          ? error.message : '本地存储操作失败，请重试。') });
    } finally {
      request.current = null;
      lock.current = false;
      if (mounted.current) setBusy(null);
    }
  }
  return { settings, loading, loadFailed, busy, notice, dirty, load, selectProvider, update, run };
}
