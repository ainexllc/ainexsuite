'use client';

import type { SmartRoom } from '@ainexsuite/types';
import { useSmartHubStore } from '../../lib/store';

export function RoomSelector() {
  const { rooms, selectedRoomId, setRoomFilter } = useSmartHubStore();

  return (
    <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
      <button
        onClick={() => setRoomFilter('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
          selectedRoomId === 'all'
            ? 'bg-white text-black'
            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
        }`}
      >
        All Rooms
      </button>
      {rooms.map((room: SmartRoom) => (
        <button
          key={room.id}
          onClick={() => setRoomFilter(room.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            selectedRoomId === room.id
              ? 'bg-white text-black'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          {room.name}
        </button>
      ))}
    </div>
  );
}
