# Boda Renée & Gabriel

Sitio Nuxt 3 listo para publicarse como sitio estático en GitHub Pages o como app Node.

## Desarrollo

```bash
npm install
npm run dev
```

## Build para servidor Node

```bash
npm install
npm run build
npm run start
```

## Build estático

```bash
npm install
npm run generate
```

El resultado queda en `.output/public`.

## Publicación en GitHub Pages

El workflow `.github/workflows/deploy.yml` genera y publica el sitio automáticamente al hacer push a `master`.

En GitHub, configura `Settings > Pages > Build and deployment > Source` como `GitHub Actions`. Después, cada push a `master` actualizará la web.

## GitHub Pages en subcarpeta

Si publicas en `https://usuario.github.io/nombre-del-repo/`, genera el sitio con:

```bash
NUXT_APP_BASE_URL=/nombre-del-repo/ npm run generate
```

Si publicas en un dominio propio o en la raíz del servidor, usa simplemente:

```bash
npm run generate
```

## Qué se sube al repositorio

El repositorio solo necesita el código de `app.vue`, `pages/`, `assets/`, `public/images/`, la configuración de Nuxt/Tailwind y `package-lock.json`. `node_modules/`, `.nuxt/`, `.output/`, `dist/` y los archivos originales de fotos son generados, locales o innecesarios para el despliegue.
