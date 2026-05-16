"use client";

import Image from "next/image";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

interface Props {
  locale: string;
  memberName: string;
}

export default function MemberHeader({ locale, memberName }: Props) {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="B-Fitness Club" width={36} height={36} className="rounded-lg" />
          <div>
            <div className="font-bold text-sm text-gray-900">B-Fitness Club</div>
            <div className="text-xs text-gray-500">Kavacık</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 ml-1">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium">{memberName}</span>
          </div>

          <form action={logout.bind(null, locale)}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Çıkış</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
