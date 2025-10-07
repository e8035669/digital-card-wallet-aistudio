import { CardType } from './types.ts';

interface CardTypeConfig {
  name: string;
  barcodeCount: number;
  barcodeLabels: string[];
}

export const CARD_TYPE_CONFIG: Record<CardType, CardTypeConfig> = {
  [CardType.SevenEleven]: {
    name: '7-Eleven Merchandise Card',
    barcodeCount: 2,
    barcodeLabels: ['Barcode 1 (31-xxxxxxxxxxxx)', 'Barcode 2 (xxxxxxxxxxxxxxxx)'],
  },
  [CardType.Library]: {
    name: 'Library Card',
    barcodeCount: 1,
    barcodeLabels: ['Library Card Number'],
  },
  [CardType.Generic]: {
    name: 'Generic Card',
    barcodeCount: 1,
    barcodeLabels: ['Barcode'],
  },
};