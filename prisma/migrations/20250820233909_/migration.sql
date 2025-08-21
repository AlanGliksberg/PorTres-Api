-- Quitar lo anterior si existe
DROP INDEX IF EXISTS "idx_match_local_min";
ALTER TABLE "Match" DROP COLUMN IF EXISTS "local_min";

-- Volver a crear la columna como GENERADA (sin offset porque "dateTime" es timestamp without time zone)
ALTER TABLE "Match"
ADD COLUMN "local_min" smallint
GENERATED ALWAYS AS (
  (
    (EXTRACT(HOUR   FROM "dateTime")::int * 60)
  +  EXTRACT(MINUTE FROM "dateTime")::int
  )::smallint
) STORED;

-- Re-crear el índice
CREATE INDEX IF NOT EXISTS "idx_match_local_min" ON "Match"("local_min");
