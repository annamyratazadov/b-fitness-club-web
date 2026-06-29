-- ============================================================
-- Migration: profiles alanlarını opsiyonel yap
-- ============================================================
-- Gerçek (defter) kullanımına göre üye kaydı için yalnızca
-- ad, soyad ve paket zorunludur. Telefon, doğum tarihi/yeri,
-- meslek ve adres opsiyonel hale getirilir.
--
-- Telefon: UNIQUE kısıtı KORUNUR (Postgres birden çok NULL'a izin verir),
-- yalnızca NOT NULL kaldırılır. Telefonsuz üyeler giriş yapamaz,
-- sadece sistemde takip edilir.
--
-- Supabase Dashboard → SQL Editor'de çalıştırın.
-- ============================================================

ALTER TABLE profiles ALTER COLUMN phone       DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN birth_date  DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN birth_place DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN occupation  DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN address     DROP NOT NULL;
