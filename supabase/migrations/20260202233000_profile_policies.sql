-- Adminlerin tüm profilleri görmesini sağlayan policy
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Admin olmayanlar sadece kendi profillerini görebilir (Mevcut policy yoksa)
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);
