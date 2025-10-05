export enum CardType {
  SevenEleven = 'SEVEN_ELEVEN',
  Library = 'LIBRARY',
  Generic = 'GENERIC',
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  barcode1: string;
  barcode2: string | null; // For cards that might only have one barcode
  createdAt: string;
}