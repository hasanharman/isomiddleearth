import { Suspense } from "react";
import IsoCanvas from "@/components/iso-canvas";
import TilePicker from "@/components/tile-picker";
import Toolbar from "@/components/toolbar";
import CollectionLoader from "@/components/collection-loader";



export default function Home() {
  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <Suspense fallback={null}>
        <CollectionLoader />
      </Suspense>
      <Toolbar />
      <IsoCanvas />
      <TilePicker />
    </main>
  );
}
