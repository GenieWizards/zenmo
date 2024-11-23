import { sql } from "drizzle-orm";

import env from "@/env";

import { db, queryClient } from "../adapter";

async function clearDb(): Promise<void> {
  if (env.NODE_ENV !== "test") {
    throw new Error("This script can only be run in test environment");
  }

  try {
    const dropQuery = sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        -- Disable triggers
        EXECUTE 'SET session_replication_role = replica';
        
        -- Drop foreign key constraints
        FOR r IN (SELECT DISTINCT constraint_name, table_name 
                 FROM information_schema.table_constraints 
                 WHERE constraint_type = 'FOREIGN KEY') LOOP
          EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) || 
                  ' DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;

        -- Drop tables
        FOR r IN (SELECT tablename FROM pg_tables 
                 WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;

        -- Drop views
        FOR r IN (SELECT viewname FROM pg_views 
                 WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
        END LOOP;

        -- Drop types
        FOR r IN (SELECT typname FROM pg_type 
                 WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
                 AND typtype = 'c') LOOP
          EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
        END LOOP;

        -- Drop sequences
        FOR r IN (SELECT sequence_name FROM information_schema.sequences 
                 WHERE sequence_schema = 'public') LOOP
          EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
        END LOOP;

        -- Reset triggers
        EXECUTE 'SET session_replication_role = DEFAULT';
      END $$;
    `;

    await db.execute(dropQuery);
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  } finally {
    // Properly close the database queryClient
    await queryClient.end();
  }
}

// Only run if this script is called directly
if (require.main === module) {
  clearDb()
    .catch((error) => {
      console.error("Failed to clear database:", error);
      process.exit(1);
    })
    .finally(() => {
      process.exit(0);
    });
}

export default clearDb;
