# B-Fitness Club - Geliştirme TODO Listesi

**Proje:** B-Fitness Club Kavacık - Üye Yönetim Sistemi  
**Tech Stack:** Next.js 16.2.4 + TypeScript + Supabase + Tailwind CSS + Shadcn/ui (Base UI)  
**Toplam Tahmini Süre:** ~40-50 saat geliştirme  
**Son Güncelleme:** 2026-04-24 (Sprint 1 + 2 + 3 + Landing Page tamamlandı)

---

## ✅ TAMAMLANDI - Proje Altyapısı

- [x] Next.js 16.2.4 (App Router) kurulumu
- [x] TypeScript yapılandırması
- [x] Tailwind CSS + Shadcn/ui kurulumu
- [x] next-intl (TR/EN i18n) entegrasyonu
- [x] Supabase SSR client yapılandırması (client + server + middleware)
- [x] Klasör yapısı oluşturma
- [x] TypeScript tip tanımları (`src/types/database.ts`)
- [x] Zod validasyon şemaları
- [x] Supabase SQL şeması (`supabase/schema.sql`)
- [x] TR/EN mesaj dosyaları
- [x] Temel sayfa iskeletleri (login, admin dashboard, member dashboard)
- [x] AdminSidebar component
- [x] MembersTable iskelet component
- [x] MemberForm iskelet component
- [x] `middleware.ts` → `proxy.ts` rename (Next.js 16 breaking change)
- [x] `(admin)/` ve `(member)/` route çakışması düzeltildi (yol eklendi)

---

## ✅ SPRINT 1: Altyapı & Authentication — TAMAMLANDI
**Tahmini Süre:** 8-10 saat  
**Öncelik:** KRİTİK - Her şey buna bağlı

### 1.1 Supabase Kurulumu
- [x] Supabase projesi oluşturuldu (`ocorurljupwtlybhdsdv`)
- [x] `.env.local` dosyasına Supabase URL ve keys eklendi
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [x] `supabase/schema.sql` dosyası Supabase SQL Editor'da çalıştırıldı
  - Tüm tablolar oluşturuldu
  - RLS policies aktifleştirildi
  - Seed data (6 paket) yüklendi
- [x] Supabase Auth ayarları yapıldı
  - Email confirmations devre dışı

### 1.2 Authentication Sistemi
- [x] Admin login sayfası → Supabase Auth bağlantısı
  - `src/app/[locale]/(auth)/login/page.tsx` — email + password ile giriş
  - `createClient().auth.signInWithPassword()`
  - Başarıda `/${locale}/admin/dashboard`'a redirect
  - Hata mesajları (Türkçe)
- [x] Üye login → telefon ile giriş
  - Telefon numarasını email'e çevirme: `{phone}@bfitness.local`
  - `signInWithPassword()` ile giriş
  - Başarıda `/${locale}/member/dashboard`'a redirect
- [x] Middleware (proxy.ts): route koruması
  - Admin route'ları: `/[locale]/admin/**` → admin kontrolü
  - Member route'ları: `/[locale]/member/**` → member kontrolü
  - Public route: `/[locale]/login`
- [x] Logout işlevi
  - AdminSidebar logout butonu
  - MemberHeader logout butonu
  - `supabase.auth.signOut()` → `/login`'e redirect
- [x] Role-based redirect sonrası login
  - Admin giriş → `/admin/dashboard`
  - Member giriş → `/member/dashboard`
  - profiles tablosundan role okuma
- [x] İlk admin kullanıcısı oluşturuldu (UUID: `5060d87c-ab89-4662-901b-cbefe8c25a7b`)

### 1.3 Admin & Test Üye Oluşturma
- [x] `supabase/create-admin.sql` oluşturuldu
- [x] `supabase/create-member.sql` oluşturuldu (test üye: `05437646276`)

---

## ✅ SPRINT 2: Admin Core Features — TAMAMLANDI
**Tahmini Süre:** 14-16 saat  
**Öncelik:** YÜKSEK - Ana değer Sprint 2'de

### 2.1 Dashboard İstatistikleri
- [x] Dashboard veri servisi oluşturuldu (`src/lib/services/dashboard.ts`)
  - Toplam/Aktif/Pasif üye sayısı
  - Bu ay yeni üyeler
  - Bu ay biten üyelikler
  - Bu ayın geliri (SUM of payment_amount)
- [x] `(admin)/admin/dashboard/page.tsx` — gerçek veri bağlandı
  - Sayılar formatlı gösterildi (₺ ve bin ayracı)
- [x] Yaklaşan bitiş tarihleri bileşeni (7 gün içinde)
  - Kırmızı/sarı uyarı renklendirmesi
