"use client";

import "./landing.css";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dumbbell,
  Heart,
  Calendar,
  Sparkles,
  Check,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  MapPin,
  Phone,
  Mail,
  Zap,
} from "lucide-react";
import type { PriceMap } from "./page";

// ── Inline social icons (not in this lucide-react version) ──────────
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function YoutubeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}
function WhatsAppIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M16.7 13.5c-.3-.1-1.5-.7-1.8-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.2-.5-.5-1-1.1-1.4-1.7-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.3.2-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.3-.8-1.8-.1-.7-.3-.7-.5-.7h-.5c-.2 0-.5.2-.6.3-.6.6-.9 1.3-.9 2.1.1.9.4 1.8 1 2.6 1.1 1.6 2.5 2.9 4.2 3.7.5.2.9.4 1.4.5.5.2 1 .2 1.6.1.7-.1 1.3-.6 1.7-1.2.2-.4.2-.8.1-1.2l-.3-.2m2.5-9.1C15.2.5 8.8.5 4.9 4.4c-3.2 3.2-3.8 8.1-1.6 12L2 22l5.8-1.5c1.4.8 3 1.2 4.6 1.2 5.5 0 9.9-4.4 9.9-9.9.1-2.6-1-5.1-2.9-7m-2.7 14c-1.3.8-2.8 1.3-4.4 1.3-1.5 0-2.9-.4-4.2-1.1l-.3-.2-3.4.9.9-3.3-.2-.3c-2.4-4-1.2-9 2.7-11.5S16.6 3 19 6.9c2.4 4 1.3 9.1-2.5 11.5" />
    </svg>
  );
}

// ── Data ─────────────────────────────────────────────────────────────
const FEATURES = [
  { n: "01", icon: Dumbbell, t: "Modern Ekipman", d: "Technogym, Life Fitness ve Hammer Strength ekipmanları. Her kas grubu için özel istasyonlar." },
  { n: "02", icon: Heart,    t: "Sıcak Topluluk",   d: "Mahallenin spor kulübü. Yeni başlayana da ileri seviyeye de kapıları açık, samimi bir ortam." },
  { n: "03", icon: Calendar, t: "Esnek Üyelik",    d: "Öğrenci indirimleri, 1-3-6 ay seçenekleri, dondurma hakları. İhtiyacınıza uygun paket." },
  { n: "04", icon: Sparkles, t: "Hijyenik Ortam",  d: "Günde 3 kez dezenfekte, havalandırma sistemi, kişisel temizlik alanları. Güvenli spor ortamı." },
];

const STATS = [
  { n: "1200+", l: "Aktif Üye" },
  { n: "10+",   l: "Yıl Deneyim" },
  { n: "50+",   l: "Fitness Ekipmanı" },
  { n: "%99",   l: "Üye Memnuniyeti" },
];

// Working hours — Pazartesi-Cuma 10:00-23:00, Cumartesi 12:30-20:00
const HOURS = [
  { day: "Pazartesi", time: "10:00 – 23:00", idx: 1 },
  { day: "Salı",      time: "10:00 – 23:00", idx: 2 },
  { day: "Çarşamba",  time: "10:00 – 23:00", idx: 3 },
  { day: "Perşembe",  time: "10:00 – 23:00", idx: 4 },
  { day: "Cuma",      time: "10:00 – 23:00", idx: 5 },
  { day: "Cumartesi", time: "12:30 – 20:00", idx: 6 },
];

const MARQUEE_ITEMS = [
  "Fitness", "Güç Antrenmanı", "Kardiyo", "Dambıl",
  "Barbell", "Kavacık", "Form Tut", "No Excuses", "Train Hard",
];

// Package structure — prices injected from Supabase via props
interface PkgDef {
  dur: string;
  name: string;
  days: 30 | 90 | 180;
  popular?: boolean;
  features: string[];
}

const PKG_DEFS: PkgDef[] = [
  {
    dur: "1 Ay", name: "Başlangıç", days: 30, popular: false,
    features: ["Sınırsız salon kullanımı", "Soyunma odası & dolap", "Fitness değerlendirme", "Çalışma saatleri: 10:00-23:00"],
  },
  {
    dur: "3 Ay", name: "Momentum", days: 90, popular: true,
    features: ["Sınırsız salon kullanımı", "2 adet kişisel antrenman", "Beslenme danışmanlığı", "Dondurma: 7 gün", "Grup dersleri dahil"],
  },
  {
    dur: "6 Ay", name: "Dönüşüm", days: 180, popular: false,
    features: ["Sınırsız salon kullanımı", "4 adet kişisel antrenman", "Beslenme & program takibi", "Dondurma: 14 gün", "Grup dersleri + misafir hakkı"],
  },
];

