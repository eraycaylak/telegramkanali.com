CREATE OR REPLACE FUNCTION increment_page_view(p_path text, p_is_new_visitor boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO site_analytics (date, path, page_views, visitors)
    VALUES (CURRENT_DATE, p_path, 1, CASE WHEN p_is_new_visitor THEN 1 ELSE 0 END)
    ON CONFLICT (date, path)
    DO UPDATE SET 
        page_views = site_analytics.page_views + 1,
        visitors = site_analytics.visitors + CASE WHEN p_is_new_visitor THEN 1 ELSE 0 END;
END;
$$;
