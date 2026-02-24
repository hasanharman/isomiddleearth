import { Suspense } from "react";
import IsoCanvas from "@/components/iso-canvas";
import AssetPicker from "@/components/asset-picker";
import Toolbar from "@/components/toolbar";
import CollectionLoader from "@/components/collection-loader";

export default function Home() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <Suspense fallback={null}>
        <CollectionLoader />
      </Suspense>
      <Toolbar />
      <IsoCanvas />
      <AssetPicker />
    </main>
  );
}
