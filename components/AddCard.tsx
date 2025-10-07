import React, { useState, useRef, useEffect } from 'react';
import { Card, CardType } from '../types';
import { CARD_TYPE_CONFIG } from '../constants';
import Scanner from './Scanner';

declare var Html5Qrcode: any;

interface AddCardProps {
  onSave: (card: Omit<Card, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const AddCard: React.FC<AddCardProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [cardType, setCardType] = useState<CardType>(CardType.SevenEleven);
  const [barcode1, setBarcode1] = useState('');
  const [barcode2, setBarcode2] = useState('');
  
  const [activeScanTarget, setActiveScanTarget] = useState<null | 'barcode1' | 'barcode2'>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showScanOptions, setShowScanOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    const dummyElementId = 'html5-qrcode-file-scanner';
    let dummyElement = document.getElementById(dummyElementId);
    if (!dummyElement) {
        dummyElement = document.createElement('div');
        dummyElement.id = dummyElementId;
        dummyElement.style.display = 'none';
        document.body.appendChild(dummyElement);
    }
    
    if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(dummyElementId);
    }
  }, []);

  const cardConfig = CARD_TYPE_CONFIG[cardType];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !barcode1.trim() || (cardConfig.barcodeCount > 1 && !barcode2.trim())) {
      alert('Please fill in all fields.');
      return;
    }
    onSave({
      name,
      type: cardType,
      barcode1,
      barcode2: cardConfig.barcodeCount > 1 ? barcode2 : null,
    });
  };

  const handleScanRequest = (target: 'barcode1' | 'barcode2') => {
    setActiveScanTarget(target);
    setShowScanOptions(true);
  };
  
  const handleScanSuccess = (decodedText: string) => {
    if (activeScanTarget === 'barcode1') {
      setBarcode1(decodedText);
    } else if (activeScanTarget === 'barcode2') {
      setBarcode2(decodedText);
    }
    setIsCameraOpen(false);
    setShowScanOptions(false);
    setActiveScanTarget(null);
  };
  
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowScanOptions(false);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const decodedText = await html5QrCodeRef.current.scanFile(file, false);
        handleScanSuccess(decodedText);
      } catch (err) {
        console.error('Error scanning file:', err);
        alert('Could not find a barcode in the selected image. Please try another one.');
        setActiveScanTarget(null);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } else {
        setActiveScanTarget(null);
    }
  };

  const ScanOptionsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-xs text-center transform transition-all">
        <h3 className="text-xl font-bold mb-6 text-white">Choose Scan Method</h3>
        <div className="space-y-4">
          <button
            onClick={() => {
              setShowScanOptions(false);
              setIsCameraOpen(true);
            }}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span>Use Camera</span>
          </button>
          <button
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="w-full bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Upload Image</span>
          </button>
        </div>
        <button
          onClick={() => {
            setShowScanOptions(false);
            setActiveScanTarget(null);
          }}
          className="mt-6 text-gray-400 hover:text-white text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isCameraOpen && activeScanTarget && (
        <Scanner
          onScanSuccess={handleScanSuccess}
          onClose={() => {
            setIsCameraOpen(false);
            setActiveScanTarget(null);
          }}
        />
      )}
      
      {showScanOptions && <ScanOptionsModal />}
      
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileScan}
      />

      <div className="p-4 md:p-6 min-h-screen">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Add New Card</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          <div>
            <label htmlFor="card-type" className="block text-sm font-medium text-gray-300">
              Card Type
            </label>
            <select
              id="card-type"
              value={cardType}
              onChange={(e) => setCardType(e.target.value as CardType)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {Object.entries(CARD_TYPE_CONFIG).map(([key, { name }]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="card-name" className="block text-sm font-medium text-gray-300">
              Card Name (e.g., "My Library Card")
            </label>
            <input
              type="text"
              id="card-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border-gray-600 bg-gray-800 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              required
            />
          </div>

          {/* Barcode 1 */}
          <div>
            <label htmlFor="barcode1" className="block text-sm font-medium text-gray-300">
              {cardConfig.barcodeLabels[0]}
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="barcode1"
                value={barcode1}
                onChange={(e) => setBarcode1(e.target.value)}
                className="flex-1 block w-full rounded-none rounded-l-md border-gray-600 bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                required
              />
              <button
                type="button"
                onClick={() => handleScanRequest('barcode1')}
                className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
              >
                Scan
              </button>
            </div>
          </div>
          
          {/* Barcode 2 */}
          {cardConfig.barcodeCount > 1 && (
            <div>
              <label htmlFor="barcode2" className="block text-sm font-medium text-gray-300">
                {cardConfig.barcodeLabels[1]}
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="barcode2"
                  value={barcode2}
                  onChange={(e) => setBarcode2(e.target.value)}
                  className="flex-1 block w-full rounded-none rounded-l-md border-gray-600 bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleScanRequest('barcode2')}
                  className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                >
                  Scan
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              Save Card
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddCard;