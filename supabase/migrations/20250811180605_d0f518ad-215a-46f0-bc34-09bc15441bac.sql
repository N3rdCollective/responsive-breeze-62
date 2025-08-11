-- Attempt to update non-system extensions to the latest recommended versions
DO $$
DECLARE ext RECORD;
BEGIN
  FOR ext IN
    SELECT extname
    FROM pg_extension
    WHERE extname NOT IN ('plpgsql') -- keep default language untouched explicitly
  LOOP
    BEGIN
      EXECUTE format('ALTER EXTENSION %I UPDATE', ext.extname);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not update extension %: %', ext.extname, SQLERRM;
    END;
  END LOOP;
END$$;