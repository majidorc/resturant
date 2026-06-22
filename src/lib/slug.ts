export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createUniqueSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>,
) {
  const base = slugify(name) || "restaurant";
  let slug = base;
  let suffix = 1;

  while (await exists(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
