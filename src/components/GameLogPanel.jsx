import React, { useState, useEffect, useRef } from 'react';
import { History, ChevronDown, ChevronUp, Vote, Info, User } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const GameLogPanel = ({ clueLogs, voteLogs }) => {
  const [isOpen, setIsOpen] = useState(true);
  const logEndRef = useRef(null);

  const toggleOpen = () => {
    soundEngine.playClick();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (logEndRef.current && isOpen) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [clueLogs, voteLogs, isOpen]);

  const allLogs = [
    ...clueLogs.map(c => ({ type: 'CLUE', ...c })),
    ...voteLogs.map(v => ({ type: 'VOTE', ...v }))
  ];

  return (
    <div className="fixed bottom-4 left-4 z-30 max-w-[calc(100vw-2rem)] sm:max-w-sm">
      <div className={`glass-panel rounded-2xl border border-zinc-800 shadow-2xl transition-all duration-300 overflow-hidden ${
        isOpen ? 'w-80 sm:w-88' : 'w-auto'
      }`}>
        {/* Panel Header */}
        <button
          onClick={toggleOpen}
          className="w-full px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 border-b border-zinc-800 flex items-center justify-between gap-2 text-xs font-black text-zinc-300"
        >
          <div className="flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span className="uppercase tracking-wider">GEÇMİŞ</span>
            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold">
              {allLogs.length}
            </span>
          </div>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />}
        </button>

        {/* Panel Body */}
        {isOpen && (
          <div className="p-2.5 max-h-56 overflow-y-auto space-y-1.5 text-xs font-medium">
            {allLogs.length === 0 ? (
              <p className="text-[11px] text-zinc-500 text-center py-3">
                Geçmiş boş.
              </p>
            ) : (
              allLogs.map((item, index) => {
                if (item.type === 'CLUE') {
                  const isSystem = item.senderName === 'Sistem';
                  return (
                    <div
                      key={index}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                        isSystem
                          ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400 text-[11px]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                      }`}
                    >
                      {!isSystem ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                          <span className="font-bold text-white text-xs truncate">
                            {item.senderName}
                          </span>
                          <span className="text-[10px] text-zinc-500">➔</span>
                          <span className="font-extrabold text-zinc-100 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                            "{item.text}"
                          </span>
                        </div>
                      ) : (
                        <span className="truncate font-semibold">{item.text}</span>
                      )}
                      <span className="text-[9px] text-zinc-500 font-mono">{item.timestamp}</span>
                    </div>
                  );
                } else {
                  const isPas = item.targetId === 'PAS';
                  return (
                    <div
                      key={index}
                      className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-bold"
                    >
                      <div className="flex items-center gap-1.5 text-zinc-300 truncate">
                        <Vote className="w-3 h-3 text-rose-400 flex-shrink-0" />
                        <span className="truncate">{item.voterName}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-zinc-500">➔</span>
                        <span className={isPas ? 'text-amber-400 font-black' : 'text-rose-400 font-black'}>
                          {item.targetName}
                        </span>
                      </div>
                    </div>
                  );
                }
              })
            )}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};
