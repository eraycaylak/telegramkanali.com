@echo off
echo Supabase Deploy Baslatiliyor...
cd /d "%~dp0"

echo.
echo 0. Supabase Giris Kontrolu...
call npx supabase login

echo.
echo 1. Supabase Projesine Baglaniyor...
call npx supabase link --project-ref bzitsygzrfkdqmuiolbe

echo.
echo 2. Uzak Veritabani ile Esitleniyor (DB Pull)...
echo Eger cakisma varsa once bu adim cozilmeli.
call npx supabase db pull

echo.
echo 3. Veritabani Gocleri (Migrations) Yukleniyor...
call npx supabase db push

echo.
echo 4. Edge Functions Deploy Ediliyor...
echo Fonksiyonlar: telegram-bot-webhook, update-member-counts, vote

echo Deploying: telegram-bot-webhook
call npx supabase functions deploy telegram-bot-webhook --project-ref bzitsygzrfkdqmuiolbe

echo Deploying: update-member-counts
call npx supabase functions deploy update-member-counts --project-ref bzitsygzrfkdqmuiolbe

echo Deploying: vote
call npx supabase functions deploy vote --project-ref bzitsygzrfkdqmuiolbe

echo.
echo Deploy Islemi Tamamlandi!
pause
