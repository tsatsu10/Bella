import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

const ALLOWED_EXT = [".mp3", ".m4a", ".ogg", ".wav", ".aac"];
const PLAYLIST_DIR = path.join(process.cwd(), "public", "media", "playlist");

export type PlaylistTrack = { src: string; label: string };

/**
 * GET /api/playlist — Lists audio files in public/media/playlist/.
 * Each file becomes a track: src = /media/playlist/filename.ext, label = filename without extension.
 */
export async function GET() {
  try {
    const files = await readdir(PLAYLIST_DIR, { withFileTypes: true });
    const tracks: PlaylistTrack[] = files
      .filter((f) => f.isFile() && ALLOWED_EXT.includes(path.extname(f.name).toLowerCase()))
      .map((f) => {
        const ext = path.extname(f.name);
        const base = f.name.slice(0, -ext.length);
        return {
          src: `/media/playlist/${encodeURIComponent(f.name)}`,
          label: base.replace(/_/g, " ").trim() || f.name,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

    const res = NextResponse.json({ tracks });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res;
  } catch (err) {
    const res = NextResponse.json({ tracks: [] });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res;
  }
}
