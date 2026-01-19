import FishingCanvas from '@/components/game/FishingCanvas';
import GameUI from '@/components/ui/GameUI';

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden bg-[#0b1026] text-white relative">
      <FishingCanvas />
      <GameUI />
    </main>
  );
}
