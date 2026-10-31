import React, { useRef, useState } from 'react';
import { Card } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import { downloadBackup, mergeCards, parseBackup, ParsedBackup } from '../utils/backup';

interface SettingsProps {
  cards: Card[];
  onBack: () => void;
  onRestore: (cards: Card[]) => void;
  onOpenBarcodeTester: () => void;
}

type Notice = { kind: 'success' | 'error'; text: string };

const Settings: React.FC<SettingsProps> = ({ cards, onBack, onRestore, onOpenBarcodeTester }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<ParsedBackup | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const handleBackup = () => {
    downloadBackup(cards);
    setNotice({ kind: 'success', text: `已匯出 ${cards.length} 張卡片。請妥善保管備份檔，內含所有條碼資料。` });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setNotice(null);
    setPending(null);
    try {
      setPending(parseBackup(await file.text()));
    } catch (err) {
      setNotice({ kind: 'error', text: err instanceof Error ? err.message : '讀取備份檔失敗。' });
    }
  };

  const handleMerge = () => {
    if (!pending) return;
    const { merged, added } = mergeCards(cards, pending.cards);
    onRestore(merged);
    setPending(null);
    setNotice({ kind: 'success', text: `合併完成：新增 ${added} 張，略過 ${pending.cards.length - added} 張重複卡片。` });
  };

  const handleReplace = () => {
    if (!pending) return;
    if (!window.confirm(`將以備份的 ${pending.cards.length} 張卡片取代目前的 ${cards.length} 張卡片，此操作無法復原。確定要繼續嗎？`)) {
      return;
    }
    onRestore(pending.cards);
    setPending(null);
    setNotice({ kind: 'success', text: `還原完成：目前共 ${pending.cards.length} 張卡片。` });
  };

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <header className="flex items-center mb-8">
        <button onClick={onBack} className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300">
          <ChevronLeftIcon className="h-6 w-6" />
          <span className="font-bold">返回</span>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-white pr-16">設定</h1>
      </header>

      <div className="space-y-6">
        <section className="bg-gray-800 rounded-xl shadow-lg p-5">
          <h2 className="text-lg font-bold text-white">備份</h2>
          <p className="text-sm text-gray-400 mt-1">
            將目前 {cards.length} 張卡片匯出為 JSON 檔，可用於更換裝置或清除瀏覽器資料前保存。
          </p>
          <button
            onClick={handleBackup}
            disabled={cards.length === 0}
            className="mt-4 w-full px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            匯出備份
          </button>
        </section>

        <section className="bg-gray-800 rounded-xl shadow-lg p-5">
          <h2 className="text-lg font-bold text-white">還原</h2>
          <p className="text-sm text-gray-400 mt-1">從先前匯出的備份檔還原卡片。</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 w-full px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-600 hover:bg-gray-500"
          >
            選擇備份檔
          </button>

          {pending && (
            <div className="mt-4 border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-200">
                備份檔內含 <span className="font-bold">{pending.cards.length}</span> 張有效卡片
                {pending.skipped > 0 && <span className="text-yellow-400">（另有 {pending.skipped} 筆無效或重複資料將被忽略）</span>}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <button
                  onClick={handleMerge}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  合併到現有卡片（保留現有，僅新增缺少的）
                </button>
                <button
                  onClick={handleReplace}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  覆蓋全部現有卡片
                </button>
                <button
                  onClick={() => setPending(null)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="bg-gray-800 rounded-xl shadow-lg p-5">
          <h2 className="text-lg font-bold text-white">條碼測試器</h2>
          <p className="text-sm text-gray-400 mt-1">掃描條碼並顯示內容與格式，用於除錯條碼讀取結果不一致的問題。</p>
          <button
            onClick={onOpenBarcodeTester}
            className="mt-4 w-full px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-600 hover:bg-gray-500"
          >
            開啟條碼測試器
          </button>
        </section>

        {notice && (
          <p
            role={notice.kind === 'error' ? 'alert' : 'status'}
            className={`text-sm rounded-md p-3 ${notice.kind === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}
          >
            {notice.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Settings;
