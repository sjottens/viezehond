export function ProductImage({ src, name }: { src: string | null; name: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="product-img" src={src} alt={name} />;
  }
  return (
    <div className="product-img placeholder" aria-hidden="true">
      {name.charAt(0)}
    </div>
  );
}
