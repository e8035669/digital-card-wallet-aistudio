
import React, { useState, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage.ts';
import { Card } from './types.ts';
import CardList from './components/CardList.tsx';
import AddCard from './components/AddCard.tsx';
import CardDetail from './components/CardDetail.tsx';

type View = 'list' | 'add' | 'detail';

function App() {
  const [cards, setCards] = useLocalStorage<Card[]>('digital-wallet-cards', []);
  const [view, setView] = useState<View>('list');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleAddCard = () => {
    setView('add');
  };

  const handleSelectCard = (id: string) => {
    setSelectedCardId(id);
    setView('detail');
  };

  const handleSaveCard = (newCardData: Omit<Card, 'id' | 'createdAt'>) => {
    const newCard: Card = {
      ...newCardData,
      id: `card_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCards([...cards, newCard]);
    setView('list');
  };
  
  const handleDeleteCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
    setView('list');
    setSelectedCardId(null);
  }

  const handleBack = () => {
    setView('list');
    setSelectedCardId(null);
  };
  
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [cards]);

  const renderContent = () => {
    if (view === 'add') {
      return <AddCard onSave={handleSaveCard} onCancel={handleBack} />;
    }
    if (view === 'detail' && selectedCardId) {
      const selectedCard = cards.find(card => card.id === selectedCardId);
      if (selectedCard) {
        return <CardDetail card={selectedCard} onBack={handleBack} onDelete={handleDeleteCard} />;
      }
    }
    return <CardList cards={sortedCards} onAddCard={handleAddCard} onSelectCard={handleSelectCard} />;
  };

  return (
    <div className="antialiased font-sans bg-gray-900 text-white min-h-screen">
      <main className="max-w-2xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;