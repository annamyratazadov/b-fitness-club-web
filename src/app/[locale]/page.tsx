import { getPackages } from "@/lib/services/packages";
import LandingClient from "./LandingClient";

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
    const packages = await getPackages(true);
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
  } catch {
    // Fall back to null prices — LandingClient shows dashes
  }

  return <LandingClient locale={locale} priceMap={priceMap} />;
}