- [x] Son biten üyelikler bileşeni (14 gün)

### 2.2 Üye Listesi (Members Table)
- [x] `MembersTable.tsx` tam implementasyon
  - Supabase'den üye listesi çekildi (server-side pagination)
  - Her satırda: Ad Soyad, Telefon, Paket, Kalan Gün, Durum (badge), İşlemler
  - Kalan gün renklendirmesi: 0=kırmızı, 1-7=sarı, 7+=yeşil
  - Sayfalama (10 üye/sayfa)
- [x] Arama işlevi — isim + telefon, debounce ile
- [x] Filtreleme — Aktif/Pasif + Paket türü (Öğrenci/Normal)

### 2.3 Yeni Üye Ekleme
- [x] `MemberForm.tsx` tam implementasyon
  - React Hook Form + Zod v4 validasyon
  - Hata mesajları Türkçe
  - Paket listesi Supabase'den çekiliyor
  - `auth.admin.createUser()` → `profiles` → `memberships`
  - Başarı toast mesajı
- [x] Geçmişe dönük kayıt — başlangıç tarihi manuel girilebiliyor
- [x] Duplicate telefon kontrolü

### 2.4 Üye Detay Sayfası
- [x] `[id]/page.tsx` tam implementasyon
  - Profil kartı (tüm bilgiler)
  - Aktif üyelik durumu kartı (kalan gün, bitiş tarihi, progress bar)
  - Abonelik geçmişi tablosu
  - "Üyeliği Uzat", "Üyeyi Düzenle", "Üyeyi Sil" butonları

### 2.5 Üye Düzenleme
- [x] Edit page (`[id]/edit/page.tsx`) — mevcut bilgileri form'a dolduruyor
- [x] Profil bilgileri güncelleme + başarı toast

### 2.6 Üye Silme
- [x] Güvenli silme akışı (AlertDialog)
  - "SİL" yazarak çift onay
  - `member_deletion_logs`'a JSONB kayıt
  - `auth.admin.deleteUser()` ile silme
  - Başarı → üye listesine yönlendirme

### 2.7 Üyelik Uzatma (Ödeme Alma)
- [x] `ExtendMembershipDialog.tsx` — üye detay sayfasından açılır
  - Paket seçimi (aktif paketler)
  - Ödeme tutarı (düzenlenebilir)
  - Eski aktif membership pasif → yeni kayıt eklenir
  - Başarı toast

### 2.8 Paket Yönetimi
- [x] Paket listesi sayfası (`/admin/packages`) — aktif/pasif badge
- [x] Yeni paket ekleme modal'ı (`AddPackageDialog.tsx`)
- [x] Paket düzenleme + fiyat güncelleme
- [x] Aktif/Pasif toggle (silme yok)

---

## ✅ SPRINT 3: Üye Paneli — TAMAMLANDI
**Tahmini Süre:** 6-8 saat  
**Öncelik:** ORTA

### 3.1 Üye Dashboard
- [x] Profil kartı — Ad, Telefon, Doğum Tarihi, Doğum Yeri, Meslek, Adres
- [x] Aktif üyelik durumu kartı
  - Büyük kalan gün sayısı (renk kodlu: yeşil / sarı / kırmızı)
  - Bitiş tarihi, paket adı, ödeme tutarı
  - Progress bar (toplam sürenin kaçta kaçı kaldı)
  - Pasif/yok durumu: "Aktif üyeliğiniz bulunmamaktadır"
- [x] Abonelik geçmişi tablosu (yeniden eskiye)

### 3.2 Dil Değiştirme
- [x] `LanguageSwitcher.tsx` component
- [x] TR/EN toggle — `profiles.language` alanını günceller
- [x] MemberHeader ve AdminSidebar'a eklendi

### 3.3 Üye Auth
- [x] Telefon → email çevirisi doğru çalışıyor
- [x] Hatalı giriş mesajları (Türkçe)

---

## ✅ LANDING PAGE — TAMAMLANDI
**Tamamlanma:** 2026-04-24

- [x] Landing page tasarımı (HTML prototype → Next.js dönüşümü)
- [x] `src/app/[locale]/page.tsx` — server component, Supabase'den gerçek fiyatları çeker
- [x] `src/app/[locale]/LandingClient.tsx` — client component (tüm UI)
- [x] `src/app/[locale]/landing.css` — tam tasarım CSS
- [x] Sticky navbar — dark/light toggle + hamburger menü
- [x] Hero section (A/B/C varyant switcher)
  - Hero A: karanlık = sinematik full-bleed, aydınlık = editorial split
  - Hero B: split layout (metin + görsel)
  - Hero C: tipografi odaklı
