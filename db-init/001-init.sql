-- =========================================
-- Dynamic Dash-Builder – DB Init
-- =========================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================
-- TABELLEN
-- =========================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL
);

CREATE TABLE dashboard_widgets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    widget_type     TEXT NOT NULL, -- 'notes' | 'todo' | 'weather' | 'time' | 'test'
    position        INT NOT NULL,
    is_active       BOOL NOT NULL DEFAULT true,
    weather_city    TEXT
);

CREATE TABLE notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    header          TEXT NOT NULL,
    note            TEXT
);

CREATE TABLE todos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    header          TEXT NOT NULL,
    text            TEXT,
    prio            TEXT NOT NULL DEFAULT 'mittel', -- 'niedrig' | 'mittel' | 'hoch'
    erledigt        BOOL NOT NULL DEFAULT false,
    erinnerung      TIMESTAMP
);

-- =========================================
-- TEST USER
-- Passwort für alle: test1234
-- =========================================

INSERT INTO users (username, password_hash) VALUES
    ('testuser1', '$2b$12$dsg.PrClUGm4zYiY5JuJAeXV3wHu1FUCQfHR80VX1cBKlUFhH.Zcm'),
    ('testuser2', '$2b$12$dsg.PrClUGm4zYiY5JuJAeXV3wHu1FUCQfHR80VX1cBKlUFhH.Zcm'),
    ('testuser3', '$2b$12$dsg.PrClUGm4zYiY5JuJAeXV3wHu1FUCQfHR80VX1cBKlUFhH.Zcm');
