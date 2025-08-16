import path from "path";

// Path to an empty stub module (used to null out dev-only imports)
const emptyStub = path.resolve("./stubs/empty.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack config (used in next dev --turbopack)
  experimental: {
    turbo: {
      resolveAlias: {
        "@locator/runtime": emptyStub,
        "@locator/runtime-only": emptyStub,
        "@locator/shared": emptyStub,
        locatorjs: emptyStub,
      },
    },
  },

  // Webpack fallback (used when not running Turbopack)
  webpack: (config) => {
    const alias = config.resolve.alias || {};
    alias["@locator/runtime"] = emptyStub;
    alias["@locator/runtime-only"] = emptyStub;
    alias["@locator/shared"] = emptyStub;
    alias["locatorjs"] = emptyStub;
    config.resolve.alias = alias;
    return config;
  },
};

export default nextConfig;