- [x] Marquee bant (sadece fitness terimleri)
- [x] Features grid (4 kart: ekipman, topluluk, esnek üyelik, hijyen)
- [x] Stats Bar — turuncu arka plan, büyük rakamlar
- [x] Pricing toggle (Öğrenci ↔ Normal) + 3 paket kartı
  - **Fiyatlar Supabase'den gerçek zamanlı çekiliyor**
  - Paket adları: Başlangıç (1 Ay), Momentum (3 Ay), Dönüşüm (6 Ay)
- [x] Contact bölümü
  - Adres, telefon, e-posta kartı
  - Çalışma saatleri: Pzt–Cum 10:00–23:00, Cumartesi 12:30–20:00
  - Google Maps embed (gerçek B-Fitness Club konumu)
- [x] CTA Banner — dönen rozet + ücretsiz ilk ders
- [x] Footer — sosyal medya, menü linkleri, iletişim
- [x] WhatsApp FAB — sağ altta sabit
- [x] Dark / Light mode (varsayılan: dark)
- [x] Tüm CTA butonları `/login` sayfasına yönlendiriyor
- [x] Root sayfa `/tr`'ye yönlendiriyor (eskiden `/tr/login`)
- [x] Google Fonts — Bebas Neue + Inter (root layout üzerinden)
- [x] Unsplash görselleri `next/image` ile optimize

---

## ✅ LINT & KALİTE FİXLERİ — TAMAMLANDI

- [x] `<img>` → `<Image>` (next/image) — 5 adet
- [x] `next.config.ts` — Unsplash için `remotePatterns` eklendi
- [x] `Date.now()` impure function hatası düzeltildi (`ExtendMembershipDialog.tsx`)
- [x] `useLocale` kullanılmayan import kaldırıldı (`AdminSidebar.tsx`)
- [x] Google Fonts ESLint uyarısı düzeltildi (`layout.tsx`)
- [x] "en modern spor salonu" ifadesi kaldırıldı (tüm sayfalarda)
- [x] `npm run lint` → 0 hata, 0 uyarı ✅
- [x] `npm run build` → başarılı ✅

---

## 📱 SPRINT 4: WhatsApp & Final Polish
**Tahmini Süre:** 8-10 saat  
**Öncelik:** ORTA-YÜKSEK

### 4.1 WhatsApp / Twilio Kurulumu
- [x] Twilio hesabı oluşturuldu, WhatsApp Sandbox aktif
  - `.env.local`'e credentials eklendi
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `CRON_SECRET`
- [x] Twilio npm paketi kuruldu: `npm install twilio`

### 4.2 WhatsApp Bildirimleri API
- [x] `src/app/api/cron/whatsapp-notifications/route.ts`
  - GET handler (Vercel Cron Job çağırır)
  - 3 gün sonra biten üyelikleri bul ve mesaj gönder
  - Türkçe WhatsApp mesaj şablonu (isim + paket adı + telefon)
  - `whatsapp_notifications` tablosuna kayıt eklendi (status: sent/failed)
  - Aynı gün iki kez gönderme koruması (deduplication)
- [x] API güvenliği — `Authorization: Bearer {CRON_SECRET}` header kontrolü

### 4.3 Vercel Cron Job
- [x] `vercel.json` dosyası oluşturuldu
  - Saat 10:00 Türkiye = 07:00 UTC

### 4.4 Bildirim Geçmişi (Admin Panel)
- [x] Admin paneline bildirimler sayfası eklendi (`/admin/notifications`)
  - 3 stat kartı: gönderildi / başarısız / bugün
  - Son 100 bildirim tablosu: üye adı, telefon, tarih, durum
  - AdminSidebar'a "Bildirimler" menü eklendi

### 4.5 UI/UX Polish
- [ ] Responsive tasarım testi (375px / 768px / 1440px) — manuel test gerekli
- [x] Admin sidebar → mobile drawer/hamburger
  - Desktop: `hidden md:flex` permanent sidebar
  - Mobile: fixed top bar (hamburger + logo + dil) + slide-in drawer + backdrop
- [x] Loading states — skeleton loader'lar
  - `dashboard/loading.tsx`, `members/loading.tsx`, `members/[id]/loading.tsx`
  - `packages/loading.tsx`, `notifications/loading.tsx`, `member/dashboard/loading.tsx`
- [x] Error boundary — `(admin)/error.tsx`, `(member)/error.tsx`, `[locale]/not-found.tsx`
- [ ] Toast mesajları tutarlılığı — mevcut toast'lar yeterli, gerekirse revizyona alınır

