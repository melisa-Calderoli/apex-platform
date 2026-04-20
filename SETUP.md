# APEX Strategic Platform - Setup

Plataforma de consultoría estratégica con IA (Claude Sonnet 4.5).

## Pasos para deployar

### 1. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) → New Project
2. Nombre: `apex-platform`
3. Password de DB (guardarla)
4. Región: cercana (São Paulo si estás en Argentina)

### 2. Correr la migración

1. En Supabase → SQL Editor → New Query
2. Copiar el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ejecutar (Run)

Esto crea todas las tablas con Row Level Security (RLS) configurada.

### 3. Obtener credenciales de Supabase

En Supabase → Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL` → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` → service_role (secret) key

### 4. Crear API key de Anthropic

1. Ir a [console.anthropic.com](https://console.anthropic.com)
2. Crear cuenta si no tenés
3. API Keys → Create Key
4. Copiar el key → `ANTHROPIC_API_KEY`

### 5. Crear el primer admin

En Supabase → Authentication → Users → Add user:
- Email: tu email
- Password: la que quieras
- Email confirm: checked

Después en SQL Editor:

```sql
-- Obtener el user id del admin creado
select id, email from auth.users;

-- Crear profile admin (reemplazar <user_id> con el UUID)
insert into profiles (id, role, full_name)
values ('<user_id>', 'admin', 'Tu Nombre');
```

### 6. Crear repo en GitHub y conectar Vercel

1. Crear repo `apex-platform` en GitHub
2. Conectar desde Vercel → Import Git Repository
3. Agregar las env vars en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy

### 7. Desarrollo local

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000), login con el admin que creaste.

## Flujo de uso

1. **Admin** crea clientes (empresa + usuario)
2. **Cliente** (o admin) completa el **Diagnóstico** (6 secciones)
3. APEX genera análisis completo (FODA, hallazgos, scores, oportunidades)
4. Click "Generar Plan Estratégico" → APEX genera plan integral
5. Click "Generar Plan Operativo" → APEX genera objetivos SMART + acciones
6. **Tracker Kanban**: drag & drop de acciones entre columnas
7. **Chat APEX**: consultas con contexto completo del cliente

## Modelo Claude

Se usa `claude-sonnet-4-5-20250929`. Cambiar en `src/lib/apex.ts` si necesitás otro.

## Estructura

```
src/
├── app/
│   ├── (auth)/login
│   ├── admin/             (panel admin)
│   ├── client/[companyId] (panel cliente)
│   └── api/               (endpoints)
├── components/            (Sidebar, ChatInterface)
├── lib/
│   ├── apex.ts            (system prompt + context builder)
│   ├── supabase/          (clients SSR + browser)
│   ├── types.ts
│   └── utils.ts
└── middleware.ts          (protección rutas)

supabase/
└── migrations/
    └── 001_initial_schema.sql
```
