-- ============================================================
-- İLK ADMİN KULLANICISI OLUŞTURMA
-- ============================================================
-- ADIM 1: Supabase Dashboard → Authentication → Users
--         "Add user" → "Create new user" butonuna tıkla
--         Email: admin@bfitness.com
--         Password: (güvenli bir şifre belirle)
--         "Auto Confirm User" → işaretli olsun
--
-- ADIM 2: Oluşturulan kullanıcının UUID'sini kopyala
--
-- ADIM 3: Aşağıdaki SQL'i çalıştır (UUID'yi güncelle):

INSERT INTO profiles (
  id,
  first_name,
  last_name,
  phone,
  birth_date,
  birth_place,
  occupation,
  address,
  role,
  status,
  language
) VALUES (
  '5060d87c-ab89-4662-901b-cbefe8c25a7b',  -- Auth Users'dan kopyala
  'Admin',
  'Kullanıcı',
  '05000000000',
  '1990-01-01',
  'İstanbul',
  'Spor Salonu Yöneticisi',
  'B-Fitness Club Kavacık',
  'admin',
  'active',
  'tr'
);

-- ============================================================
-- Başarıyla oluşturulduğunu kontrol et:
-- SELECT * FROM profiles WHERE role = 'admin';
-- ============================================================
