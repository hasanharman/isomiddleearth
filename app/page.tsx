import IsoCanvas from "@/components/iso-canvas";
import AssetPicker from "@/components/asset-picker";
import Toolbar from "@/components/toolbar";
import CollectionLoader from "@/components/collection-loader";
import type { CollectionLoaderSnapshot } from "@/components/collection-loader";
import { getCollectionMapById } from "@/lib/collections";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ collection?: string | string[] }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const rawCollectionId = params?.collection;
  const collectionId = Array.isArray(rawCollectionId)
    ? rawCollectionId[0]
    : rawCollectionId;

  let initialCollection: CollectionLoaderSnapshot | null = null;
  if (collectionId) {
    const collection = await getCollectionMapById(collectionId);
    if (collection) {
      initialCollection = {
        id: collection.id,
        map: collection.map,
        gridSize: collection.gridSize,
        location: collection.location,
      };
    }
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <CollectionLoader snapshot={initialCollection} />
      <Toolbar />
      <IsoCanvas />
      <AssetPicker />
    </main>
  );
}
