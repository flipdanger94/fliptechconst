CREATE TABLE IF NOT EXISTS leads (
 id UUID PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL, company TEXT NOT NULL,
 request_type TEXT NOT NULL CHECK(request_type IN ('review','new')), website TEXT, phone TEXT,
 details TEXT, consent BOOLEAN NOT NULL CHECK(consent), consent_version TEXT NOT NULL DEFAULT '2026-10-12',
 source TEXT, utm JSONB NOT NULL DEFAULT '{}', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 notification_status TEXT NOT NULL DEFAULT 'pending', notified_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS lead_rate_limits (
 key TEXT PRIMARY KEY, attempts INTEGER NOT NULL DEFAULT 1, expires_at TIMESTAMPTZ NOT NULL
);
