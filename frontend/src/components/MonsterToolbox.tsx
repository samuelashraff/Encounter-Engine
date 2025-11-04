import { useEffect, useRef, useState } from 'react';
import { BACKEND_URL, DND_API_URL } from '../constants';
import type { Monster as MonsterType } from '../types/monster';
import monsterIcon from '../assets/images/MonsterToolboxIcon.png';

interface Props {
  onStartDrag: (monster: MonsterType) => void;
}

export default function MonsterToolbox({ onStartDrag }: Props) {
  const [open, setOpen] = useState(false);
  const [monsters, setMonsters] = useState<MonsterType[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // fetch monsters once
    fetch(`${BACKEND_URL}/monsters`).then(async resp => {
      const data = await resp.json();
      setMonsters(data);
    }).catch(() => setMonsters([]));
  }, []);

  // close when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="monster-toolbox-root" ref={ref}>
      <button
        className="monster-toolbox-button"
        onClick={() => setOpen(o => !o)}
        aria-label="Open monster toolbox"
      >
        <img src={monsterIcon} alt="Monster Toolbox" />
      </button>

      {open && (
        <div className="monster-toolbox-popup" role="dialog" aria-label="Monsters list">
          <div className="monster-toolbox-header">Monsters</div>
          <div className="monster-toolbox-list">
            {monsters.length === 0 && <div className="monster-toolbox-loading">Loading...</div>}
            {monsters.map(m => (
              <button
                key={m.index}
                className="monster-toolbox-item"
                onClick={() => {
                  setOpen(false);
                  onStartDrag(m);
                }}
              >
                {m.image && (
                  <img src={`${DND_API_URL}${m.image}`} alt={m.name} className="monster-toolbox-avatar" />
                )}
                <span className="monster-toolbox-name">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