// ── Isomorphic layout effect ──────────────────────────────────────────
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ── Scroll reveal ─────────────────────────────────────────────────────
function useReveal(rootRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.12 }
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

// ── Nav ───────────────────────────────────────────────────────────────
function Nav({
  dark,
  setDark,
  onMenu,
  locale,
  isScrolled,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
  onMenu: () => void;
  locale: string;
  isScrolled: boolean;
}) {
  return (
    <header className={`nav${isScrolled ? " scrolled" : ""}`}>
      <div className="nav-inner">
        <a href="#top" className="brand">
          <div className="brand-mark">B</div>
          <div className="brand-word">B-FITNESS <em>CLUB</em></div>
        </a>
        <nav className="nav-links">
          <a href="#ozellikler">Özellikler</a>
          <a href="#paketler">Paketler</a>
          <a href="#iletisim">İletişim</a>
        </nav>
        <div className="nav-cta">
          <button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Tema değiştir">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link className="btn btn-ghost" href={`/${locale}/login`}>Üye Girişi</Link>
          <a className="btn btn-primary" href="#paketler">Hemen Başla <ArrowRight size={16} /></a>
          <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Menü"><Menu size={18} /></button>
        </div>
      </div>
    </header>
  );
}

// ── Hero A ────────────────────────────────────────────────────────────
function HeroA({ locale }: { locale: string }) {
  return (
    <section className="hero hero-a" id="top">
      <div className="bg" />
      <div className="content">
        <div className="text-col">
          <div className="eyebrow">
            <span className="dot" />
            <span className="mono">Kavacık · Beykoz / İstanbul</span>
          </div>
          <h1>Formunuzu<br />Bulun, <span className="accent">Gücünüzü</span><br />Keşfedin.</h1>
          <p className="sub">
            Kavacık&apos;ta spor yapmanın en iyi adresi. Her kas grubu için özel istasyonlar,
            sıcak bir topluluk ve hedeflerinize odaklı bir ortam.
          </p>
          <div className="ctas">
            <Link className="btn btn-primary" href={`/${locale}/login`}>Üye Girişi <ArrowRight size={16} /></Link>
            <a className="btn btn-ghost" href="#iletisim">Bize Ulaşın</a>
          </div>
          <div className="stats">
            {STATS.map((s) => (
              <div className="stat" key={s.l}><b>{s.n}</b><span>{s.l}</span></div>
            ))}
          </div>
        </div>
        <div className="photo-card" aria-hidden="true">
          <div className="chip"><span className="dot" /> Bugün Açık</div>
          <Image
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"
            alt="B-Fitness Club spor salonu"
            fill
            className="object-cover"
            sizes="(max-width: 900px) 100vw, 45vw"
          />
          <div className="floater">
            <div className="mark"><Zap size={16} /></div>
            <div>
              <b>10:00 – 23:00</b>
              <span>Kavacık / Beykoz</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Marquee ───────────────────────────────────────────────────────────
function Marquee() {
  const track = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {track.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}

// ── Features ──────────────────────────────────────────────────────────
function Features() {
  return (
    <section className="sec reveal" id="ozellikler">
      <div className="sec-head">
        <div className="left">
          <div className="eyebrow">Neden B-Fitness</div>
          <h2>Her Detay <span className="accent">Sizin</span> İçin Tasarlandı.</h2>
        </div>
        <p className="lede">
          Amatörden profesyonele, her seviyeden üyemize en iyi deneyimi sunmak için
          ekipmanımızı ve alanımızı özenle seçtik.
        </p>
      </div>
      <div className="features">
        {FEATURES.map((f) => {
          const Ic = f.icon;
          return (
            <div className="feat" key={f.n}>
              <div className="num">— {f.n}</div>
              <div className="ico"><Ic size={22} /></div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────
function StatsBar() {
  return (
    <div className="statsbar reveal">
      <div className="inner">
        {STATS.map((s) => (
          <div className="sb" key={s.l}><b>{s.n}</b><span>{s.l}</span></div>
        ))}
      </div>
    </div>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────
function Pricing({ locale, priceMap }: { locale: string; priceMap: PriceMap }) {
  const [tab, setTab] = useState<"student" | "normal">("student");
  const toggleRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ left: 5, width: 100 });

  useIsoLayoutEffect(() => {
    if (!toggleRef.current) return;
    const measure = () => {
      const active = toggleRef.current?.querySelector<HTMLButtonElement>(`button[data-k="${tab}"]`);
      if (active && active.offsetWidth > 0) {
        setPill({ left: active.offsetLeft, width: active.offsetWidth });
      }
    };
    measure();
    const r1 = requestAnimationFrame(measure);
    const r2 = requestAnimationFrame(() => requestAnimationFrame(measure));
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      window.removeEventListener("resize", measure);
    };
  }, [tab]);

  const fmt = (n: number | null) =>
    n === null ? "—" : n.toLocaleString("tr-TR");

  return (
    <section className="sec reveal" id="paketler">
      <div className="sec-head">
        <div className="left">
          <div className="eyebrow">Üyelik Paketleri</div>
          <h2>Hedefinize Uygun <span className="accent">Paket.</span></h2>
        </div>
        <p className="lede">
          İlk ay taahhütsüz. Tüm paketlerde sınırsız salon kullanımı dahildir.
          Öğrenciler için özel indirim.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
        <div className="pricing-toggle" ref={toggleRef}>
          <div className="pill" style={{ left: pill.left, width: pill.width }} />
          <button data-k="student" className={tab === "student" ? "on" : ""} onClick={() => setTab("student")}>Öğrenci</button>
          <button data-k="normal"  className={tab === "normal"  ? "on" : ""} onClick={() => setTab("normal")}>Normal</button>
        </div>
      </div>

      <div className="price-grid">
        {PKG_DEFS.map((p) => {
          const price = priceMap[tab][p.days];
          return (
            <div className={`price${p.popular ? " popular" : ""}`} key={p.days}>
              {p.popular && <div className="badge">En Popüler</div>}
              <div className="duration">— {p.dur}</div>
              <div className="name">{p.name}</div>
              <div className="old">&nbsp;</div>
              <div className="amount">
                <b>{fmt(price)}</b>
                {price !== null && <span className="currency">₺</span>}
              </div>
              <div className="period">{p.dur.toLowerCase()} üyelik · KDV dahil</div>
              <ul>
                {p.features.map((f, j) => (
                  <li key={j}><Check size={16} /><span>{f}</span></li>
                ))}
              </ul>
              <div className="cta">
                <Link
                  className={`btn ${p.popular ? "btn-primary" : "btn-ghost"}`}
                  href={`/${locale}/login`}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Üye Ol <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Contact ───────────────────────────────────────────────────────────
function Contact() {
  const today = new Date().getDay();
  return (
    <section className="sec reveal" id="iletisim">
      <div className="sec-head">
        <div className="left">
          <div className="eyebrow">İletişim</div>
          <h2>Kavacık&apos;ta <span className="accent">Buluşalım.</span></h2>
        </div>
        <p className="lede">
          Beykoz&apos;un kalbinde, ulaşımı kolay bir konumda. Bizi bulun, gelin tanışalım.
        </p>
      </div>

      <div className="contact-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="info-card">
            <h3>Bize Ulaşın</h3>
            <div className="info-row">
              <div className="ico"><MapPin size={18} /></div>
              <div className="txt">
                <div className="label">Adres</div>
                <div className="val">
                  Kavacık Mahallesi Mihrabad Caddesi &amp;, Yayabeyi Sk. No:34 D:C,
                  34810 Beykoz/İstanbul
                </div>
              </div>
            </div>
            <div className="info-row">
              <div className="ico"><Phone size={18} /></div>
              <div className="txt">
                <div className="label">Telefon</div>
                <div className="val"><a href="tel:+902166932165">0216 693 21 65</a></div>
              </div>
            </div>
            <div className="info-row">
              <div className="ico"><Mail size={18} /></div>
              <div className="txt">
                <div className="label">E-posta</div>
                <div className="val"><a href="mailto:info@bfitness.com.tr">info@bfitness.com.tr</a></div>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3>Çalışma Saatleri</h3>
            <div className="hours-list">
              {HOURS.map((h) => (
                <div className={`hrs${h.idx === today ? " today" : ""}`} key={h.day}>
                  <span className="day">
                    {h.day}{" "}
                    {h.idx === today && <span className="now-chip">BUGÜN</span>}
                  </span>
                  <span className="time">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="map">
          <iframe
            title="B-Fitness Club Kavacık"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12027.362945115863!2d29.069832387158204!3d41.09432630000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caca4a6f88fc39%3A0xd4d76a1fcadf2d96!2sB%20Fitness%20Club%20Spor%20Salonu!5e0!3m2!1str!2sus!4v1777017953901!5m2!1str!2sus"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────
function CtaBanner() {
  return (
    <section className="sec reveal" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="cta-banner">
        <div>
          <h2>İlk Antrenman Bizden. Sen Sadece Gel.</h2>
          <p>Ücretsiz deneme dersi + fitness değerlendirme. Hiçbir taahhüt yok, sadece gelip tanış.</p>
          <div className="ctas">
            <a className="btn btn-primary" href="#paketler">Deneme Dersi Al <ArrowRight size={16} /></a>
            <a className="btn btn-ghost" href="tel:+902166932165">0216 693 21 65</a>
          </div>
        </div>
        <div className="ring">
          <svg viewBox="0 0 200 200">
            <defs>
              <path id="lp-circle" d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
            </defs>
            <text fill="#0A0A0A" fontFamily="Bebas Neue" fontSize="18" letterSpacing="4">
              <textPath href="#lp-circle">B-FITNESS · KAVACIK · B-FITNESS · KAVACIK · </textPath>
            </text>
          </svg>
          <div className="center">
            <div><b>FREE</b><span>İlk Ders</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────
function Footer({ locale }: { locale: string }) {
  return (
    <footer>
      <div className="foot-inner">
        <div>
          <a href="#top" className="brand" style={{ marginBottom: 20, display: "inline-flex" }}>
            <div className="brand-mark">B</div>
            <div className="brand-word">B-FITNESS <em>CLUB</em></div>
          </a>
          <p className="tagline">
            Kavacık&apos;ta spor yapmanın en iyi adresi. Modern ekipman ve sıcak topluluk.
          </p>
          <div className="social">
            <a href="#" aria-label="Instagram"><InstagramIcon size={16} /></a>
            <a href="#" aria-label="Facebook"><FacebookIcon size={16} /></a>
            <a href="#" aria-label="YouTube"><YoutubeIcon size={16} /></a>
          </div>
        </div>
        <div>
          <h5>Menü</h5>
          <ul>
            <li><a href="#ozellikler">Özellikler</a></li>
            <li><a href="#paketler">Paketler</a></li>
            <li><a href="#iletisim">İletişim</a></li>
          </ul>
        </div>
        <div>
          <h5>Üyelik</h5>
          <ul>
            <li><Link href={`/${locale}/login`}>Üye Girişi</Link></li>
            <li><a href="#paketler">Paketleri İncele</a></li>
            <li><a href="#paketler">Deneme Dersi</a></li>
            <li><a href="#paketler">Öğrenci İndirimi</a></li>
          </ul>
        </div>
        <div>
          <h5>İletişim</h5>
          <ul>
            <li>Kavacık Mah. Mihrabad Cd.</li>
            <li>Yayabeyi Sk. No:34</li>
            <li>Beykoz / İstanbul</li>
            <li><a href="tel:+902166932165">0216 693 21 65</a></li>
          </ul>
        </div>
      </div>
      <div className="foot-bottom">
        <div>© 2026 B-Fitness Club Kavacık. Tüm hakları saklıdır.</div>
        <div className="foot-links">
          <a href="#">Gizlilik</a>
          <a href="#">KVKK</a>
          <a href="#">Üyelik Koşulları</a>
        </div>
      </div>
    </footer>
  );
}

// ── Mobile Menu ───────────────────────────────────────────────────────
function MobileMenu({ open, onClose, locale }: { open: boolean; onClose: () => void; locale: string }) {
  return (
    <div className={`mobile-menu${open ? " open" : ""}`}>
      <button className="icon-btn" onClick={onClose} style={{ position: "absolute", top: 20, right: 20 }}>
        <X size={18} />
      </button>
      <a href="#ozellikler" onClick={onClose}>Özellikler</a>
      <a href="#paketler" onClick={onClose}>Paketler</a>
      <a href="#iletisim" onClick={onClose}>İletişim</a>
      <div className="mm-ctas">
        <Link className="btn btn-ghost" href={`/${locale}/login`} style={{ justifyContent: "center" }} onClick={onClose}>
          Üye Girişi
        </Link>
        <a className="btn btn-primary" href="#paketler" onClick={onClose} style={{ justifyContent: "center" }}>
          Hemen Başla <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────
export default function LandingClient({ locale, priceMap }: { locale: string; priceMap: PriceMap }) {
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={rootRef} className={`landing-root${dark ? "" : " light"}`}>
      <Nav dark={dark} setDark={setDark} onMenu={() => setMenuOpen(true)} locale={locale} isScrolled={isScrolled} />
      <div className="nav-spacer" aria-hidden="true" />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} locale={locale} />
      <HeroA locale={locale} />
      <Marquee />
      <Features />
      <StatsBar />
      <Pricing locale={locale} priceMap={priceMap} />
      <Contact />
      <CtaBanner />
      <Footer locale={locale} />

      <a
        className="wa-fab"
        href="https://wa.me/902166932165"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp ile iletişim"
      >
        <WhatsAppIcon size={26} />
      </a>
    </div>
  );
}
