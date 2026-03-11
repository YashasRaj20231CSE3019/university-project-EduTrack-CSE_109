
import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface QRScannerProps {
  teacher: User;
  onScanSuccess: (studentId: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ teacher, onScanSuccess, onClose }) => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
      },
      /* verbose= */ false
    );

    scanner.render(onScan, onScanError);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, []);

  const onScan = async (decodedText: string) => {
    if (isVerifying) return;
    
    setScanResult(decodedText);
    setIsVerifying(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const data = await apiService.verifyQR(decodedText, teacher.id);

      if (data.success) {
        setSuccessMessage(data.message || "Attendance marked successfully!");
        onScanSuccess(data.studentId);
        // Play success sound if possible
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
        audio.play().catch(() => {});
        
        // Reset after 2 seconds to allow next scan
        setTimeout(() => {
          setScanResult(null);
          setIsVerifying(false);
          setSuccessMessage(null);
        }, 2000);
      } else {
        setError(data.message);
        setIsVerifying(false);
        setScanResult(null);
      }
    } catch (err: any) {
      console.error('Verification failed:', err);
      setError(err.message || 'Network error. Please try again.');
      setIsVerifying(false);
      setScanResult(null);
    }
  };

  const onScanError = (err: any) => {
    // console.warn(err);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
        <div className="p-10 bg-indigo-600 text-white relative text-center">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center font-bold text-xl transition-all"
          >
            ×
          </button>
          <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6">📷</div>
          <h3 className="text-3xl font-black mb-2">Attendance Scanner</h3>
          <p className="text-sm font-medium opacity-80">Scan student QR codes to mark attendance</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-slate-100 bg-slate-50 shadow-inner">
            <div id="qr-reader" className="w-full"></div>
            
            {(isVerifying || successMessage || error) && (
              <div className="absolute inset-0 z-10 flex items-center justify-center p-8 bg-white/90 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="text-center space-y-4">
                  {isVerifying && !successMessage && !error && (
                    <>
                      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm font-black text-indigo-600 uppercase tracking-widest">Verifying Token...</p>
                    </>
                  )}
                  
                  {successMessage && (
                    <>
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto animate-bounce">✅</div>
                      <p className="text-xl font-black text-emerald-600">{successMessage}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ready for next scan</p>
                    </>
                  )}
                  
                  {error && (
                    <>
                      <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-4xl mx-auto animate-shake">❌</div>
                      <p className="text-xl font-black text-rose-600">{error}</p>
                      <button 
                        onClick={() => { setError(null); setIsVerifying(false); }}
                        className="px-8 py-3 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-100"
                      >
                        Try Again
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-4">
              <span className="text-xl">⚡</span>
              <div>
                <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest mb-1">Fast Scanning</p>
                <p className="text-[10px] font-bold text-indigo-700 leading-relaxed">
                  Hold the student's phone steady in front of the camera.
                </p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
              <span className="text-xl">🛡️</span>
              <div>
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Secure Validation</p>
                <p className="text-[10px] font-bold text-slate-700 leading-relaxed">
                  Tokens are validated in real-time against the server.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
