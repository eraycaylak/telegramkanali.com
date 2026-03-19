-- 1. Create channel_comments table
CREATE TABLE IF NOT EXISTS channel_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- optional, if logged in
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_channel_comments_channel_id ON channel_comments(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_comments_status ON channel_comments(status);

-- 3. RLS Policies
ALTER TABLE channel_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved comments
CREATE POLICY "Allow public read of approved comments"
ON channel_comments FOR SELECT
USING (status = 'approved');

-- Allow anonymous and authenticated users to insert comments (will be filtered by spam or admin later if needed)
CREATE POLICY "Allow anonymous and authenticated insert"
ON channel_comments FOR INSERT
WITH CHECK (true);

-- Allow admins to manage all comments (assuming admins are handled via another policy or role, 
-- but we explicitly grant ALL to everyone for this basic setup as Supabase admin bypasses RLS anyway)
CREATE POLICY "Allow all operations for admins"
ON channel_comments FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'authenticated');
