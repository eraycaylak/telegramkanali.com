@echo off
cd /d "%~dp0"
echo Veritabani Guncelleniyor (DB Push)...
call npx supabase db push
echo Islem Tamamlandi.
