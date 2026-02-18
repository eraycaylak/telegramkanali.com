@echo off
echo Supabase Deploy Baslatiliyor...

echo.
echo 1. Supabase Projesine Baglaniyor...
call npx supabase link --project-ref bzitsygzrfkdqmuiolbe

echo.
echo 2. Veritabani Gocleri (Migrations) Yukleniyor...
call npx supabase db push

echo.
echo 3. Edge Functions Deploy Ediliyor...
call npx supabase functions deploy

echo.
echo Deploy Islemi Tamamlandi!
pause
