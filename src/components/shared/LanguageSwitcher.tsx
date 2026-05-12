"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { updateLanguage } from "@/lib/actions/language";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  async function switchTo(newLocale: "tr" | "en") {
    if (newLocale === locale) return;

    // Update DB preference (fire and forget)
    updateLanguage(newLocale);

    // Swap locale in URL
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
      <button
        onClick={() => switchTo("tr")}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
          locale === "tr"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        TR
      </button>
      <button
        onClick={() => switchTo("en")}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
          locale === "en"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        EN
      </button>
    </div>
  );
}
