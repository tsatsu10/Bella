import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

const ALLOWED_EXT = [".mp4", ".webm", ".mov", ".m4v"];
const VIDEOS_DIR = path.join(process.cwd(), "public", "media", "videos");

export type VideoItem = { src: string; poster?: string; label?: string };

/**
 * GET /api/videos — Lists video files in public/media/videos/.
 * Each file becomes an item: src = /media/videos/filename.ext, label = filename without extension.
 */
export async function GET() {
  try {
    const files = await readdir(VIDEOS_DIR, { withFileTypes: true });
    const videos: VideoItem[] = files
      .filter((f) => f.isFile() && ALLOWED_EXT.includes(path.extname(f.name).toLowerCase()))
      .map((f) => {
        const ext = path.extname(f.name);
        const base = f.name.slice(0, -ext.length);
        return {
          src: `/media/videos/${encodeURIComponent(f.name)}`,
          label: base.replace(/_/g, " ").trim() || undefined,
        };
      })
      .sort((a, b) => (a.label ?? "").localeCompare(b.label ?? "", undefined, { sensitivity: "base" }));

    const res = NextResponse.json({ videos });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res;
  } catch {
    return NextResponse.json({ videos: [] });
  }
}
