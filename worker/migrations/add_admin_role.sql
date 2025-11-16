-- Migration: Add admin role to Users table
-- Date: 2025-11-16

-- Add role column to Users table (SQLite doesn't support ALTER COLUMN, so we need to recreate the table)
-- First, create a new table with the role column
CREATE TABLE IF NOT EXISTS Users_new (
    id TEXT PRIMARY KEY,
    google_subject_id TEXT UNIQUE NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'user' NOT NULL CHECK(role IN ('user', 'admin')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Copy existing data (all users will have 'user' role by default)
INSERT INTO Users_new (id, google_subject_id, email, created_at)
SELECT id, google_subject_id, email, created_at FROM Users;

-- Drop old table
DROP TABLE Users;

-- Rename new table
ALTER TABLE Users_new RENAME TO Users;

-- Recreate indexes if any were on the Users table
-- (None in the current schema, but keeping this comment for reference)
