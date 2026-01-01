
import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { getBusinessInsights } from '../services/geminiService';

interface AIInsightsProps {
  data: any;
}

const AIInsights: React.FC<AIInsightsProps> = ({ data }) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    const result = await getBusinessInsights(data);
    setInsights(result);
    setLoading(false);
  };

  useEffect(() => {
    if (!insights && !loading) {
      fetchInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl flex flex-col items-center text-center">
        <div className="bg-white/20 p-4 rounded-full mb-4">
          <BrainCircuit size={48} />
        </div>
        <h2 className="text-3xl font-bold mb-2">BCR AI Insights</h2>
        <p className="text-blue-100 max-w-lg">
          Biarkan kecerdasan buatan menganalisis performa bisnis Anda, mendeteksi tren stok, dan memberikan rekomendasi strategis.
        </p>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="mt-6 flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
          Generate Insights Terbaru
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
           <Loader2 className="animate-spin mb-4" size={48} />
           <p className="animate-pulse">Menganalisis ribuan data transaksi...</p>
        </div>
      ) : insights ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm prose prose-blue max-w-none">
          <div className="flex items-center gap-2 text-blue-600 mb-6 pb-2 border-b border-gray-100">
             <MessageSquare size={24} />
             <h3 className="text-xl font-bold m-0">Hasil Analisis</h3>
          </div>
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {insights}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400 italic">
          Klik tombol di atas untuk memulai analisis AI.
        </div>
      )}
    </div>
  );
};

export default AIInsights;
