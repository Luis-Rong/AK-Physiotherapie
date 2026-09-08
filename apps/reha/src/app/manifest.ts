import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AK Physio Reha",
    short_name: "AK Reha",
    description: "Rehabilitationstagebuch",
    start_url: "/app",
    display: "standalone",
    background_color: "#FBF8F3",
    theme_color: "#5B3F2E",
    lang: "de",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
