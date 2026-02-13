import React, { useState, useEffect, useRef } from 'react';
import { getTaxAdvice } from '../services/geminiService';
import { TaxResult } from '../types';
import { Tooltip } from './ui/Tooltip';

const renderAnswerWithTooltips = (text: string) => {
  if (!text) return null;

  const regex = /\[\[(.*?)\|(.*?)\]\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex} dangerouslySetInnerHTML={{__html: text.substring(lastIndex, match.index).replace(/\n/g, '<br/>')}} />);
    }

    const term = match[1];
    const definition = match[2];
    parts.push(
      <Tooltip key={match.index} content={definition}>
        <span className="text-indigo-600 font-medium border-b border-indigo-300 border-dashed cursor-help mx-0.5">
          {term}
        </span>
      </Tooltip>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={lastIndex} dangerouslySetInnerHTML={{__html: text.substring(lastIndex).replace(/\n/g, '<br/>')}} />);
  }

  return <div className="leading-relaxed">{parts}</div>;
};

export const AiAdvisor: React.FC<{ contextData: TaxResult | null }> = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when answer updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [answer, loading]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);

    const contextString = contextData ? `
      Tổng thu nhập Gross: ${new Intl.NumberFormat('vi-VN').format(contextData.gross)}
      Thực nhận (Total Net): ${new Intl.NumberFormat('vi-VN').format(contextData.totalNet)}
      Tổng Thuế TNCN: ${new Intl.NumberFormat('vi-VN').format(contextData.totalTax)}
      Bảo hiểm: ${new Intl.NumberFormat('vi-VN').format(contextData.socialInsurance + contextData.healthInsurance + contextData.unemploymentInsurance)}
    ` : 'Chưa có dữ liệu tính toán.';

    const res = await getTaxAdvice(question, contextString);
    setAnswer(res.answer);
    setLoading(false);
  };

  // 1. Floating Button State
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full shadow-lg shadow-indigo-500/40 text-white flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path></svg>
        
        {/* Tooltip on hover */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Hỏi trợ lý Thuế AI
        </div>
      </button>
    );
  }

  // 2. Open Chat Window State
  return (
    <div className="fixed bottom-6 right-6 z-[60] w-[90vw] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200 flex flex-col animate-slide-up overflow-hidden ring-1 ring-slate-900/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <div>
            <h3 className="font-bold text-sm">Trợ lý Thuế AI</h3>
            <p className="text-[10px] text-indigo-100 font-medium opacity-90">Hỗ trợ 24/7 bởi Gemini</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4" ref={scrollRef}>
        {!answer && !loading && (
            <div className="text-center mt-8 px-4">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path></svg>
              </div>
              <p className="text-slate-500 text-xs font-medium mb-4">
                Chào bạn! Tôi có thể giúp gì về luật thuế TNCN, cách tính lương hoặc các khoản giảm trừ?
              </p>
              <div className="space-y-2">
                  <button onClick={() => setQuestion("Cách tính thuế vãng lai?")} className="w-full text-left text-xs p-2 bg-white border border-slate-200 rounded-lg text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors truncate">
                    "Cách tính thuế vãng lai?"
                  </button>
                  <button onClick={() => setQuestion("Giảm trừ gia cảnh 2025 là bao nhiêu?")} className="w-full text-left text-xs p-2 bg-white border border-slate-200 rounded-lg text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors truncate">
                    "Giảm trừ gia cảnh 2025?"
                  </button>
              </div>
            </div>
        )}

        {question && loading && (
             <div className="flex justify-end animate-fade-in">
                 <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-tr-none text-sm max-w-[85%] shadow-sm">
                    {question}
                 </div>
             </div>
        )}

        {loading && (
            <div className="flex justify-start animate-fade-in">
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none text-sm max-w-[85%] shadow-sm flex items-center gap-2 text-slate-500">
                    <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                    </span>
                    <span className="text-xs">Đang suy nghĩ...</span>
                </div>
            </div>
        )}

        {answer && (
           <>
             <div className="flex justify-end animate-fade-in">
                 <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-tr-none text-sm max-w-[85%] shadow-sm">
                    {question}
                 </div>
             </div>
             <div className="flex justify-start animate-slide-up">
                 <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none text-sm text-slate-700 shadow-sm max-w-[90%]">
                    {renderAnswerWithTooltips(answer)}
                 </div>
             </div>
           </>
        )}
      </div>

      {/* Footer / Input */}
      <div className="p-3 bg-white border-t border-slate-100 shrink-0">
        <div className="relative flex items-center">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              disabled={loading}
            />
            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
        </div>
      </div>
    </div>
  );
};
