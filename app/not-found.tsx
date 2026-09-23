import Link from 'next/link';
import { PawIcon } from '@/components/icons';

export default function NotFound() {
  return (
    <main className="lost">
      <div className="lost-paws" aria-hidden="true">
        <PawIcon size={34} /><PawIcon size={34} /><PawIcon size={34} /><PawIcon size={34} />
      </div>
      <p className="eyebrow">404</p>
      <h1>Deze pagina is ontsnapt uit bad.</h1>
      <p>We hebben overal gezocht, zelfs onder de bank. Hij is weg.</p>
      <Link href="/" className="btn btn-big">Terug naar de winkel</Link>
    </main>
  );
}
