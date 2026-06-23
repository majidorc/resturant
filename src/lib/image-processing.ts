import sharp from "sharp";

const MAX_IMAGE_DIMENSION = 1024;

export async function optimizeImageBuffer(
  input: Buffer,
  mimeType: string,
): Promise<Buffer> {
  const pipeline = sharp(input, {
    animated: mimeType === "image/gif",
    failOn: "none",
  });

  const metadata = await pipeline.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const exceedsBounds =
    width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION;

  const resized = exceedsBounds
    ? pipeline.resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
    : pipeline;

  return resized.webp({ quality: 82, effort: 4 }).toBuffer();
}
