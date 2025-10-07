import React from 'react';
import { Card } from '../types.js';
import { CARD_TYPE_CONFIG } from '../constants.js';
import Barcode from './Barcode.js';
import ChevronLeftIcon from './icons/ChevronLeftIcon.js';
import TrashIcon from './icons/TrashIcon.js';

interface CardDetailProps {
  card: Card;
  onBack: () => void;
  onDelete: (id: string) => void;
}

const CardDetail: React.FC<CardDetailProps> = ({ card, onBack, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${card.name}"? This action cannot be undone.`)) {
      onDelete(card.id);
    }
  };

  const cardConfig = CARD_TYPE_CONFIG[card.type];

  return (
    <div className="p-4 md:p-6 min-h-screen">
       <header className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300">
          <ChevronLeftIcon className="h-6 w-6" />
          <span className="font-bold">Back</span>
        </button>
        <button onClick={handleDelete} className="text-red-500 hover:text-red-400">
          <TrashIcon className="h-6 w-6" />
        </button>
      </header>

      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2 text-white">{card.name}</h2>
        <p className="text-sm text-gray-400 text-center mb-6">{cardConfig.name}</p>

        <div className="space-y-8">
          <div>
            <p className="text-gray-300 text-sm font-semibold mb-2 ml-2">{cardConfig.barcodeLabels[0]}</p>
            <div className="bg-gray-900 rounded-lg p-2">
              <Barcode value={card.barcode1} />
            </div>
          </div>

          {card.barcode2 && cardConfig.barcodeCount > 1 && (
            <div>
              <p className="text-gray-300 text-sm font-semibold mb-2 ml-2">{cardConfig.barcodeLabels[1]}</p>
              <div className="bg-gray-900 rounded-lg p-2">
                <Barcode value={card.barcode2} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDetail;