import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, AlertCircle, Heart, Shield, RefreshCcw, Key } from 'lucide-react';
import { api } from '../services/api';

export default function MedAssistCopilot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am MedAssist AI, your clinical copilot powered by Google Gemini via secure backend. Ask me about physiological normal ranges, disease risk metrics, ADA/AHA clinical guidelines, or preventative lifestyle optimizations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [savedApiKey, setSavedApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [keySaveMessage, setKeySaveMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      localStorage.setItem('gemini_api_key', trimmed);
      setSavedApiKey(trimmed);
      setKeySaveMessage('✅ Gemini API Key saved locally in browser!');
    } else {
      localStorage.removeItem('gemini_api_key');
      setSavedApiKey('');
      setKeySaveMessage('⚠️ Removed saved API key.');
    }
    setTimeout(() => {
      setKeySaveMessage('');
      setShowKeyModal(false);
    }, 1500);
  };

  const promptChips = [
    'Explain my HbA1c 7.2% diabetes risk score',
    'What lifestyle changes drop stroke risk by 30%?',
    'What are normal clinical ranges for Fasting Glucose?',
    'AHA guidelines for Stage 1 Hypertension'
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      // Get conversation history for context (last 5 messages)
      const conversationHistory = messages.slice(-5).map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));
      
      // Call backend / fallback Gemini API
      const response = await api.post('/gemini/chat', {
        message: text,
        conversationHistory: conversationHistory
      });

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'I apologize, but I encountered an error processing your request. Please try again or check your connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn relative">
      {/* Key Config Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Configure Gemini API Key</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              If running on Vercel Demo Mode (without Java backend connection), enter your Google Gemini API key here for direct AI responses.
            </p>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full clinical-input px-3.5 py-2.5 text-xs font-mono"
            />
            {keySaveMessage && (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{keySaveMessage}</p>
            )}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow transition"
              >
                Save API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-blue-800/40 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MedAssist AI Clinical Assistant</h1>
            <p className="text-xs text-blue-200">Powered by Google Gemini • Evidence-Based Medical Guidance</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center space-x-1.5 text-xs font-medium bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 px-3 py-1.5 rounded-full border border-blue-400/30 transition"
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-blue-300" />
            <span>{savedApiKey ? 'Key Configured' : 'Set Gemini Key'}</span>
          </button>
          <div className="hidden sm:flex items-center space-x-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Secure API</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[calc(100vh-270px)] min-h-[380px] max-h-[560px]">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-xl text-white font-bold text-xs ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-slate-800 dark:bg-blue-900'}`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/50'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className={`block text-[10px] mt-2 text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-slate-800 text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs text-slate-500 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Chips */}
        <div className="px-6 py-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask MedAssist AI clinical assistant..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
