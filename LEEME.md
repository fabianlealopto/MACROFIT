# MacroFit — Cómo publicar tu app

Tu proyecto ya está completo. Sigue estos pasos para tenerla como web con enlace propio
y abrirla en el celular como una app.

---

## OPCIÓN A — La más rápida (StackBlitz, todo en el navegador)

1. Entra a **https://stackblitz.com** desde tu computador.
2. Clic en **"Create" → "Vite" → "React (JavaScript)"** (o busca la plantilla Vite React).
3. En el proyecto que se abre, reemplaza los archivos por los de esta carpeta:
   - Arrastra y suelta TODOS los archivos y carpetas de este proyecto dentro de StackBlitz,
     o copia el contenido de cada archivo respetando la estructura.
4. StackBlitz instala todo solo y te muestra la app funcionando a la derecha.
5. Arriba verás un botón para **"Connect"/"Deploy"** o un enlace público que puedes compartir.

> El PDF ya funciona aquí, porque no es un entorno restringido.

---

## OPCIÓN B — Recomendada para un enlace permanente y bonito (Vercel)

Necesitas una cuenta gratis de GitHub y de Vercel.

1. Sube esta carpeta a un repositorio de **GitHub** (puedes hacerlo desde github.com,
   botón "Add file" → "Upload files", y arrastras todo).
2. Entra a **https://vercel.com** e inicia sesión con GitHub.
3. Clic en **"Add New… → Project"**, elige tu repositorio `macrofit`.
4. Vercel detecta que es Vite automáticamente. Solo clic en **"Deploy"**.
5. En ~1 minuto tendrás una URL tipo **https://macrofit.vercel.app**.

Esa URL la abres en cualquier celular.

---

## Instalar como app en el celular (con cualquiera de las dos opciones)

**iPhone (Safari):**
1. Abre el enlace.
2. Toca el botón de **Compartir** (cuadro con flecha).
3. **"Agregar a inicio"**. Aparece con el ícono M-flecha.

**Android (Chrome):**
1. Abre el enlace.
2. Menú **⋮** (arriba a la derecha).
3. **"Agregar a pantalla de inicio"** o **"Instalar app"**.

Queda con ícono propio y se abre a pantalla completa, como una app real.

---

## Estructura del proyecto

```
macrofit/
├── index.html            → página base, íconos y metadatos
├── package.json          → dependencias (React + Vite)
├── vite.config.js        → configuración
├── src/
│   ├── main.jsx          → punto de entrada
│   └── App.jsx           → TODA la app MacroFit
└── public/
    ├── icon.svg          → ícono para el navegador
    ├── icon-180.png      → ícono iPhone
    ├── icon-192.png      → ícono Android
    ├── icon-512.png      → ícono Android grande
    └── manifest.json     → para instalar en Android
```

Para editar la app en el futuro, todo el código está en **src/App.jsx**.
