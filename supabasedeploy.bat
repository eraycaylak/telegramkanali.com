@echo off
echo ==========================================
echo   Supabase + GitHub Deploy Baslatiliyor
echo ==========================================
cd /d "%~dp0"

echo.
echo [1/5] Supabase Giris Kontrolu...
call npx supabase login

echo.
echo [2/5] Supabase Projesine Baglaniyor...
call npx supabase link --project-ref bzitsygzrfkdqmuiolbe

echo.
echo [3/5] Veritabani Gocleri (Migrations) Yukleniyor...
echo Yeni migration'lar:
echo   - 20260221000000_token_ad_system.sql (Jeton reklam sistemi)
echo   - 20260221100000_recover_channel_ownership.sql (Sahipsiz kanal kurtarma)
call npx supabase db push --include-all

echo.
echo [4/5] Edge Functions Deploy Ediliyor...
echo Fonksiyonlar: telegram-bot-webhook, update-member-counts, vote

echo Deploying: telegram-bot-webhook
call npx supabase functions deploy telegram-bot-webhook --project-ref bzitsygzrfkdqmuiolbe

echo Deploying: update-member-counts
call npx supabase functions deploy update-member-counts --project-ref bzitsygzrfkdqmuiolbe

echo Deploying: vote
call npx supabase functions deploy vote --project-ref bzitsygzrfkdqmuiolbe

echo.
echo [5/5] GitHub'a Push Ediliyor (Netlify icin)...
cd /d "%~dp0"
git add -A
git commit -m "feat: jeton reklam sistemi + kanal sahipligi duzeltmesi"
git push origin main

echo.
echo ==========================================
echo   Deploy Islemi Tamamlandi!
echo   - Supabase: Migrations + Edge Functions OK
echo   - GitHub: Push OK (Netlify otomatik deploy)
echo ==========================================
pause
