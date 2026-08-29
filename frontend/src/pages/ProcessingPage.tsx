import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Server, Cpu, Database } from 'lucide-react';
import { javaApiService } from '../api';

export const ProcessingPage: React.FC = () => {
  const { bidId } = useParams<{ bidId: string }>();
  const navigate = useNavigate();

  const [stageIndex, setStageIndex] = useState(0);
  const stages = [
    '1/6 Receiving multipart vendor submission package...',
    '2/6 Calling Python AI Microservice (port 8000 /extract)...',
    '3/6 Parsing PDF/DOCX page chunks & layout structures...',
    '4/6 Executing TF-IDF Vector & LLM Evidence Evaluation...',
    '5/6 Checking GST, Financial Turnover & Technical RAM Specs...',
    '6/6 Compiling final compliance score & evaluator breakdown...',
  ];

  useEffect(() => {
    if (!bidId) return;

    const interval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          triggerEvaluationAndNavigate();
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [bidId]);

  const triggerEvaluationAndNavigate = async () => {
    if (!bidId) return;
    try {
      await javaApiService.evaluateBid(bidId);
      navigate(`/score/${bidId}`);
    } catch (err) {
      console.error('Failed evaluation run:', err);
      navigate(`/score/${bidId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl p-10 max-w-lg w-full text-center space-y-6 shadow-xl">
        
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          <Sparkles className="w-8 h-8 text-indigo-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900">BidNexusAI Microservice Processing</h2>
          <p className="text-xs text-slate-500 font-semibold">
            Java Backend (8080) ↔ Python AI Microservice (8000) Orchestration
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-mono text-xs font-bold shadow-xs">
          {stages[stageIndex]}
        </div>

        <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-500 pt-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
            <Server className="w-4 h-4 text-indigo-600" />
            <span>Java 8080 API</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Python 8000 AI</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
            <Database className="w-4 h-4 text-amber-600" />
            <span>H2/SQLite Store</span>
          </div>
        </div>

      </div>
    </div>
  );
};
