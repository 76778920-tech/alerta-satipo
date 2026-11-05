# Base de datos

`supabase/migrations/` contiene el esquema, las políticas y las funciones SQL.
`supabase/seed.sql` contiene los datos iniciales.
`supabase/config.toml` configura el proyecto de la CLI.

La CLI necesita un subdirectorio llamado `supabase`. Por eso se conserva dentro
de `database/` y se ejecuta desde la raíz con `--workdir database`.

Ejemplos:

```sh
npx supabase --workdir database migration list
npx supabase --workdir database db push --include-seed
```

El segundo comando aplica cambios remotos: usarlo únicamente cuando corresponda
publicar migraciones. Reorganizar las carpetas no modifica la base de datos remota.

`supabase/functions/admin-api/index.ts` es un archivo generado por `npm run build:api`.
Se conserva junto a la configuración de despliegue de la CLI; su código fuente está
en `backend/` y debe editarse allí.
