# Checkpoint

Medio digital de videojuegos, cine y frikada. Aplicación de producción construida sobre
Next.js (App Router) + PostgreSQL, que reemplaza el prototipo original (React + estado en
memoria) por una arquitectura real: autenticación cifrada, base de datos relacional, storage
de imágenes en S3/R2 y envío de emails transaccionales.

El diseño visual, la paleta de colores, la tipografía y los flujos funcionales siguen la
especificación original tal cual — lo que cambia es la infraestructura por debajo.

## Stack

- **Next.js 14** (App Router, Server Components + Route Handlers)
- **PostgreSQL** vía **Prisma ORM**
- **NextAuth (Auth.js)** con proveedor de credenciales, contraseñas con `bcryptjs`, sesión JWT
- **Tailwind CSS** con los tokens de color/tipografía exactos de la especificación (modo oscuro
  por defecto, modo claro alternable y persistido por usuario)
- **Almacenamiento de imágenes S3-compatible** (`@aws-sdk/client-s3`, funciona con AWS S3,
  Cloudflare R2 o MinIO) con redimensionado automático vía `sharp`; si no hay credenciales
  configuradas, cae a `/public/uploads` en local para desarrollo sin infraestructura externa
- **Resend** para email transaccional (recuperación de contraseña, bienvenida al boletín)
- **Zod** para validación de datos en todos los endpoints

## Puesta en marcha

```bash
npm install
cp .env.example .env   # y rellena las variables (ver abajo)
npm run prisma:migrate # crea las tablas en tu base de datos
npm run db:seed        # crea Marc (admin) y Laia Ferrer (redactora) + categorías base
npm run dev
```

Abre http://localhost:3000. Usuarios de ejemplo (contraseña `checkpoint123` para ambos):

- **Admin** — `marc@checkpoint.dev`
- **Redactora** — `laia@checkpoint.dev`

### Variables de entorno

Ver `.env.example`. Resumen:

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | Sí | Cadena de conexión Postgres |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | Sí | Base de la sesión NextAuth |
| `S3_*` | No | Si se omiten, las imágenes se guardan en `/public/uploads` (solo dev) |
| `RESEND_API_KEY` / `EMAIL_FROM` | No | Si se omite, los emails se registran en la consola del servidor en vez de enviarse |
| `CRON_SECRET` | No | Protege el endpoint de purga de papelera |

## Arquitectura

```
prisma/schema.prisma      Modelo de datos (usuarios, artículos, comentarios, votos, categorías…)
prisma/seed.ts             Datos de ejemplo
src/lib/                   Lógica de dominio: auth, permisos, storage, email, validación
src/app/api/                Endpoints REST (Route Handlers) con comprobación de permisos en servidor
src/app/(páginas)/          Rutas de la app (home, artículo, editor, admin, perfil…)
src/components/            Componentes de UI, organizados por área (layout, article, editor, admin…)
```

Toda comprobación de permisos por rol (lector / redactor / admin) se hace **en el servidor**,
dentro de cada Route Handler (`src/lib/permissions.ts`), nunca solo en el cliente.

### Modelo de datos (resumen)

- `User` (rol, contraseña cifrada, avatar, tema preferido, baneo)
- `Article` (estados `DRAFT → REVIEW → PUBLISHED`, papelera vía `TRASHED` + `deletedAt`,
  coautores, nota del redactor, media de votos de usuarios cacheada para ordenar por
  puntuación sin recalcular en cada consulta)
- `Category` / `Topic` — categorías y temáticas, ambas gestionables dinámicamente desde el
  panel de admin (colores de categoría asignados de una paleta rotatoria)
- `Comment` (un nivel de respuestas, borrado lógico recuperable)
- `CommentReport`, `Like`, `Favorite`, `Rating`, `Notification`, `NewsletterSubscriber`,
  `PasswordResetToken`

### Puntuación con estrellas

Solo se activa cuando `category.slug === "analisis"` y `topic.slug` es `videojuegos` o `cine`
(`src/lib/rating.ts`), igual que en la especificación funcional.

### Papelera con purga a 30 días

Eliminar un artículo o un comentario lo marca como `TRASHED` / `DELETED` con `deletedAt`, no lo
borra. El endpoint `POST /api/cron/purge-trash` (protegido con `Authorization: Bearer
CRON_SECRET`) elimina definitivamente lo que lleve más de 30 días; prográmalo con un cron
externo (Vercel Cron, GitHub Actions, `cron` de tu VPS…) para que se ejecute, por ejemplo, una
vez al día.

### Autoguardado del editor

El editor de artículos guarda un borrador automáticamente cada ~8 segundos si hay cambios sin
guardar (`ArticleEditorForm`), sin bloquear la escritura, y muestra "Autoguardado hace Xs".

## SEO

`sitemap.xml`, `robots.txt` y `rss.xml` se generan dinámicamente a partir de los artículos
publicados. Cada página de artículo incluye metadatos Open Graph.

