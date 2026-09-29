import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Private image variants live outside /public; ship them with the functions that read them.
  outputFileTracingIncludes: {
    "/i/[token]": ["./.art/s/**", "./.art/m/**", "./.art/l/**", "./.art/x/**"],
    "/api/sign": ["./.art/key"],
  },
};

export default nextConfig;
