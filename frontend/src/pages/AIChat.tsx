import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Send, FileText, User as UserIcon, Bot, History, Plus } from 'lucide-react';

interface Source {
  cv_id: number;
  filename: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'ai';
  content: string;
  sources?: Source[];
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
}

const AIChat = () => {
  const defaultMessage: Message = {
    id: '1',
    role: 'assistant',
    content: 'Hello! I am your secure CV intelligence assistant. I can help you find candidates and answer questions based ONLY on the CVs you are authorized to access. What are you looking for today?'
  };

  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [saveHistory, setSaveHistory] = useState(false);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/chat/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const loadSession = async (sessionId: number) => {
    try {
      const res = await api.get(`/chat/sessions/${sessionId}`);
      const sessionData = res.data;
      
      const loadedMessages = sessionData.messages.map((m: any) => ({
        id: m.id.toString(),
        role: m.role,
        content: m.content,
        sources: m.sources
      }));

      setMessages(loadedMessages.length > 0 ? loadedMessages : [defaultMessage]);
      setCurrentSessionId(sessionId);
      setSaveHistory(true); // If we loaded a session, future messages should be saved to it
    } catch (err) {
      console.error('Failed to load session', err);
    }
  };

  const startNewSession = () => {
    setMessages([defaultMessage]);
    setCurrentSessionId(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const query = input.trim();
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post('/chat', { 
        query, 
        save_history: saveHistory,
        session_id: currentSessionId
      });
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      
      if (res.data.session_id && res.data.session_id !== currentSessionId) {
        setCurrentSessionId(res.data.session_id);
        fetchSessions(); // Refresh sidebar to show the new session
      }
      
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error: ' + (err.response?.data?.detail || err.message)
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrompts = [
    "Find candidates with Python experience.",
    "Find candidates with React and Node.js.",
    "Compare backend candidates.",
    "Which candidates have AWS experience?"
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      
      {/* Sidebar for History */}
      <div className="w-64 bg-white shadow rounded-xl p-4 flex flex-col border border-gray-200">
        <button
          onClick={startNewSession}
          className="flex items-center justify-center gap-2 w-full bg-indigo-50 text-indigo-700 p-2 rounded-lg hover:bg-indigo-100 transition font-medium mb-4"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
        
        <div className="flex items-center gap-2 mb-3 px-1 text-sm font-semibold text-gray-500 uppercase tracking-wider">
          <History className="w-4 h-4" />
          <span>Chat History</span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {sessions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-4">No history yet.</p>
          ) : (
            sessions.map(s => (
              <button 
                key={s.id}
                onClick={() => loadSession(s.id)}
                className={`w-full text-left p-2 rounded-lg text-sm truncate transition ${currentSessionId === s.id ? 'bg-indigo-100 text-indigo-900 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                {s.title || "New Chat"}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="mb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
            <p className="mt-1 text-sm text-gray-500">Secure, permission-aware RAG search across CVs.</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="saveHistory" 
              checked={saveHistory} 
              onChange={e => setSaveHistory(e.target.checked)} 
              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="saveHistory" className="text-sm text-gray-700 font-medium cursor-pointer">
              Save Chat History
            </label>
          </div>
        </div>

        <div className="flex-1 bg-white shadow rounded-xl flex flex-col overflow-hidden border border-gray-200">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {(msg.role === 'assistant' || msg.role === 'ai') && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-indigo-600" />
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-none'} p-4`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sources:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map(source => (
                          <div key={source.cv_id} className="flex items-center gap-1 text-xs bg-white text-gray-700 px-2 py-1 rounded shadow-sm border border-gray-200">
                            <FileText className="w-3 h-3 text-indigo-400" />
                            <span>{source.filename}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 justify-start">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tl-none p-4 flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            {messages.length === 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="whitespace-nowrap px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full border border-indigo-200 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about candidates..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
