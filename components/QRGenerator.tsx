
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Student } from '../types';
import { apiService } from '../services/apiService';
import { X, Smartphone, AlertTriangle, ShieldAlert } from 'lucide-react';

interface QRGeneratorProps {
  student: Student;
  onClose: () => void;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ student, onClose }) => {
  const [token, setToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async () => {
    try {
      setIsLoading(true);
      const newToken = await apiService.getQRToken(student.id);
      setToken(newToken);
      setTimeLeft(30);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch QR token:', err);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [student.id]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-start p-4 md:p-8 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 flex flex-col my-auto">
        <div className="p-10 bg-indigo-600 text-white relative text-center shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 md:top-8 md:right-8 z-[100] w-10 h-10 md:w-12 md:h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-xl hover:bg-slate-50 transition-all active:scale-90"
            aria-label="Close QR code"
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Smartphone className="w-10 h-10" /></div>
          <h3 className="text-3xl font-black mb-2">My Attendance QR</h3>
          <p className="text-sm font-medium opacity-80">Show this to your teacher to mark attendance</p>
        </div>

        <div className="p-10 flex flex-col items-center gap-8 overflow-y-auto">
          <div className="relative p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
            {isLoading && !token ? (
              <div className="w-64 h-64 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : token ? (
              <div className="relative">
                <QRCodeSVG 
                  value={token} 
                  size={256} 
                  level="H"
                  includeMargin={true}
                  className="rounded-2xl"
                />
                {timeLeft < 5 && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center rounded-2xl animate-pulse">
                    <p className="text-indigo-600 font-black text-sm uppercase tracking-widest">Refreshing...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-64 h-64 flex flex-col items-center justify-center text-center p-6">
                <AlertTriangle className="w-10 h-10 text-rose-500 mb-4" />
                <p className="text-sm font-bold text-slate-500">{error}</p>
                <button 
                  onClick={fetchToken}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Token</span>
              <span className={`text-xs font-black ${timeLeft < 10 ? 'text-rose-500' : 'text-indigo-600'} transition-colors`}>
                REFRESHES IN {timeLeft}S
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 10 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Anti-Cheat Protection</p>
              <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                This QR code is dynamic and expires every 30 seconds. Screenshots or shared codes will not be accepted by the scanner.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