### 4.6 Performans
- [x] Pagination URL params — MembersTable zaten `router.push(?page=N)` kullanıyor, MembersPage `searchParams` okuyor ✅
- [x] Supabase SELECT * → column selection — `getMemberDetail` profilinde `*` → explicit columns

---

## 🔒 GÜVENLİK - Her Sprint'te Kontrol Et

- [ ] RLS policies test et → `supabase/test-rls.sql` sorguları çalıştır (Supabase Studio)
- [ ] Admin olmayan kullanıcı admin route'a erişemesin
- [ ] Üye başka üyenin datasını göremesin
- [ ] Service role key sadece server-side kullanılsın
- [ ] Environment variables `.env.local`'de, `.gitignore`'da

---

## 🧪 TEST SENARYOLARI

### Tamamlananlar ✅
- [x] Yeni üye ekle → Supabase'de profil + user + membership oluşuyor
- [x] Üye sil → member_deletion_logs'a kayıt gidiyor
- [x] Üyelik uzat → Eski membership pasif, yeni aktif
- [x] Üye telefon ile giriş yapabiliyor
- [x] Kalan gün doğru hesaplanıyor
- [x] Landing page fiyatları Supabase'den çekiliyor

### Sprint 4 Tamamlanınca Test Et:
> ⚠️ **NOT: Gerçek veriler (gerçek üyeler) sisteme girildikten sonra test edilecek.**

- [ ] WhatsApp API endpoint curl/Postman ile manuel tetikle:
  ```bash
  curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/whatsapp-notifications
  ```
- [ ] 3 gün sonrası end_date'i olan test üye ekle → endpoint çalıştır → WhatsApp gelsin
- [ ] Üyeliği bitmiş kişiye (is_active=true, end_date geçmiş) mesaj gitmiyor mu?
- [ ] Aynı gün endpoint iki kez çalıştırılınca duplicate gitmiyor mu?
- [ ] Admin `/notifications` sayfasında kayıtlar görünüyor mu?
- [ ] Vercel deploy sonrası cron job saat 10:00'da otomatik çalışıyor mu?

---

## 🚀 DEPLOYMENT (Sprint 4 Sonrası)

- [ ] Supabase production ayarları (Site URL → Vercel URL)
- [ ] Vercel'e deploy (GitHub push → Vercel import)
- [ ] Vercel environment variables ayarla
- [ ] Cron job aktifleştir (Vercel Pro gerekebilir)
- [ ] İlk admin oluştur ve sistemi test et
- [ ] Müşteri (hoca) demo

---

## 📝 NOTLAR

### Middleware (proxy.ts)
Next.js 16'da `middleware.ts` → `proxy.ts` olarak yeniden adlandırıldı,
export da `middleware` → `proxy` olarak değişti.

### Üye Login E-posta Stratejisi
- Kayıt: `{phone_normalized}@bfitness.local`
- Giriş: Telefon al → email'e çevir → `signInWithPassword()`
- Örnek: `05321234567` → `05321234567@bfitness.local`

### Shadcn/ui — Base UI Kullanıyor
Bu projede Shadcn `@base-ui/react` kullanıyor (Radix değil).
- `asChild` prop YOK → `render={<Button />}` kullanılır
- DialogTrigger, AlertDialogTrigger için bu pattern zorunlu

### Supabase Join Tipi
Supabase join'lar tek kayıt için bile dizi döndürüyor.
→ TypeScript hataları için `any` cast gerekiyor (services dosyalarında)

### Test Kullanıcıları
- Admin UUID: `5060d87c-ab89-4662-901b-cbefe8c25a7b`
- Test Üye UUID: `712df630-5ddd-4c4c-a99e-7312f6038f14`, telefon: `05437646276`

### Landing Page Çalışma Saatleri
- Pazartesi–Cuma: 10:00–23:00
- Cumartesi: 12:30–20:00
- Pazar: Kapalı

---

## 📊 SPRINT ÖZETİ

| Sprint | Konu | Tahmini Süre | Durum |
|--------|------|-------------|-------|
| Sprint 0 | Proje Altyapısı | — | ✅ Tamamlandı |
| Sprint 1 | Altyapı & Auth | 8-10 saat | ✅ Tamamlandı |
| Sprint 2 | Admin Core | 14-16 saat | ✅ Tamamlandı |
| Sprint 3 | Üye Paneli | 6-8 saat | ✅ Tamamlandı |
| Landing | Landing Page | — | ✅ Tamamlandı |
| Sprint 4 | WhatsApp & Polish | 8-10 saat | ✅ Tamamlandı |
| **TOPLAM** | | **36-44 saat** | |
