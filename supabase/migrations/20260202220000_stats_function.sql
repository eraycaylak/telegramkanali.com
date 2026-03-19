CREATE OR REPLACE FUNCTION increment_bot_stat(chan_id uuid, stat_date date, col text)
RETURNS void AS $$
BEGIN
  INSERT INTO bot_analytics (channel_id, date, joins, leaves)
  VALUES (chan_id, stat_date, 
    CASE WHEN col = 'joins' THEN 1 ELSE 0 END, 
    CASE WHEN col = 'leaves' THEN 1 ELSE 0 END
  )
  ON CONFLICT (channel_id, date) 
  DO UPDATE SET
    joins = bot_analytics.joins + (CASE WHEN col = 'joins' THEN 1 ELSE 0 END),
    leaves = bot_analytics.leaves + (CASE WHEN col = 'leaves' THEN 1 ELSE 0 END);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
