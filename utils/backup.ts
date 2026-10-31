import { Card, CardType } from '../types';

export const BACKUP_APP_ID = 'digital-card-wallet';
export const BACKUP_VERSION = 1;

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  version: number;
  exportedAt: string;
  cards: Card[];
}

export interface ParsedBackup {
  cards: Card[];
  skipped: number;
}

const CARD_TYPES = new Set<string>(Object.values(CardType));

export const createBackup = (cards: Card[]): BackupFile => ({
  app: BACKUP_APP_ID,
  version: BACKUP_VERSION,
  exportedAt: new Date().toISOString(),
  cards,
});

export const getBackupFileName = (date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
  return `digital-wallet-backup-${stamp}.json`;
};

export const downloadBackup = (cards: Card[]): void => {
  const blob = new Blob([JSON.stringify(createBackup(cards), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = getBackupFileName();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const normalizeCard = (raw: unknown): Card | null => {
  if (typeof raw !== 'object' || raw === null) return null;
  const c = raw as Record<string, unknown>;
  if (typeof c.id !== 'string' || !c.id) return null;
  if (typeof c.name !== 'string') return null;
  if (typeof c.type !== 'string' || !CARD_TYPES.has(c.type)) return null;
  if (typeof c.barcode1 !== 'string' || !c.barcode1) return null;
  const barcode2 = typeof c.barcode2 === 'string' && c.barcode2 ? c.barcode2 : null;
  const createdAt =
    typeof c.createdAt === 'string' && !Number.isNaN(new Date(c.createdAt).getTime())
      ? c.createdAt
      : new Date().toISOString();
  return { id: c.id, name: c.name, type: c.type as CardType, barcode1: c.barcode1, barcode2, createdAt };
};

// 接受備份物件或純卡片陣列；無法辨識時丟出錯誤。
export const parseBackup = (text: string): ParsedBackup => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('檔案不是有效的 JSON 格式。');
  }

  let rawCards: unknown;
  if (Array.isArray(data)) {
    rawCards = data;
  } else if (typeof data === 'object' && data !== null && (data as BackupFile).app === BACKUP_APP_ID) {
    const version = (data as BackupFile).version;
    if (typeof version !== 'number' || version > BACKUP_VERSION) {
      throw new Error('此備份來自較新的版本，請先更新應用程式。');
    }
    rawCards = (data as BackupFile).cards;
  } else {
    throw new Error('這不是本應用程式的備份檔。');
  }

  if (!Array.isArray(rawCards)) {
    throw new Error('備份檔中找不到卡片資料。');
  }

  const seenIds = new Set<string>();
  const cards: Card[] = [];
  let skipped = 0;
  for (const raw of rawCards) {
    const card = normalizeCard(raw);
    if (!card || seenIds.has(card.id)) {
      skipped++;
      continue;
    }
    seenIds.add(card.id);
    cards.push(card);
  }

  if (cards.length === 0 && rawCards.length > 0) {
    throw new Error('備份檔中沒有任何有效的卡片。');
  }
  return { cards, skipped };
};

const contentKey = (c: Card) => `${c.type}|${c.barcode1}|${c.barcode2 ?? ''}`;

// 合併：id 或內容（類型＋條碼）相同的卡片視為重複，保留現有資料。
export const mergeCards = (current: Card[], incoming: Card[]): { merged: Card[]; added: number } => {
  const ids = new Set(current.map(c => c.id));
  const keys = new Set(current.map(contentKey));
  const added: Card[] = [];
  for (const card of incoming) {
    if (ids.has(card.id) || keys.has(contentKey(card))) continue;
    ids.add(card.id);
    keys.add(contentKey(card));
    added.push(card);
  }
  return { merged: [...current, ...added], added: added.length };
};
