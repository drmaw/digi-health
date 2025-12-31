
import React, { useEffect, useRef, useState } from 'react';

interface QRScannerModalProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Unable to access camera. Please ensure permissions are granted.");
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Simple simulation for demo purposes
  // In a production app, we would use a library like html5-qrcode or jsqr here
  const simulateScan = () => {
    const mockHealthId = "1002003004"; // Rahim Ahmed's ID from mockData (numeric only)
    onScan(mockHealthId);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">QR Scanner</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Scan Patient Health Card</p>
          </div>
          <button onClick={onClose} className="ui-btn ui-btn-outline w-10 h-10 p-0 rounded-full">✖</button>
        </div>

        <div className="aspect-square bg-black relative">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 text-white space-y-4">
              <span className="text-4xl">⚠️</span>
              <p className="font-bold">{error}</p>
              <button onClick={onClose} className="ui-btn ui-btn-primary bg-white text-slate-900 px-6 py-2">Go Back</button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-[40px] border-black/40">
                <div className="w-full h-full border-2 border-emerald-500 rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-lg"></div>
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-emerald-500/50 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-8 space-y-4 bg-slate-50">
          <p className="text-xs text-slate-500 text-center font-medium leading-relaxed">
            Position the patient's QR code within the frame to automatically scan and retrieve their medical records.
          </p>
          <button 
            onClick={simulateScan}
            className="w-full ui-btn ui-btn-outline border-emerald-200 text-emerald-700 hover:bg-emerald-50 py-4 font-black uppercase text-[10px] tracking-[0.2em]"
          >
            Simulate Scan (Demo)
          </button>
        </div>
      </div>
    </div>
  );
};
