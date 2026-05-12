-- ============================================
-- B-Fitness Club - RLS Policy Test Queries
-- ============================================
-- Supabase SQL Editor'da çalıştır.
-- Her test sonucu beklentiye uygun olmalı.
-- ============================================

-- ── TEST 1: Admin tüm profilleri görebilmeli ──
-- Admin UUID ile SET LOCAL kullanarak test et.
-- Supabase Studio → SQL Editor → şu değişkeni set et:
--   SET LOCAL role = authenticated;
--   SET LOCAL request.jwt.claims = '{"sub": "<ADMIN_UUID>"}';

-- Beklenti: tüm satırlar gelir
SELECT COUNT(*) FROM profiles;  -- toplam üye sayısını döndürmeli

-- ── TEST 2: Üye sadece kendi profilini görebilmeli ──
-- Supabase Studio'da test üye UUID ile giriş simüle et.
-- Beklenti: 1 satır (sadece kendi kaydı)

-- ── TEST 3: Üye başka üyenin profilini görememeli ──
-- Beklenti: 0 satır
SELECT * FROM profiles WHERE id != auth.uid();  -- 0 satır dönmeli

-- ── TEST 4: Anonim kullanıcı hiçbir şey görememeli ──
-- Supabase Studio → Settings → API → anon key ile test et
-- Beklenti: 0 satır veya permission denied

-- ── TEST 5: Admin olmayan üye admin route'a erişememeli ──
-- Bu test uygulamadan yapılır:
-- 1. Test üye ile giriş yap: tel 05437646276
-- 2. /tr/admin/dashboard'a gitmeyi dene
-- Beklenti: /tr/login'e redirect

-- ── TEST 6: Membership RLS ──
-- Üye sadece kendi membership kayıtlarını görmeli
SELECT COUNT(*) FROM memberships WHERE member_id = auth.uid();  -- 1+ satır
SELECT COUNT(*) FROM memberships WHERE member_id != auth.uid(); -- 0 satır

-- ── TEST 7: Membership packages herkes görebilmeli ──
-- Beklenti: 6 paket görünür (anon dahil)
SELECT COUNT(*) FROM membership_packages;  -- 6

-- ── TEST 8: WhatsApp notifications sadece admin görebilmeli ──
-- Admin ile: satırlar görünür
-- Üye ile: 0 satır veya permission denied
SELECT COUNT(*) FROM whatsapp_notifications;

-- ── SONUÇ TABLOSU ──
-- Her test geçtikten sonra TODO.md'de işaretle:
-- [x] RLS policies test edildi - YYYY-MM-DD
