ALTER TABLE "Match"
ADD COLUMN "local_min" smallint
GENERATED ALWAYS AS (
  (
    (
      ((floor(extract(epoch from "dateTime") / 60.0))::bigint - 180)  -- minutos UTC - 180
      % 1440
      + 1440
    ) % 1440
  )::smallint
) STORED;

-- Si aún no existe:
CREATE INDEX IF NOT EXISTS "idx_match_local_min" ON "Match"("local_min");
