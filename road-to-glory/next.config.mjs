/** @type {import('next').NextConfig} */

// When building for GitHub Pages we export a static site served from a
// project subpath (https://<user>.github.io/<repo>/). Locally (npm run dev)
// none of this applies, so the app still runs at the root.
const isPages = process.env.GITHUB_PAGES === "true";
const repoBasePath = process.env.PAGES_BASE_PATH ?? "/erics089";

const nextConfig = {
  reactStrictMode: true,
  ...(isPages
    ? {
        output: "export",
        basePath: repoBasePath,
        assetPrefix: `${repoBasePath}/`,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
