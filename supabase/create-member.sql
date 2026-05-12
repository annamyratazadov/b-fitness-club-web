-- ============================================================
-- TEST ÜYESİ OLUŞTURMA
-- ============================================================
-- ADIM 1: Supabase Dashboard → Authentication → Users → Add user
--         Email: 05321234567@bfitness.local  (telefon numarası + @bfitness.local)
--         Password: test123
--         Auto Confirm User → işaretli
--
-- ADIM 2: UUID'yi kopyala ve aşağıya yapıştır

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
  '712df630-5ddd-4c4c-a99e-7312f6038f14',
  'Test',
  'Üye',
  '05437646276',
  '1995-06-15',
  'İstanbul',
  'Öğrenci',
  'Kavacık Mahallesi, Beykoz, İstanbul',
  'member',
  'active',
  'tr'
);

-- Üyelik kaydı ekle (1 aylık öğrenci paketi)
INSERT INTO memberships (
  member_id,
  package_id,
  start_date,
  end_date,
  payment_amount,
  is_active
) VALUES (
  '712df630-5ddd-4c4c-a99e-7312f6038f14',
  (SELECT id FROM membership_packages WHERE name = '1 Aylık Öğrenci' LIMIT 1),
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  4000.00,
  true
);

-- Kontrol:
-- SELECT p.first_name, p.last_name, m.end_date, (m.end_date - CURRENT_DATE) AS days_remaining
-- FROM profiles p JOIN memberships m ON m.member_id = p.id WHERE p.role = 'member';
