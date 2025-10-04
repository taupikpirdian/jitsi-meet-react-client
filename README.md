# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Konfigurasi Environment (Jitsi)

Simpan data sensitif seperti domain dan token terkait Jitsi di file environment.

1) Salin `.env.example` menjadi `.env.local` lalu sesuaikan nilainya:

```
VITE_JITSI_EXTERNAL_API_URL=https://meet.jit.si/external_api.js
VITE_JITSI_DOMAIN=meet.ffmuc.net
# Opsional: JWT untuk konferensi yang memerlukan autentikasi
VITE_JITSI_JWT=
```

2) Aplikasi membaca variabel di atas melalui `import.meta.env`. Pada `src/components/ConferenceRoom.tsx`:
- Domain Jitsi diambil dari `VITE_JITSI_DOMAIN` (fallback ke `meet.ffmuc.net`).
- URL skrip `external_api.js` diambil dari `VITE_JITSI_EXTERNAL_API_URL` (fallback ke `https://meet.jit.si/external_api.js`).
- Jika `VITE_JITSI_JWT` diset, token akan dipass ke opsi Konstruktor `JitsiMeetExternalAPI`.

Catatan penting: variabel env yang diprefiks `VITE_` akan ter-bundle ke client sehingga tidak cocok untuk menyimpan rahasia jangka panjang. Untuk token rahasia, pertimbangkan mekanisme server-side (misal endpoint yang menghasilkan JWT sekali pakai) agar tidak terekspos di kode frontend.

## Deployment dengan Docker

Tersedia konfigurasi Docker multi-stage untuk build dan serve aplikasi sebagai static site via Nginx.

1) Menggunakan Docker Compose (disarankan)

- Buat file `.env` di root project (Compose akan otomatis membacanya), isi variabel berikut:
  ```
  VITE_JITSI_EXTERNAL_API_URL=https://meet.jit.si/external_api.js
  VITE_JITSI_DOMAIN=meet.ffmuc.net
  # Opsional
  VITE_JITSI_JWT=
  ```
- Jalankan build dan start:
  ```bash
  docker compose up --build -d
  ```
- Aplikasi akan tersedia di `http://localhost:8080/`.

2) Build dan Run manual dengan Docker

- Build image:
  ```bash
  docker build \
    --build-arg VITE_JITSI_EXTERNAL_API_URL=https://meet.jit.si/external_api.js \
    --build-arg VITE_JITSI_DOMAIN=meet.ffmuc.net \
    --build-arg VITE_JITSI_JWT= \
    -t jitsi-meet-react-client:latest .
  ```
- Jalankan container:
  ```bash
  docker run -d -p 8080:80 --name jitsi-meet-react-client jitsi-meet-react-client:latest
  ```

Catatan:
- Variabel `VITE_*` akan di-bake saat build image. Jika mengubah konfigurasi Jitsi, rebuild image diperlukan.
- Nginx telah dikonfigurasi untuk SPA fallback (semua route diarahkan ke `index.html`).
