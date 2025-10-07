import React, { useEffect, useRef } from 'react';

declare var Html5Qrcode: any;

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const qrCodeRegionId = "qr-code-reader";
    
    const html5QrCode = new Html5Qrcode(qrCodeRegionId);
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 }
          },
          (decodedText: string, decodedResult: any) => {
            onScanSuccess(decodedText);
            stopScanner();
          },
          (errorMessage: string) => {
            // handle scan error
          }
        );
      } catch (err) {
        console.error("Unable to start scanner", err);
      }
    };
    
    const stopScanner = async () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch(err) {
          console.error("Error stopping scanner", err);
        }
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
      <div id="qr-code-reader" className="w-full max-w-md aspect-video rounded-lg overflow-hidden"></div>
      <p className="mt-4 text-gray-300">Point your camera at the barcode</p>
      <button
        onClick={onClose}
        className="mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition-colors"
      >
        Cancel Scan
      </button>
    </div>
  );
};

export default Scanner;