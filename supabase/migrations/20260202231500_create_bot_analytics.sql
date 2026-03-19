CREATE TABLE IF NOT EXISTS bot_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    joins INTEGER DEFAULT 0,
    leaves INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    UNIQUE(channel_id, date)
);

ALTER TABLE bot_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of bot_analytics" ON bot_analytics FOR SELECT USING (true);
CREATE POLICY "Allow service_role insert/update" ON bot_analytics FOR ALL USING (true) WITH CHECK (true);
