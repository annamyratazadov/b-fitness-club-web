import { getPublicPackages } from "@/lib/services/packages";
import LandingClient from "./LandingClient";

// Always render fresh — prevents stale price data from being cached
export const dynamic = "force-dynamic";

export type PriceMap = {
  student: { 30: number | null; 90: number | null; 180: number | null };
  normal: { 30: number | null; 90: number | null; 180: number | null };
};

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const priceMap: PriceMap = {
    student: { 30: null, 90: null, 180: null },
    normal: { 30: null, 90: null, 180: null },
  };

  try {
    const packages = await getPublicPackages();
    for (const pkg of packages) {
      const type = pkg.package_type as "student" | "normal";
      const days = pkg.duration_days as 30 | 90 | 180;
      if (
        (type === "student" || type === "normal") &&
        (days === 30 || days === 90 || days === 180)
      ) {
        priceMap[type][days] = pkg.price;
      }
    }
  } catch (err) {
    console.error("[LandingPage] Failed to fetch package prices:", err);
    // Prices will show as "—" — acceptable fallback
  }

  return <LandingClient locale={locale} priceMap={priceMap} />;
}
