import React, { useState, useEffect } from 'react';
import { Cpu, Save, Loader2, AlertCircle } from 'lucide-react';

interface LLMSettings {
  provider: 'ollama' | 'openai' | 'gemini';
  ollama_model: string;
  openai_model: string;
  gemini_model: string;
}

const AISettings = () => {
  const [settings, setSettings] = useState<LLMSettings | null>(null);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const OPENAI_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
  const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];

  useEffect(() => {
    fetchSettings();
    fetchOllamaModels();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/llm-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to load settings');
      const data = await res.json();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOllamaModels = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/llm-settings/ollama-models', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOllamaModels(data.models || []);
      }
    } catch (err) {
      console.error('Failed to load Ollama models:', err);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('http://localhost:8000/api/admin/llm-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      setSuccess('AI Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Cpu className="h-6 w-6 text-blue-600" />
          AI Provider Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure the active language model used for the RAG chat assistant.
          <br/>
          <span className="italic">Note: API Keys for OpenAI and Gemini must be configured in the backend .env file.</span>
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Active AI Provider</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['ollama', 'openai', 'gemini'].map((provider) => (
                <div 
                  key={provider}
                  onClick={() => setSettings({ ...settings, provider: provider as any })}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${settings.provider === provider ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 capitalize">{provider}</span>
                    {settings.provider === provider && (
                      <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {provider === 'ollama' && 'Local, open-source models.'}
                    {provider === 'openai' && 'Cloud models (Requires API Key).'}
                    {provider === 'gemini' && 'Google models (Requires API Key).'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">{settings.provider} Configuration</h3>
            
            {/* OLLAMA */}
            {settings.provider === 'ollama' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ollama Model</label>
                  <select
                    value={settings.ollama_model}
                    onChange={(e) => setSettings({ ...settings, ollama_model: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {ollamaModels.length === 0 && <option value={settings.ollama_model}>{settings.ollama_model} (Local not found)</option>}
                    {ollamaModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">These models are fetched directly from your local Ollama instance.</p>
                </div>
              </div>
            )}

            {/* OPENAI */}
            {settings.provider === 'openai' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">OpenAI Model</label>
                  <select
                    value={settings.openai_model}
                    onChange={(e) => setSettings({ ...settings, openai_model: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {OPENAI_MODELS.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* GEMINI */}
            {settings.provider === 'gemini' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gemini Model</label>
                  <select
                    value={settings.gemini_model}
                    onChange={(e) => setSettings({ ...settings, gemini_model: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {GEMINI_MODELS.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettings;
