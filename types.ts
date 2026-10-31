export enum CardType {
  SevenEleven = 'SEVEN_ELEVEN',
  Library = 'LIBRARY',
  Generic = 'GENERIC',
  FamilyMartGift = 'FAMILY_MART_GIFT',
  GenericGift = 'GENERIC_GIFT',
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  barcode1: string;
  barcode2: string | null; // For cards that might only have one barcode
  createdAt: string;
}