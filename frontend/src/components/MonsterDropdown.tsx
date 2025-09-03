import { useEffect, useRef, useState } from 'react';
import { BACKEND_URL } from '../constants';
import { DND_API_URL } from '../constants';
import '../styles/MonsterDropdown.css';


export interface Monster {
    index: string;
    name: string;
    image?: string;
}

interface MonsterDropdownProps {
    onSelect: (monster: Monster) => void;
}

export default function MonsterDropdown({ onSelect }: MonsterDropdownProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Monster[]>([]);
    const [selected, setSelected] = useState<Monster | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch monsters only once
        fetch(`${BACKEND_URL}/monsters`).then(async resp => {
            const data = await resp.json();
            setOptions(data);
        });
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    return (
        <div className="custom-monster-dropdown" ref={dropdownRef}>
            <button
                className="custom-dropdown-trigger"
                type="button"
                onClick={() => setOpen(o => !o)}
            >
                {selected ? (
                    <span>{selected.name}</span>
                ) : (
                    <span style={{ color: '#bbb' }}>Choose a monster...</span>
                )}
                <span className="custom-dropdown-arrow">▼</span>
            </button>
            {open && (
                <div className="custom-dropdown-list">
                    {options.length === 0 && (
                        <div className="custom-dropdown-option custom-dropdown-loading">Loading...</div>
                    )}
                    {options.map(monster => (
                        <div
                            key={monster.index}
                            className="custom-dropdown-option"
                            onClick={() => {
                                setSelected(monster);
                                setOpen(false);
                                onSelect(monster);
                            }}
                        >
                            {monster.image && (
                                <img src={`${DND_API_URL}${monster.image}`} alt={monster.name} className="custom-dropdown-avatar" />
                            )}
                            {monster.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}