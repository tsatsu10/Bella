import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";
import { MOMENTS_FALLBACK_PHOTOS } from "@/content/media";

const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
// Resolve from cwd so dev and build both find public/media (works on Windows)
const PUBLIC_MEDIA = path.normalize(path.join(process.cwd(), "public", "media"));
const MOMENTS_DIR = path.join(PUBLIC_MEDIA, "moments");
const PHOTOS_DIR = path.join(PUBLIC_MEDIA, "photos");

export type MomentsPhoto = { src: string; alt?: string };

/** Extract leading number from "photo_N_..." for stable sort; otherwise use string compare. */
function photoSortKey(name: string): { num: number | null; name: string } {
  const base = name.replace(/\.[^.]+$/, "");
  const match = base.match(/^photo_(\d+)/i);
  return { num: match ? parseInt(match[1], 10) : null, name: base };
}

function toPhotos(files: { name: string }[], urlPrefix: string): MomentsPhoto[] {
  return files
    .filter((f) => ALLOWED_EXT.includes(path.extname(f.name).toLowerCase()))
    .map((f) => {
      const ext = path.extname(f.name);
      const base = f.name.slice(0, -ext.length);
      return {
        src: `${urlPrefix}/${encodeURIComponent(f.name)}`,
        alt: base.replace(/_/g, " ").trim() || undefined,
      };
    })
    .sort((a, b) => {
      const keyA = photoSortKey(path.basename(a.src));
      const keyB = photoSortKey(path.basename(b.src));
      if (keyA.num !== null && keyB.num !== null) return keyA.num - keyB.num;
      return (a.alt ?? "").localeCompare(b.alt ?? "", undefined, { sensitivity: "base" });
    });
}

/**
 * GET /api/moments — Lists images from public/media/moments/, or public/media/photos/ if moments is empty.
 * Use either folder; images appear in the hero and Moments section.
 */
export async function GET() {
  try {
    let files: { name: string }[] = [];
    let urlPrefix = "/media/moments";

    try {
      const momentFiles = await readdir(MOMENTS_DIR, { withFileTypes: true });
      const imageFiles = momentFiles.filter(
        (f) => f.isFile() && ALLOWED_EXT.includes(path.extname(f.name).toLowerCase())
      );
      if (imageFiles.length > 0) {
        files = imageFiles;
      }
    } catch {
      // moments folder missing or unreadable
    }

    if (files.length === 0) {
      try {
        const photoFiles = await readdir(PHOTOS_DIR, { withFileTypes: true });
        const imageFiles = photoFiles.filter(
          (f) => f.isFile() && ALLOWED_EXT.includes(path.extname(f.name).toLowerCase())
        );
        if (imageFiles.length > 0) {
          files = imageFiles;
          urlPrefix = "/media/photos";
        }
      } catch {
        // photos folder missing or unreadable
      }
    }

    const photos = files.length > 0 ? toPhotos(files, urlPrefix) : MOMENTS_FALLBACK_PHOTOS;
    const res = NextResponse.json({ photos });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res;
  } catch {
    const res = NextResponse.json({ photos: MOMENTS_FALLBACK_PHOTOS });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res;
  }
}
