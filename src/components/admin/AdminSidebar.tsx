"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  LogOut,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface Props {
  locale: string;
  adminName: string;
}

export default function AdminSidebar({ locale, adminName }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: `/${locale}/admin/dashboard`,     label: "Dashboard",    icon: LayoutDashboard },
    { href: `/${locale}/admin/members`,       label: "Üyeler",       icon: Users },
    { href: `/${locale}/admin/packages`,      label: "Paketler",     icon: Package },
    { href: `/${locale}/admin/notifications`, label: "Bildirimler",  icon: MessageSquare },
  ];

  return (
    <>
      {/* ── DESKTOP: permanent sidebar ── */}
      <div className="hidden md:flex w-64 bg-gray-900 text-white flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="B-Fitness Club" width={36} height={36} className="rounded-lg" />
            <div>
              <div className="font-bold text-sm">B-Fitness Club</div>
              <div className="text-xs text-gray-400">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs text-gray-500">Giriş yapan</p>
              <p className="text-sm text-gray-300 font-medium truncate max-w-[120px]">{adminName}</p>
            </div>
            <LanguageSwitcher />
          </div>
          <form action={logout.bind(null, locale)}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              Çıkış Yap
            </button>
          </form>
        </div>
      </div>

      {/* ── MOBILE: fixed top header bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-gray-900 z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Menüyü aç"
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="B-Fitness Club" width={28} height={28} className="rounded" />
          <span className="text-white font-bold text-sm">B-Fitness Club</span>
        </div>

        <LanguageSwitcher />
      </div>

      {/* ── MOBILE: backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MOBILE: slide-in drawer ── */}
      <div
        className={cn(
          "md:hidden fixed top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col z-50",
          "transform transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="B-Fitness Club" width={28} height={28} className="rounded" />
            <span className="font-bold text-sm">B-Fitness Club</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Menüyü kapat"
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          <div className="px-1">
            <p className="text-xs text-gray-500">Giriş yapan</p>
            <p className="text-sm text-gray-300 font-medium truncate">{adminName}</p>
          </div>
          <form action={logout.bind(null, locale)}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              Çıkış Yap
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
