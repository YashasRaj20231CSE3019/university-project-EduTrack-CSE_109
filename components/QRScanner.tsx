
import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { X, Camera, CheckCircle2, XCircle, Zap, ShieldCheck } from 'lucide-react';

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
    // Ensure the container is empty before rendering to prevent double UI
    const container = document.getElementById("qr-reader");
    if (container) {
      container.innerHTML = "";
    }

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true
      },
      /* verbose= */ false
    );

    scanner.render(onScan, onScanError);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => {
          console.warn("Failed to clear scanner on unmount", err);
        });
      }
    };
  }, []);

  const isVerifyingRef = useRef(false);

  const onScan = async (decodedText: string) => {
    if (isVerifyingRef.current) return;
    
    isVerifyingRef.current = true;
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
          isVerifyingRef.current = false;
          setSuccessMessage(null);
        }, 2000);
      } else {
        setError(data.message);
        setIsVerifying(false);
        isVerifyingRef.current = false;
        setScanResult(null);
      }
    } catch (err: any) {
      console.error('Verification failed:', err);
      setError(err.message || 'Network error. Please try again.');
      setIsVerifying(false);
      isVerifyingRef.current = false;
      setScanResult(null);
    }
  };

  const onScanError = (err: any) => {
    // console.warn(err);
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-start p-4 md:p-8 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative animate-in zoom-in slide-in-from-bottom-8 duration-500 overflow-hidden flex flex-col my-auto">
        <div className="p-8 md:p-12 bg-indigo-600 text-white relative text-center shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 md:top-8 md:right-8 z-[100] w-10 h-10 md:w-12 md:h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-xl hover:bg-slate-50 transition-all active:scale-90"
            aria-label="Close scanner"
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-4 md:mb-6"><Camera className="w-8 h-8 md:w-10 md:h-10" /></div>
          <h3 className="text-2xl md:text-3xl font-black mb-1 md:mb-2">Attendance Scanner</h3>
          <p className="text-xs md:text-sm font-medium opacity-80">Scan student QR codes to mark attendance</p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        </div>

        <div className="p-6 md:p-10 space-y-6 md:space-y-8 overflow-y-auto">
          <div className="relative rounded-[2.5rem] bg-slate-50 shadow-inner border-4 border-slate-100">
            <div id="qr-reader" className="w-full overflow-hidden rounded-[2.2rem]"></div>
            
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
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce"><CheckCircle2 className="w-10 h-10" /></div>
                      <p className="text-xl font-black text-emerald-600">{successMessage}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ready for next scan</p>
                    </>
                  )}
                  
                  {error && (
                    <>
                      <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto animate-shake"><XCircle className="w-10 h-10" /></div>
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
              <Zap className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest mb-1">Fast Scanning</p>
                <p className="text-[10px] font-bold text-indigo-700 leading-relaxed">
                  Hold the student's phone steady in front of the camera.
                </p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-slate-600 shrink-0" />
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
