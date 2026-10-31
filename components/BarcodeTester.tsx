import React, { useEffect, useState } from 'react';
import ChevronLeftIcon from './icons/ChevronLeftIcon';

declare var Html5Qrcode: any;
declare var Html5QrcodeSupportedFormats: Record<string, number>;

interface BarcodeTesterProps {
  onBack: () => void;
}

interface ScanEntry {
  id: number;
  text: string;
  format: string;
  count: number;
  firstAt: string;
  lastAt: string;
}

const FORMAT_OPTIONS = [
  'CODE_128',
  'CODE_39',
  'CODE_93',
  'CODABAR',
  'ITF',
  'EAN_13',
  'EAN_8',
  'UPC_A',
  'UPC_E',
  'RSS_14',
  'RSS_EXPANDED',
  'QR_CODE',
];

const HISTORY_LIMIT = 30;

const formatTime = (d: Date) =>
  `${d.toLocaleTimeString('zh-TW', { hour12: false })}.${String(d.getMilliseconds()).padStart(3, '0')}`;

// Reveals invisible characters (spaces, control chars) that make results look identical but differ.
const toHex = (text: string) =>
  Array.from(text)
    .map(ch => ch.codePointAt(0)!.toString(16).toUpperCase().padStart(2, '0'))
    .join(' ');

const BarcodeTester: React.FC<BarcodeTesterProps> = ({ onBack }) => {
  const [running, setRunning] = useState(true);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!running) return;
    setError(null);

    const config: Record<string, unknown> = { verbose: false };
    if (selectedFormats.length > 0) {
      config.formatsToSupport = selectedFormats.map(name => Html5QrcodeSupportedFormats[name]);
    }
    const html5QrCode = new Html5Qrcode('barcode-tester-reader', config);
    let nextId = 0;

    const startPromise: Promise<unknown> = html5QrCode
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const width = Math.floor(viewfinderWidth * 0.8);
            const height = Math.floor(Math.min(viewfinderHeight * 0.6, width * 0.6));
            return { width, height };
          },
        },
        (decodedText: string, decodedResult: any) => {
          const format: string =
            decodedResult?.result?.format?.formatName ?? decodedResult?.result?.format?.format ?? 'UNKNOWN';
          const now = formatTime(new Date());
          setHistory(prev => {
            const [latest, ...rest] = prev;
            if (latest && latest.text === decodedText && latest.format === format) {
              return [{ ...latest, count: latest.count + 1, lastAt: now }, ...rest];
            }
            return [
              { id: Date.now() + nextId++, text: decodedText, format, count: 1, firstAt: now, lastAt: now },
              ...prev,
            ].slice(0, HISTORY_LIMIT);
          });
        },
        () => {}
      )
      .catch((err: unknown) => {
        console.error('Unable to start scanner', err);
        setError('無法啟動相機，請確認已授權相機權限，且使用 HTTPS 或 localhost。');
        setRunning(false);
      });

    return () => {
      // Wait for start() to settle so StrictMode's mount/unmount/mount doesn't race.
      (async () => {
        try { await startPromise; } catch { /* already handled */ }
        if (html5QrCode.isScanning) {
          try {
            await html5QrCode.stop();
          } catch (err) {
            console.error('Error stopping scanner', err);
          }
        }
        try { html5QrCode.clear(); } catch { /* element may be gone */ }
      })();
    };
  }, [running, selectedFormats]);

  const toggleFormat = (name: string) => {
    setSelectedFormats(prev => (prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]));
  };

  const latest = history[0];

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <header className="flex items-center mb-6">
        <button onClick={onBack} className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300">
          <ChevronLeftIcon className="h-6 w-6" />
          <span className="font-bold">返回</span>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-white pr-16">條碼測試器</h1>
      </header>

      <div className="space-y-6">
        <section className="bg-gray-800 rounded-xl shadow-lg p-5">
          <div
            id="barcode-tester-reader"
            className={`w-full rounded-lg overflow-hidden ${running ? '' : 'hidden'}`}
          ></div>
          {!running && <p className="text-sm text-gray-400 text-center py-8">掃描已停止</p>}
          {error && (
            <p role="alert" className="mt-3 text-sm rounded-md p-3 bg-red-900/50 text-red-200">
              {error}
            </p>
          )}
          <button
            onClick={() => setRunning(r => !r)}
            className={`mt-4 w-full px-4 py-2 rounded-md text-sm font-medium text-white ${
              running ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {running ? '停止掃描' : '開始掃描'}
          </button>
        </section>

        <section className="bg-gray-800 rounded-xl shadow-lg p-5">
          <h2 className="text-lg font-bold text-white">限定格式</h2>
          <p className="text-sm text-gray-400 mt-1">
            未選取時辨識所有格式（與新增卡片相同）。變更後會自動重新啟動相機。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map(name => {
              const active = selectedFormats.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => toggleFormat(name)}
                  aria-pressed={active}
                  className={`px-3 py-1 rounded-full text-xs font-mono ${
                    active ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-gray-800 rounded-xl shadow-lg p-5">
          <h2 className="text-lg font-bold text-white">最新結果</h2>
          {latest ? (
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-gray-400">格式</dt>
                <dd className="font-mono text-indigo-300">{latest.format}</dd>
              </div>
              <div>
                <dt className="text-gray-400">內容（{Array.from(latest.text).length} 字元）</dt>
                <dd className="font-mono text-white break-all">{latest.text}</dd>
              </div>
              <div>
                <dt className="text-gray-400">十六進位</dt>
                <dd className="font-mono text-gray-300 break-all">{toHex(latest.text)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-gray-400 mt-2">尚未掃描到條碼。</p>
          )}
        </section>

        <section className="bg-gray-800 rounded-xl shadow-lg p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">掃描紀錄</h2>
            <button
              onClick={() => setHistory([])}
              disabled={history.length === 0}
              className="text-sm text-gray-300 hover:text-white disabled:opacity-50"
            >
              清除
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            連續讀到相同內容與格式會合併並累計次數；結果不一致時會分成多筆，方便比對。
          </p>
          <ul className="mt-3 space-y-2">
            {history.map(entry => (
              <li key={entry.id} className="bg-gray-900 rounded-md p-3 text-sm">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-mono text-indigo-300">{entry.format}</span>
                  <span>
                    ×{entry.count}　{entry.firstAt}
                    {entry.count > 1 && ` ~ ${entry.lastAt}`}
                  </span>
                </div>
                <p className="mt-1 font-mono text-white break-all">{entry.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default BarcodeTester;
