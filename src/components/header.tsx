
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { PanelLeft, ScrollText } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Input Data' },
  { href: '/rekap', label: 'Rekap Obat & Kasus' },
];

export function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          {isClient && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <PanelLeft className="h-6 w-6" />
                  <span className="sr-only">Buka Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[200px]">
                <SheetHeader>
                  <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                </SheetHeader>
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
          )}
          {/* Logo is always rendered */}
          <Logo />
        </div>
        <nav className="flex items-center">
             <Link
                href="/laporan"
                className={cn(
                    "text-sm font-medium transition-colors flex items-center gap-2",
                    pathname === "/laporan" ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                )}
                >
                <ScrollText className="h-4 w-4" />
                Data Lap.
            </Link>
        </nav>
      </div>
    </header>
  );
}
