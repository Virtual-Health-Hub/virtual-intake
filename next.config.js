/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (!dev) {
      const alias = config.resolve.alias || {};
      alias["@locator/runtime"] = false;
      alias["@locator/runtime-only"] = false;
      alias["@locator/shared"] = false;
      alias["locatorjs"] = false;
      config.resolve.alias = alias;
    }
    return config;
  },
};

export default nextConfig;
