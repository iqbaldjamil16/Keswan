
import { PawPrint } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="PKH Mateng Homepage">
      <PawPrint className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold text-primary font-headline">PKH Mateng</span>
    </Link>
  );
}
