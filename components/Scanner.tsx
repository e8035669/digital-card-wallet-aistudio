
import React, { useEffect, useRef } from 'react';

declare var Html5Qrcode: any;

interface ScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-code-reader");
    scannerRef.current = html5QrCode;
    let cancelled = false;
    let startPromise: Promise<unknown> | null = null;

    const stopScanner = async () => {
      // Wait for start() to settle so StrictMode's mount/unmount/mount doesn't race.
      try { await startPromise; } catch { /* start failure already logged */ }
      if (html5QrCode.isScanning) {
        try {
          await html5QrCode.stop();
        } catch (err) {
          console.error("Error stopping scanner", err);
        }
      }
    };

    startPromise = html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          // Size the scan box relative to the actual video so the frame stays inside the preview.
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const width = Math.floor(viewfinderWidth * 0.8);
            const height = Math.floor(Math.min(viewfinderHeight * 0.6, width * 0.6));
            return { width, height };
          },
        },
        (decodedText: string) => {
          if (cancelled) return;
          cancelled = true;
          onScanSuccess(decodedText);
          stopScanner();
        },
        () => {}
      )
      .catch((err: unknown) => {
        console.error("Unable to start scanner", err);
      });

    return () => {
      cancelled = true;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
      <div id="qr-code-reader" className="w-full max-w-md rounded-lg"></div>
      <p className="mt-4 text-gray-300">請將相機對準條碼</p>
      <button
        onClick={onClose}
        className="mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 transition-colors"
      >
        取消掃描
      </button>
    </div>
  );
};

export default Scanner;
