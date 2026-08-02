const configuredBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";

export const siteBasePath = configuredBasePath
  ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";

export const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ??
  "https://embodied-observatory.kaijunwang111.chatgpt.site";

export function withSiteBasePath(path: string) {
  if (!siteBasePath || !path.startsWith("/") || path.startsWith("//")) {
    return path;
  }

  if (path === siteBasePath || path.startsWith(`${siteBasePath}/`)) {
    return path;
  }

  return `${siteBasePath}${path}`;
}

export function absoluteSiteUrl(path: string) {
  return new URL(withSiteBasePath(path), `${siteOrigin.replace(/\/+$/, "")}/`).toString();
}
