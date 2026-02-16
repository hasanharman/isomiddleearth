import IsoCanvas from "@/components/iso-canvas";
import TilePicker from "@/components/tile-picker";
import Toolbar from "@/components/toolbar";



export default function Home() {
  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <Toolbar />
      <IsoCanvas />
      <TilePicker />
    </main>
  );
}