## Seguridad

- Contraseñas con `bcrypt` (12 rondas), nunca en texto plano
- Sesión JWT firmada (`NEXTAUTH_SECRET`), cookies httpOnly gestionadas por NextAuth
- Recuperación de contraseña con token de un solo uso y caducidad de 1 hora
- Rate limiting best-effort en registro, recuperación de contraseña y creación de comentarios
  (`src/lib/rate-limit.ts` — en memoria; para despliegues multi-instancia se recomienda
  sustituirlo por un store compartido como Redis/Upstash)
- Filtro básico de spam/lenguaje ofensivo en comentarios (`src/lib/moderation.ts`), además de la
  moderación manual (reportes → cola de administración)
- Todas las mutaciones validan el rol del usuario en el servidor antes de tocar la base de datos

## Despliegue

Pensado para desplegarse en cualquier plataforma compatible con Next.js (Vercel, Railway, un
VPS con `next start` detrás de un proxy). Ruta recomendada (todas con capa gratuita):

1. **Sube el repo a GitHub** (ya lo está) y crea cuenta en las plataformas siguientes.
2. **Base de datos** — [Neon](https://neon.tech) o [Supabase](https://supabase.com): crea un
   proyecto Postgres y copia la cadena de conexión a `DATABASE_URL`.
3. **Storage de imágenes** — [Cloudflare R2](https://developers.cloudflare.com/r2/): crea un
   bucket, un token de API (Access Key ID/Secret) y activa acceso público (o un dominio
   personalizado) para obtener `S3_PUBLIC_BASE_URL`. Rellena `S3_BUCKET`, `S3_ENDPOINT`
   (`https://<account_id>.r2.cloudflarestorage.com`), `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
4. **Email** — [Resend](https://resend.com): verifica tu dominio (o usa su dominio de pruebas
   para empezar) y copia la `RESEND_API_KEY`.
5. **Hosting** — [Vercel](https://vercel.com): "Import Project" desde el repo de GitHub,
   eligiendo la rama que quieras desplegar. Añade en *Settings → Environment Variables* todas
   las variables de `.env.example` (`DATABASE_URL`, `NEXTAUTH_URL` con tu dominio final,
   `NEXTAUTH_SECRET` generado con `openssl rand -base64 32`, las `S3_*`, `RESEND_API_KEY`,
   `EMAIL_FROM`, `CRON_SECRET` generado igual que el anterior).
6. **Aplica las migraciones contra la base de datos de producción** (una sola vez, y de nuevo
   cada vez que cambie `schema.prisma`): con `DATABASE_URL` apuntando a Neon/Supabase en tu
   `.env` local, ejecuta `npm run prisma:deploy`. Opcionalmente `npm run db:seed` si quieres
   los usuarios/categorías de ejemplo también en producción.
7. Lanza el deploy en Vercel. `vercel.json` ya incluye un cron diario a las 04:00 UTC contra
   `/api/cron/purge-trash` — Vercel añade automáticamente la cabecera
   `Authorization: Bearer $CRON_SECRET` a esa llamada en cuanto la variable `CRON_SECRET` está
   configurada, así que no hay que hacer nada más para que la papelera se purgue sola.
8. **Dominio propio** — en el proyecto de Vercel, *Settings → Domains*, añade tu dominio y
   sigue las instrucciones DNS (normalmente un registro `A`/`CNAME`). Actualiza `NEXTAUTH_URL`
   al dominio definitivo y vuelve a desplegar.

En otra plataforma (Railway, Render, un VPS) el proceso es el mismo salvo el paso 7: monta tú
mismo el cron (systemd timer, cron de Linux, GitHub Actions programado) contra
`POST /api/cron/purge-trash` con la cabecera `Authorization: Bearer <CRON_SECRET>`.

## Simplificaciones conocidas

Para mantener el alcance manejable, algunas piezas quedan como base sólida pero simplificada:

- El editor de texto enriquecido usa un subconjunto de markdown (`## `, `**`, `*`, `> `,
  `![alt](url)`) con una barra de herramientas, en vez de un editor WYSIWYG completo.
- El voto de estrellas de los lectores usa clics de estrella entera (1–5); el modelo de datos
  admite medios puntos (como la nota del redactor) si se quiere ampliar la UI a media estrella.
- El rate limiting es en memoria (por instancia); para multi-instancia real, usar un store
  compartido.
- La moderación automática es un filtro heurístico simple, pensado como capa adicional a la
  moderación manual, no como sustituto de un servicio dedicado.
- `next@14.2.35` es la última versión parcheada de la rama 14; quedan 2 CVEs "high" abiertos que
  Next.js solo resuelve en la rama 16 (salto de versión mayor, con cambios de API). Se ha
  evitado ese salto en este encargo para no introducir cambios sin validar; revisa `npm audit`
  y planifica la migración a Next 15/16 cuando el resto del roadmap lo permita.
