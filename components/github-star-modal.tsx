"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Github } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "iso-middle-earth:github-star-modal:v1";
const STAR_URL = "https://github.com/hasanharman/isomiddleearth";

export default function GithubStarModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const markSeen = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage failures (privacy mode, etc.)
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) markSeen();
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Enjoying the builder?</DialogTitle>
          <DialogDescription>
            If Iso Middle Earth has been useful, a GitHub star really helps the
            project grow.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">Maybe later</Button>
          </DialogClose>
          <Button
            asChild
            onClick={() => {
              markSeen();
              setOpen(false);
            }}
          >
            <Link href={STAR_URL} target="_blank" rel="noreferrer">
              <Github />
              Star on GitHub
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
