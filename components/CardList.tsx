
import React from 'react';
import { Card } from '../types.ts';
import PlusIcon from './icons/PlusIcon.tsx';
import { CARD_TYPE_CONFIG } from '../constants.ts';

interface CardListProps {
  cards: Card[];
  onSelectCard: (id: string) => void;
  onAddCard: () => void;
}

const CardListItem: React.FC<{ card: Card; onClick: () => void }> = ({ card, onClick }) => (
  <li
    onClick={onClick}
    className="bg-gray-800 rounded-xl shadow-lg p-5 cursor-pointer hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
  >
    <h3 className="text-xl font-bold text-white truncate">{card.name}</h3>
    <p className="text-sm text-gray-400 mt-1">{CARD_TYPE_CONFIG[card.type].name}</p>
  </li>
);

const CardList: React.FC<CardListProps> = ({ cards, onSelectCard, onAddCard }) => {
  return (
    <div className="p-4 md:p-6 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">My Cards</h1>
      </header>
      
      {cards.length > 0 ? (
        <ul className="space-y-4">
          {cards.map((card) => (
            <CardListItem key={card.id} card={card} onClick={() => onSelectCard(card.id)} />
          ))}
        </ul>
      ) : (
        <div className="text-center py-20 px-4">
          <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-300">No cards yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new gift or merchandise card.</p>
          <div className="mt-6">
            <button
              onClick={onAddCard}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add New Card
            </button>
          </div>
        </div>
      )}
      
      {cards.length > 0 && (
        <button
          onClick={onAddCard}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-transform transform hover:scale-110"
          aria-label="Add new card"
        >
          <PlusIcon className="h-8 w-8" />
        </button>
      )}
    </div>
  );
};

export default CardList;