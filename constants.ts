import { CardType } from './types';

interface CardTypeConfig {
  name: string;
  barcodeCount: number;
  barcodeLabels: string[];
}

export const CARD_TYPE_CONFIG: Record<CardType, CardTypeConfig> = {
  [CardType.SevenEleven]: {
    name: '7-Eleven 商品卡',
    barcodeCount: 2,
    barcodeLabels: ['條碼 1（31-xxxxxxxxxxxx）', '條碼 2（xxxxxxxxxxxxxxxx）'],
  },
  [CardType.Library]: {
    name: '圖書館借書證',
    barcodeCount: 1,
    barcodeLabels: ['借書證號碼'],
  },
  [CardType.Generic]: {
    name: '一般卡片',
    barcodeCount: 1,
    barcodeLabels: ['條碼'],
  },
};