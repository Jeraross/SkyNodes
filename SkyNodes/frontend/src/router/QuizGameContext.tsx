import { createContext, useContext, useState } from 'react';

interface QuizGameContextValue {
  unlockedStickerIds: string[];
  unlockSticker: (id: string) => void;
  sessionPlayer: string | null;
  setSessionPlayer: (name: string) => void;
  playerIcon: string;
  setPlayerIcon: (icon: string) => void;
}

const QuizGameContext = createContext<QuizGameContextValue | null>(null);

export function QuizGameProvider({ children }: { children: React.ReactNode }) {
  const [unlockedStickerIds, setUnlockedStickerIds] = useState<string[]>([]);
  const [sessionPlayer, setSessionPlayer] = useState<string | null>(
    () => localStorage.getItem('quiz_player'),
  );
  const [playerIcon, setPlayerIcon] = useState<string>(
    () => localStorage.getItem('quiz_player_icon') ?? 'Zap',
  );

  const unlockSticker = (id: string) => {
    setUnlockedStickerIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleSetSessionPlayer = (name: string) => {
    localStorage.setItem('quiz_player', name);
    setSessionPlayer(name);
  };

  const handleSetPlayerIcon = (icon: string) => {
    localStorage.setItem('quiz_player_icon', icon);
    setPlayerIcon(icon);
  };

  return (
    <QuizGameContext.Provider
      value={{
        unlockedStickerIds, unlockSticker,
        sessionPlayer, setSessionPlayer: handleSetSessionPlayer,
        playerIcon, setPlayerIcon: handleSetPlayerIcon,
      }}
    >
      {children}
    </QuizGameContext.Provider>
  );
}

export function useQuizGame() {
  const ctx = useContext(QuizGameContext);
  if (!ctx) throw new Error('useQuizGame must be used inside QuizGameProvider');
  return ctx;
}
