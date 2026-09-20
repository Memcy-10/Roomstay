import { useEffect, useRef, useState } from 'react';
import chatbotService from '../../services/chatbot.service.js';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(chatbotService.getStoredSession());
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'bot',
          contenido: '¡Hola! Soy el asistente virtual de RoomStay 👋. Puedo ayudarte con: ¿Cómo reservar una habitación? ¿Métodos de pago? ¿Cancelaciones? ¿Estado de reserva? ¿Cómo presentar un PQR? Escríbeme tu pregunta.',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [isOpen]);

  const send = async () => {
    const texto = input.trim();
    if (!texto || loading) return;
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'usuario',
      contenido: texto,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await chatbotService.sendMessage(texto, sessionId);
      const botMsg = res?.data;
      setSessionId(chatbotService.getStoredSession());
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          contenido: botMsg?.respuesta || botMsg?.reply || 'No pude procesar tu mensaje en este momento. Intenta más tarde.',
          modelo: botMsg?.modelo || botMsg?.model || 'faq',
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      const mensaje =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Error al conectar con el asistente. Recuerda verificar la conexión con el backend.';
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          sender: 'bot',
          contenido: `⚠️ ${mensaje}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const quickQuestions = [
    '¿Cómo reservar?',
    '¿Métodos de pago?',
    '¿Cancelar reserva?',
    '¿Qué es un PQR?',
  ];

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat de RoomStay"
          className="fixed z-[60] bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-2xl hover:scale-105 transition-all flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.97-4.03 9-9 9a8.96 8.96 0 0 1-4.2-.99L3 21l1.01-4.8A8.96 8.96 0 0 1 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white">1</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed z-[60] bottom-6 right-6 w-[370px] max-w-[92vw] h-[560px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200">
          <header className="flex items-center justify-between px-5 py-4 bg-gradient-to-br from-primary-600 to-primary-800 text-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-semibold leading-tight">RoomStay Bot</p>
                <p className="text-xs text-primary-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
                  En línea · {sessionId ? sessionId.slice(0, 8) : 'nuevo'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages([])}
                aria-label="Reiniciar chat"
                className="p-2 text-primary-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar chat"
                className="p-2 text-primary-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-neutral-50">
            {messages.map((m) => {
              const isUser = m.sender === 'usuario';
              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words shadow-sm ${
                      isUser
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-sm'
                    }`}
                  >
                    <p className="leading-relaxed">{m.contenido}</p>
                    {m.modelo && !isUser && (
                      <p className="mt-1 text-[10px] opacity-60">modelo: {m.modelo}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-neutral-200 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 2 && (
            <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-neutral-200 bg-white">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setInput(q);
                    setTimeout(send, 50);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-neutral-200 bg-white shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Escribe tu pregunta..."
                className="input-field flex-1 resize-none py-2.5 min-h-[44px] max-h-[120px]"
              />
              <button
                type="button"
                disabled={loading || !input.trim()}
                onClick={send}
                className="btn-primary !p-0 w-11 h-11 flex items-center justify-center shrink-0 disabled:opacity-60"
                aria-label="Enviar mensaje"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-[10px] text-neutral-400 text-center">Respuesta automática · Revisa siempre la información oficial.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
