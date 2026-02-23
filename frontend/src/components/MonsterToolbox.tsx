import { useEffect, useRef, useState } from 'react';
import { BASE_URL, DND_API_URL } from '../constants';
import type { Monster as MonsterType } from '../types/monster';
import monsterIcon from '../assets/images/MonsterToolboxIcon.png';

interface MonsterImageProps {
  monster: MonsterType
}

function Monster({monster}: MonsterImageProps) {
  return (
    <>
      <img
        src={`${DND_API_URL}${monster.image}`}
        alt={monster.name}
        className="monster-toolbox-avatar"
        draggable="true"
        onDragStart={(e) => {
          e.dataTransfer.setData('application/json', JSON.stringify(monster));
        }}
      />
    </>
  )
}

export default function MonsterToolbox() {
  const [open, setOpen] = useState(false);
  const [monsters, setMonsters] = useState<MonsterType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // fetch monsters
    fetch(`${BASE_URL}/monsters`).then(async resp => {
      const data = await resp.json();
      setMonsters(data);
    }).catch(() => setMonsters([]));
  }, []);

  // Preload images once monsters are set
  useEffect(() => {
    if (monsters.length === 0) return;
    setLoading(true);
    const imagePromises = monsters
      .filter((m) => !!m.image)
      .map(
        (m) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.src = `${DND_API_URL}${m.image}`;
            img.onload = () => resolve();
            img.onerror = () => resolve(); // still resolve even if image fails
          })
      );

    Promise.all(imagePromises).then(() => {
      console.log('All monster images loaded!');
      setLoading(false);
    });
  }, [monsters]);

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
            {loading ? (
              <div className="monster-toolbox-loading">Loading...</div>
            ) : (
              monsters.map((m) => (
                <button key={m.index} className="monster-toolbox-item">
                  {m.image && (
                    <Monster monster={m} />
                  )}
                  <span className="monster-toolbox-name">{m.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
