import { Droplet } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900">
          <span className="flex size-8 items-center justify-center rounded-lg bg-rose-600 text-white">
            <Droplet className="size-4" fill="currentColor" strokeWidth={0} />
          </span>
          Blood Link
        </Link>
      </div>
    </header>
  );
}
