import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getUploadRoot } from "@/lib/uploads";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

function resolveUploadFile(segments: string[]): string | null {
  if (segments.length !== 1) {
    return null;
  }

  const fileName = segments[0];
  if (!fileName || fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    return null;
  }

  const uploadRoot = path.resolve(getUploadRoot());
  const filePath = path.resolve(uploadRoot, fileName);

  if (!filePath.startsWith(`${uploadRoot}${path.sep}`) && filePath !== uploadRoot) {
    return null;
  }

  return filePath;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: segments } = await context.params;
    const filePath = resolveUploadFile(segments);

    if (!filePath) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_BY_EXTENSION[extension] ?? "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to load file." }, { status: 500 });
  }
}
