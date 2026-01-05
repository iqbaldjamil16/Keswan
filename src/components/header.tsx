
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import { PanelLeft } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Input Data' },
  { href: '/laporan', label: 'Data Laporan' },
  { href: '/rekap', label: 'Rekap Obat dan kasus' },
];

export function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Desktop Logo & Nav */}
        <div className="hidden md:flex items-center flex-1">
          <div className="mr-6">
            <Logo />
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === item.href ? 'text-primary' : 'text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu & Logo */}
        <div className="flex items-center md:hidden">
           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <PanelLeft className="h-6 w-6" />
                <span className="sr-only">Buka Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <div className="px-2 pt-6">
                    <Logo />
                </div>
              <div className="flex flex-col space-y-2 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSheetOpen(false)}
                    className={cn(
                    "text-base font-medium p-3 rounded-md transition-colors",
                    pathname === item.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent/50'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          <div className="ml-2">
            <Logo />
          </div>
        </div>
      </div>
    </header>
  );
}
