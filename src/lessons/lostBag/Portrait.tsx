import { assetUrl } from '../../assetUrl';
export default function Portrait({ index, className = '' }: { index: number; className?: string }) {
  return <span aria-hidden="true" className={`lb-portrait ${className}`} style={{
    backgroundImage: `url("${assetUrl('/art/lesson-4/portraits.webp')}")`,
    backgroundPosition: `${index % 3 * 50}% ${Math.floor(index / 3) * 100}%`,
  }} />;
}
