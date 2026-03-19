-- RPC to atomically deduct tokens and create a campaign
CREATE OR REPLACE FUNCTION create_ad_campaign_atomic(
    p_user_id UUID,
    p_channel_id UUID,
    p_ad_type TEXT,
    p_pricing_id UUID
) RETURNS UUID AS $$
DECLARE
    v_tokens_required INTEGER;
    v_views INTEGER;
    v_price_label TEXT;
    v_current_balance INTEGER;
    v_new_campaign_id UUID;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- 1. Get pricing details
    SELECT tokens_required, views, label INTO v_tokens_required, v_views, v_price_label
    FROM ad_pricing 
    WHERE id = p_pricing_id AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'invalid_pricing';
    END IF;

    -- 2. Check and deduct tokens ATOMICALLY
    UPDATE profiles
    SET token_balance = token_balance - v_tokens_required
    WHERE id = p_user_id AND token_balance >= v_tokens_required
    RETURNING token_balance INTO v_current_balance;

    -- If no row was updated, balance was insufficient
    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'insufficient_funds';
    END IF;

    -- 3. Calculate expiration if story
    IF p_ad_type = 'story' THEN
        v_expires_at := NOW() + interval '24 hours';
    ELSE
        v_expires_at := NULL;
    END IF;

    -- 4. Create campaign record
    INSERT INTO ad_campaigns (
        user_id, channel_id, ad_type, total_views, current_views,
        tokens_spent, status, expires_at
    ) 
    VALUES (
        p_user_id, p_channel_id, p_ad_type, v_views, 0,
        v_tokens_required, 'pending', v_expires_at
    )
    RETURNING id INTO v_new_campaign_id;

    -- 5. Create transaction log
    INSERT INTO token_transactions (
        user_id, type, amount, description, reference_id, balance_after
    )
    VALUES (
        p_user_id, 'spend', -v_tokens_required,
        (CASE WHEN p_ad_type = 'featured' THEN 'Öne Çıkarma' WHEN p_ad_type = 'banner' THEN 'Banner' ELSE 'Hikaye' END) || ' Reklam - ' || v_tokens_required || ' Jeton (' || v_price_label || ')',
        v_new_campaign_id, v_current_balance
    );

    RETURN v_new_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC to atomically cancel a pending campaign and refund tokens
CREATE OR REPLACE FUNCTION refund_ad_campaign_atomic(
    p_campaign_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_tokens_spent INTEGER;
    v_status TEXT;
    v_new_balance INTEGER;
BEGIN
    SELECT tokens_spent, status INTO v_tokens_spent, v_status
    FROM ad_campaigns
    WHERE id = p_campaign_id AND user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;
    IF v_status != 'pending' THEN RAISE EXCEPTION 'invalid_status'; END IF;

    -- Mark as cancelled
    UPDATE ad_campaigns SET status = 'cancelled', updated_at = NOW() WHERE id = p_campaign_id;

    -- Refund tokens
    UPDATE profiles SET token_balance = COALESCE(token_balance, 0) + v_tokens_spent WHERE id = p_user_id RETURNING token_balance INTO v_new_balance;

    -- Create log
    INSERT INTO token_transactions (user_id, type, amount, description, reference_id, balance_after)
    VALUES (p_user_id, 'refund', v_tokens_spent, 'Reklam İptali İadesi (' || v_tokens_spent || ' Jeton)', p_campaign_id, v_new_balance);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to atomically delete a cancelled or pending campaign. If pending, refunds first.
CREATE OR REPLACE FUNCTION delete_ad_campaign_atomic(
    p_campaign_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_status TEXT;
BEGIN
    SELECT status INTO v_status FROM ad_campaigns WHERE id = p_campaign_id AND user_id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'not_found'; END IF;

    IF v_status = 'pending' THEN
        PERFORM refund_ad_campaign_atomic(p_campaign_id, p_user_id);
    ELSIF v_status != 'cancelled' THEN
        RAISE EXCEPTION 'invalid_status';
    END IF;

    DELETE FROM ad_campaigns WHERE id = p_campaign_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
