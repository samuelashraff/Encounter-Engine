import React, { useEffect, useRef } from 'react';
import '../styles/CombatGrid.css';
import type { Monster as MonsterType } from '../types/monster';
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';
import { DND_API_URL } from '../constants';

interface CanvasMonster {
    id: string;
    monster: MonsterType;
    x: number;
    y: number;
}

interface CombatGridProps {
    canvasMonsters?: CanvasMonster[];
    onPlaceMonster?: (monster: MonsterType, nx: number, ny: number) => void;
    onMoveMonster?: (id: string, px: number, py: number) => void;
}

function MonsterImage({ id, src, x, y, draggable, onDragEnd }: { id: string; src: string; x: number; y: number; draggable?: boolean; onDragEnd?: (id: string, nx: number, ny: number) => void }) {
  const [image] = useImage(src);

  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={64}
      height={64}
      draggable={draggable}
      onDragEnd={(e) => {
        if (!onDragEnd) return;
        const node = e.target;
        const pos = node.position(); // { x, y } in stage pixels
        // we will convert to normalized coords in parent because stageRef is here;
        // but we can call onDragEnd with pixel coords and let parent normalize.
        onDragEnd(id, pos.x, pos.y);
      }}
    />
  );
}

export default function CombatGrid({ canvasMonsters = [], onPlaceMonster, onMoveMonster }: CombatGridProps) {

    const stageRef = useRef<any>(null);

    useEffect(() => {
        const container = stageRef.current?.container();
        if (!container) return;

        function handleDragOver(e: DragEvent) {
            e.preventDefault(); // allows drop
        }

        function handleDrop(e: DragEvent) {
            e.preventDefault();
            const json = e.dataTransfer?.getData('application/json');
            if (!json || !onPlaceMonster) return;

            const monster = JSON.parse(json) as MonsterType;
            const stage = stageRef.current;
            stage.setPointersPositions(e);
            const pointerPosition = stage.getPointerPosition();
            console.log('Dropped at', pointerPosition);

            // normalize x/y to 0..1 range
            const nx = pointerPosition.x / stage.width();
            const ny = pointerPosition.y / stage.height();

            onPlaceMonster(monster, nx, ny);
        }

        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);

        return () => {
            container.removeEventListener('dragover', handleDragOver);
            container.removeEventListener('drop', handleDrop);
        };
    }, [onPlaceMonster]);

    return (
        <div className="combatgrid-root">
        <Stage ref={stageRef} width={window.innerWidth} height={window.innerHeight}>
            <Layer>
            {canvasMonsters.map((cm) => (
                <MonsterImage
                key={cm.id}
                id={cm.id}
                src={`${DND_API_URL}${cm.monster.image}`}
                x={cm.x * window.innerWidth}
                y={cm.y * window.innerHeight}
                draggable
                onDragEnd={(id, px, py) => {
                    // convert px/py to normalized using stage dimensions
                    const stage = stageRef.current;
                    if (!stage) return;
                    const nx = px / stage.width();
                    const ny = py / stage.height();
                    onMoveMonster?.(id, nx, ny);
                }}
                />
            ))}
            </Layer>
        </Stage>
        </div>
    );
}