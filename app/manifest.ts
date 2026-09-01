import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Famille — calendrier, garde et documents",
    short_name: "Famille",
    description: "Calendrier partagé, garde, documents et coordination familiale.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0b0c14",
    theme_color: "#0b0c14",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
