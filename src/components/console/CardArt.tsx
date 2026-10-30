import { withBase } from "@/lib/base";

/** The painting of one creature, cropped to the card window (the card draws its own frame). */
export function CardArt({ id }: { id: string }) {
  return (
    <picture>
      <source srcSet={withBase(`/art/v3/games/${id}.avif`)} type="image/avif" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="pk-art" src={withBase(`/art/v3/games/${id}.webp`)} alt="" width={205} height={250} loading="lazy" decoding="async" draggable={false} />
    </picture>
  );
}
