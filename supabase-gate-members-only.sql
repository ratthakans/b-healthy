-- ============================================================
-- B-Healthy — gated articles are for members only
--
-- Retires the e-mail gate (bh_unlock / bh_article_body). The site no longer
-- shows the e-mail form, but the two functions were still callable by anyone
-- with the public key — a reader could hand over any address and get the full
-- text back. Taking EXECUTE away closes that door: the only way to the body
-- is now bh_member_article_body, which needs a signed-in account.
--
-- Tokens already handed out stop working at once; those readers see the
-- sign-up card like everyone else. Leads already recorded in `submissions`
-- (type 'member', subject 'Article unlock') are left where they are.
--
-- Safe to run more than once.
-- ============================================================
revoke all on function public.bh_unlock(text, text)       from public, anon, authenticated;
revoke all on function public.bh_article_body(text, text) from public, anon, authenticated;
