// The Hyprland desktop wallpaper: the remastered 2027 world map (1672x940). Swapping in another image later is a change of this one object
// (and the files in public/art/v3). The image is drawn like `object-fit: cover`; hotspot positions in data/places.ts are % of this image.
// Its left ~35 % is a dark painted margin, where the desktop widget and the first window sit.
export const STAGE_ART = {
  width: 1672,
  height: 940,
  avif: ["/art/v3/map-2027-1672.avif 1672w", "/art/v3/map-2027-1280.avif 1280w", "/art/v3/map-2027-960.avif 960w"],
  webp: ["/art/v3/map-2027-1672.webp 1672w", "/art/v3/map-2027-1280.webp 1280w", "/art/v3/map-2027-960.webp 960w"],
  fallback: "/art/v3/map-2027-1672.webp",
  /** The night grade of the SAME painting (same framing): the Cable Night wallpaper, and the layer the boot draws under the day image. */
  night: {
    avif: ["/art/v3/map-2027-night-1672.avif 1672w", "/art/v3/map-2027-night-1280.avif 1280w", "/art/v3/map-2027-night-960.avif 960w"],
    webp: ["/art/v3/map-2027-night-1672.webp 1672w", "/art/v3/map-2027-night-1280.webp 1280w", "/art/v3/map-2027-night-960.webp 960w"],
    fallback: "/art/v3/map-2027-night-1672.webp",
    width: 1672,
    height: 940,
  },
} as const;

/** Width / height of the painting. */
export const STAGE_RATIO = STAGE_ART.width / STAGE_ART.height;
