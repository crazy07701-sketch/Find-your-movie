
import React, { useState, useRef, useEffect } from 'react';
import CinemaHall from './components/CinemaHall';
import { Search, Link as LinkIcon, Loader2, AlertCircle, RefreshCw, ExternalLink, Image as ImageIcon, X, History, Trash2, PlayCircle, Clapperboard } from 'lucide-react';
import { identifyMovie } from './services/geminiService';
import { SearchState, MovieResult } from './types';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [history, setHistory] = useState<MovieResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [state, setState] = useState<SearchState>({
    loading: false,
    error: null,
    result: null,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحميل السجل عند بدء التشغيل
  useEffect(() => {
    const saved = localStorage.getItem('movie_search_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // حفظ السجل عند تغييره
  useEffect(() => {
    localStorage.setItem('movie_search_history', JSON.stringify(history));
  }, [history]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !image) return;

    setState({ loading: true, error: null, result: null });
    setShowHistory(false);

    try {
      const result = await identifyMovie(input, image || undefined);
      setState({
        loading: false,
        error: null,
        result: result,
      });
      
      if (result.isFound) {
        setHistory(prev => [result, ...prev.slice(0, 19)]);
      }
    } catch (err: any) {
      setState({
        loading: false,
        error: err.message || "فشل الاتصال بخدمة الذكاء الاصطناعي",
        result: null,
      });
    }
  };

  const clearHistory = () => {
    if (window.confirm('هل أنت متأكد من مسح سجل البحث؟')) {
      setHistory([]);
      localStorage.removeItem('movie_search_history');
    }
  };

  const resetSearch = () => {
    setInput('');
    setImage(null);
    setState({ loading: false, error: null, result: null });
  };

  const loadFromHistory = (item: MovieResult) => {
    setState({ loading: false, error: null, result: item });
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto flex justify-end gap-3 mb-4 relative z-50">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border font-bold text-sm shadow-lg ${
            showHistory ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          {showHistory ? 'إغلاق السجل' : 'سجل البحث'}
        </button>
      </div>

      <CinemaHall isResult={!!state.result}>
        {showHistory ? (
          <div className="animate-in fade-in zoom-in duration-300 space-y-6 w-full">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <History className="text-red-500" />
                آخر اكتشافاتك
              </h3>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-gray-500 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <PlayCircle className="w-16 h-16 text-gray-800 mx-auto" />
                <p className="text-gray-500">لا يوجد سجل بحث حالياً.. ابدأ مغامرتك السينمائية!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="group bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex gap-4 cursor-pointer hover:border-red-600/50 transition-all hover:bg-gray-800/80"
                  >
                    <div className="w-20 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-gray-800">
                      {item.imageThumbnail ? (
                        <img src={item.imageThumbnail} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="thumbnail" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold truncate">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{item.year} | {item.genre}</p>
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setShowHistory(false)}
              className="w-full py-3 text-gray-500 hover:text-white transition-colors text-sm font-bold"
            >
              العودة للبحث
            </button>
          </div>
        ) : !state.result && !state.loading ? (
          <form onSubmit={handleSearch} className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-6 w-6 text-red-600 group-focus-within:text-red-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="رابط الفيديو، أسماء الممثلين، أو وصف دقيق للمشهد..."
                  className="block w-full pr-12 pl-4 py-5 bg-gray-900/90 border-2 border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-red-600/20 focus:border-red-600 transition-all text-xl shadow-2xl text-right"
                  dir="rtl"
                />
              </div>

              <div className="flex flex-col items-center gap-4">
                {image ? (
                  <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border-2 border-red-600 shadow-2xl group">
                    <img src={image} alt="لقطة الشاشة" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="bg-red-600 p-3 rounded-full text-white shadow-xl hover:scale-110 transition-transform"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-10 border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-500 hover:border-red-600/50 hover:bg-red-950/5 hover:text-red-500 transition-all group"
                  >
                    <div className="p-4 bg-gray-900 rounded-full border border-gray-800 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                    <div className="text-center">
                      <span className="font-bold block text-lg text-gray-300">ارفق لقطة شاشة للمشهد</span>
                      <span className="text-sm opacity-60">تزيد من دقة التعرف حتى 95%</span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </button>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() && !image}
              className="w-full bg-red-700 hover:bg-red-600 disabled:bg-gray-900 disabled:text-gray-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-4 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-[0_10px_30px_rgba(185,28,28,0.3)] text-xl"
            >
              <Search className="w-7 h-7" />
              بدء التحقيق السينمائي
            </button>
          </form>
        ) : null}

        {state.loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full"></div>
              <Loader2 className="w-24 h-24 text-red-600 animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-black text-white">جاري فحص قواعد البيانات...</h3>
              <p className="text-gray-400">نقوم بتحليل الألوان والوجوه للعثور على النتيجة المثالية</p>
            </div>
          </div>
        )}

        {state.error && (
          <div className="bg-red-900/10 border border-red-800/30 p-10 rounded-3xl text-center space-y-6 animate-in zoom-in duration-300">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <div className="space-y-2">
              <h4 className="text-2xl font-bold text-white">عذراً، لم نستطع الوصول</h4>
              <p className="text-red-200/70">{state.error}</p>
            </div>
            <button
              onClick={() => handleSearch()}
              className="px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition-all"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {state.result && (
          <div className="animate-in slide-in-from-bottom-12 duration-700 space-y-8">
            <div className="bg-gray-900/40 border border-gray-800 rounded-[2rem] overflow-hidden backdrop-blur-xl">
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex justify-between items-start flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-4 py-1.5 rounded-full text-xs font-black bg-green-600/20 text-green-400 border border-green-600/30">
                        {state.result.isFound ? 'تم التعرف بنجاح' : 'نتيجة تقريبية'}
                      </span>
                      {state.result.year && (
                        <span className="px-4 py-1.5 bg-gray-800/80 border border-gray-700 rounded-full text-xs text-gray-400 font-bold">
                          {state.result.year}
                        </span>
                      )}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2">
                      {state.result.title}
                    </h2>
                    <p className="text-red-500 font-bold">{state.result.genre}</p>
                  </div>
                  <div className="bg-black/60 p-5 rounded-2xl border border-gray-800">
                    <span className="text-xs text-gray-500 block text-right">معدل المطابقة</span>
                    <span className="text-3xl font-black text-red-600">%{state.result.confidence}</span>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed text-xl">
                  {state.result.description}
                </p>

                {state.result.sources.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-gray-800/50">
                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest">روابط التحقق</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {state.result.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-5 py-4 bg-gray-900/60 hover:bg-red-900/10 text-gray-300 rounded-xl transition-all border border-gray-800"
                        >
                          <span className="truncate font-bold text-sm">{source.title}</span>
                          <ExternalLink className="w-4 h-4 text-red-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-black/60 p-6 flex justify-center">
                <button
                  onClick={resetSearch}
                  className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-black text-sm transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                  اكتشاف مشهد آخر
                </button>
              </div>
            </div>
          </div>
        )}
      </CinemaHall>
      
      <footer className="mt-20 text-center pb-10">
        <p className="text-gray-600 text-sm">© {new Date().getFullYear()} كاشف الأفلام الذكي | الجيل الثالث</p>
        <p className="mt-2 text-red-900 font-bold uppercase text-[10px]">صنع باحترافية - اميراتي</p>
        <div className="mt-4 space-y-1 opacity-30 decorative-text text-gray-400">
          <p className="text-sm italic">
            <span className="text-red-600/80">اللهم</span> عجل لوليك الفرج
          </p>
          <p className="text-xs">
            <span className="text-red-600/80">اللهم</span> صلي على محمد وآل محمد
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
