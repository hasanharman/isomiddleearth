import Toolbar from "@/components/toolbar";
import CollectionMapCard from "@/components/collection-map-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getCollectionMaps } from "@/lib/collections";

const PAGE_SIZE = 6;
const MAX_PAGE_LINKS = 5;

const parsePage = (rawPage: string | string[] | undefined) => {
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const parsed = Number.parseInt(pageValue ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
};

const getPaginationItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= MAX_PAGE_LINKS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const page = sorted[i];
    const prev = sorted[i - 1];
    if (prev !== undefined && page - prev > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  }

  return result;
};

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page } = await searchParams;
  const maps = await getCollectionMaps();
  const totalPages = Math.max(1, Math.ceil(maps.length / PAGE_SIZE));
  const currentPage = Math.min(parsePage(page), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageMaps = maps.slice(startIndex, startIndex + PAGE_SIZE);
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background">
      <Toolbar />
      <section className="flex-1 overflow-auto px-6 py-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Community Collections
            </h1>
            <p className="text-sm text-muted-foreground">
              Shared maps contributed through GitHub pull requests.
            </p>
            <p className="text-xs text-muted-foreground">
              Add your own map: <code>collections/maps/&lt;id&gt;.json</code>
            </p>
          </header>

          {maps.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
              No community maps yet.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {pageMaps.map((map) => (
                <CollectionMapCard key={map.id} map={map} />
              ))}
            </div>
          )}
          {maps.length > 0 ? (
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <Pagination className="mx-0 justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={prevPage ? `/collections?page=${prevPage}` : "#"}
                      className={
                        !prevPage ? "pointer-events-none opacity-50" : undefined
                      }
                      aria-disabled={!prevPage}
                      tabIndex={prevPage ? undefined : -1}
                    />
                  </PaginationItem>
                  {getPaginationItems(currentPage, totalPages).map(
                    (item, index) => {
                      if (item === "ellipsis") {
                        return (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href={`/collections?page=${item}`}
                            isActive={item === currentPage}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    },
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href={nextPage ? `/collections?page=${nextPage}` : "#"}
                      className={
                        !nextPage ? "pointer-events-none opacity-50" : undefined
                      }
                      aria-disabled={!nextPage}
                      tabIndex={nextPage ? undefined : -1}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
