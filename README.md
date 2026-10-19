# NOGORI PINTAR 2040 — UAT v1.0

Aplikasi frontend React/Vite untuk GitHub Pages.

**Repository:** `omgdash/nogori-pintar-2040-uat`  
**UAT URL (selepas deploy berjaya):** `https://omgdash.github.io/nogori-pintar-2040-uat/`

## Langkah untuk penerbitan

1. Pastikan API Google Apps Script **Portal API sedia ada** telah dideploy sebelum ini. **Jangan deploy `Code.gs` baharu** untuk langkah GitHub Pages ini.
2. Di GitHub repository: **Settings → Secrets and variables → Actions → Variables → New repository variable**.
   - Name: `VITE_API_URL`
   - Value: URL `/exec` **Portal API sedia ada** yang berfungsi, seperti `https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec`.
   - Ini ialah URL baca awam, **bukan** kunci `CMS_ADMIN_KEY` atau token keselamatan.
3. Muat naik **semua kandungan pakej yang telah diekstrak** ke root repository, termasuk `.github/workflows/deploy.yml`, `src/`, `public/`, `package.json`, `package-lock.json`, `vite.config.ts` dan `index.html`.
4. Pergi ke **Settings → Pages → Build and deployment → Source: GitHub Actions**.
5. Semak tab **Actions** untuk memastikan `npm ci`, `npm run lint`, `npm run build` dan `Deploy Pages` semuanya berjaya.
6. Buka URL UAT. Uji dalam tetingkap Incognito tanpa cache tempatan.

## Penting

- **API belum dikonfigurasikan**: workflow sengaja gagal dengan arahan jelas; ini mengelakkan laman UAT diterbitkan tanpa data.
- `VITE_API_URL` akan dimasukkan dalam kod JavaScript awam sewaktu build. Jangan masukkan kata laluan/token di dalamnya.
- Pakej ini sengaja **tidak memasukkan fail backend `apps-script/Code.gs`**, skrip ujian dalaman atau pautan ke fail sumber Google Sheets.
- Frontend ini masih bergantung pada API **lama** sehingga pentadbir membuat deployment Apps Script baharu secara berasingan.
- Dashboard GitHub Pages biasanya **awam**. Semak kelulusan penerbitan data agensi, isu, catatan, kos dan lampiran daripada API sebelum kongsi kepada orang luar.
- Kemaskini GAIS kemudian tidak muncul secara automatik dalam repo; upload/push perubahan frontend dan workflow akan build semula URL yang sama.
