import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isValidUploadPath } from "@/lib/upload-constants";
import { getUploadRoot } from "@/lib/uploads";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

const SAFE_SEGMENT = /^[a-zA-Z0-9._-]+$/;

function resolveUploadFile(segments: string[]): string | null {
  if (segments.length < 1 || segments.length > 2) {
    return null;
  }

  for (const segment of segments) {
    if (!segment || !SAFE_SEGMENT.test(segment)) {
      return null;
    }
  }

  const publicPath = `/uploads/${segments.join("/")}`;
  if (!isValidUploadPath(publicPath)) {
    return null;
  }

  const uploadRoot = path.resolve(getUploadRoot());
  const filePath = path.resolve(uploadRoot, ...segments);

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
