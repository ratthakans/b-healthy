// ============================================================
// B-Healthy — runtime config
// Fill these from your Supabase project: Dashboard → Project Settings → API.
// The "anon public" key is SAFE to expose in the browser (protected by RLS).
// Leave blank to keep the forms in front-end demo mode.
// ============================================================
window.BH_CONFIG = {
  SUPABASE_URL: "https://gngibdrjcnshyqkomkjs.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_8JnUdebfbaiZmmBEKu2LkQ_4U_x3OKk",  // publishable key — safe to expose (RLS-protected)

  // Show "Sign in" in the menu. Off until supabase-members.sql has run AND
  // Authentication → Email → "Confirm email" is switched off — before then a
  // visitor could sign up and wait forever for a mail Supabase will not send.
  // /account itself works either way, so it can be tried before it is shown.
  MEMBERS: false
};
