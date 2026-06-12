# 🎌 AniGames Store - Plataforma eCommerce Premium

**AniGames Store** es una plataforma moderna, responsiva y escalable de comercio electrónico inspirada en marketplaces de alto rendimiento (Temu, AliExpress, Mercado Libre) y adaptada para la venta de figuras de colección, accesorios de hardware gaming, y productos geek de anime y tecnología.

La plataforma está diseñada con una **interfaz futurista de estilo oscuro y acentos de luz neón**, construida en **React + TypeScript + Vite + Tailwind CSS** en el frontend, y preparada con integraciones nativas para **Supabase (PostgreSQL, Auth, Storage, Realtime y RLS)**.

---

## 🚀 Características Principales

- **Diseño Responsivo Dark-Neon**: Experiencia visual premium con animaciones fluidas, bordes de neón interactivos, zoom de imágenes con lupa flotante y efectos de cristal (glassmorphism).
- **Dual-Mode Backend**: Funciona de inmediato en **Mock Mode** (usando datos locales reactivos en LocalStorage y simulaciones automatizadas en Zustand) o en **Real Database Mode** al configurar las credenciales de Supabase en tu archivo `.env`.
- **Buscador Avanzado y Catálogo**: Búsqueda en tiempo real cruzada por categorías, anime/franquicias, marcas y rango de precios con ordenamiento inteligente.
- **Carrito & Canje de Puntos**: Permite canjear cashback acumulado (5% por compra) desde la billetera digital y puntos de fidelidad directamente en el subtotal.
- **Checkout en 4 Pasos**: Formulario interactivo estructurado paso a paso (Direcciones guardadas, Selección de Courier, Pasarelas de Pago simuladas Stripe/Culqi/QR Yape, y Confirmación con generación de pedido).
- **Módulo de Rastreos**: Seguimiento en tiempo real de couriers locales (Olva Courier, Shalom, etc.) mediante códigos de tracking interactivos.
- **Panel Administrativo**: CRUD completo de productos del catálogo, control de despachos y estado de órdenes, y visor de registros de auditoría de seguridad.
- **Sistema de Referidos**: Bono de S/ 20 para el invitado y 500 puntos de regalo para el anfitrión al concretar su primera compra.
- **Canal de Soporte en Vivo**: Burbuja de chat flotante integrada con respuestas simuladas del equipo de atención al cliente.

---

## 📁 Estructura del Proyecto

```text
AniGameStore/
├── public/
│   ├── manifest.json         # Configuración PWA para instalación móvil
│   ├── sw.js                 # Service Worker para caché offline
│   ├── robots.txt            # Reglas de indexación SEO
│   └── sitemap.xml           # Mapa del sitio para rastreadores
├── src/
│   ├── assets/               # Recursos de imagen estáticos
│   ├── components/
│   │   ├── layout/           # Navbar, Footer y ChatBubble de Soporte
│   │   └── ui/               # ProductCard con efectos neón
│   ├── lib/
│   │   └── supabaseClient.ts # Conector a cliente Supabase
│   ├── pages/                # Home, Catalog, Details, Login, Checkout, Dashboards
│   ├── services/             # Servicios asíncronos dual-mode (Auth, Orders, Products)
│   ├── stores/               # Stores de Zustand (Auth, Cart, Search)
│   ├── styles/
│   │   └── global.css        # Setup de Tailwind y variables de diseño neón
│   ├── App.tsx               # Enrutador principal de la plataforma
│   └── main.tsx              # Punto de entrada de la aplicación
├── supabase/
│   ├── migrations/
│   │   └── 01_schema.sql     # DDL de tablas e índices PostgreSQL
│   ├── policies/
│   │   └── rls_policies.sql  # Reglas de Row Level Security (RLS)
│   ├── triggers/
│   │   └── triggers_functions.sql # Triggers de perfiles, stock y cashback
│   └── seed.sql              # Datos realistas de prueba de figuras anime y gaming
├── .env.example              # Plantilla de variables de entorno
├── Dockerfile                # Configuración de contenedorización
├── nginx.conf                # Reglas del servidor Nginx para SPA
├── tailwind.config.js        # Tokens de colores y sombras neón
└── tsconfig.json             # Ajustes de compilación de TypeScript
```

---

## 🛠️ Instrucciones de Instalación

Sigue estos pasos para ejecutar la plataforma de manera local:

### 1. Clonar e Instalar Dependencias
Asegúrate de estar en el directorio raíz del proyecto y ejecuta:
```bash
npm install
```

### 2. Configurar Variables de Entorno (Opcional)
Si deseas conectar un proyecto activo en la nube de Supabase, crea un archivo `.env` en la raíz copiando la plantilla:
```bash
cp .env.example .env
```
Rellena las variables con los datos de la consola de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
```
*Si dejas estas variables en blanco o no creas el archivo, la aplicación correrá automáticamente en **Mock Mode**, permitiéndote probar la tienda de inmediato.*

### 3. Ejecutar Servidor de Desarrollo
Inicia el servidor local en el puerto `3000`:
```bash
npm run dev
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

### 4. Compilar para Producción
Verifica la compilación del empaquetado para distribución:
```bash
npm run build
```

---

## 🛢️ Configuración de Base de Datos en Supabase

Si deseas utilizar la base de datos real en Supabase, ejecuta los scripts SQL ubicados en la carpeta `supabase/` en el siguiente orden desde el **SQL Editor** de tu consola de Supabase:

1. **Esquema de Tablas e Índices**: Copia y ejecuta el contenido de `supabase/migrations/01_schema.sql` para crear la estructura relacional.
2. **Políticas de Seguridad RLS**: Copia y ejecuta `supabase/policies/rls_policies.sql` para asegurar los datos según el rol de usuario (Cliente, Vendedor, Admin).
3. **Triggers y Funciones**: Copia y ejecuta `supabase/triggers/triggers_functions.sql` para automatizar la sincronización de perfiles al registrarse, la deducción de inventario, y la asignación automática de cashback en billeteras.
4. **Semilla de Datos de Prueba**: Copia y ejecuta `supabase/seed.sql` para poblar el catálogo inicial con productos anime (Luffy Gear 5, Nezuko, Goku, Nintendo Switch, etc.).

---

## 🐳 Despliegue con Docker

Para correr la aplicación empaquetada dentro de un contenedor Nginx optimizado, ejecuta:

1. **Construir Imagen**:
   ```bash
   docker build -t anigames-store .
   ```
2. **Ejecutar Contenedor**:
   ```bash
   docker run -d -p 8080:80 anigames-store
   ```
3. Accede desde [http://localhost:8080](http://localhost:8080)

---

## 🛡️ Credenciales de Administrador de Prueba

Para ingresar al **Panel Administrador** en modo Mock, inicia sesión con:
- **Usuario:** `admin@anigames.com`
- **Contraseña:** `admin123`
- *Este rol te dará acceso instantáneo a las pestañas de CRUD de inventario, despachos de envíos, y logs de auditoría en la barra de navegación.*
