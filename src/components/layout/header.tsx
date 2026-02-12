'use client';

import Link from 'next/link';
import { Bell, Menu, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { MobileNav } from './mobile-nav';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <MobileNav />
          </SheetContent>
        </Sheet>
        <Store className="h-5 w-5 text-green-600" />
        <span className="text-lg font-bold text-green-600">Kilat Seller</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
