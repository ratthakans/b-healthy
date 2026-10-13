// ============================================================
// B-Healthy — runtime config
// Fill these from your Supabase project: Dashboard → Project Settings → API.
// The "anon public" key is SAFE to expose in the browser (protected by RLS).
// Leave blank to keep the forms in front-end demo mode.
// ============================================================
window.BH_CONFIG = {
  SUPABASE_URL: "https://gngibdrjcnshyqkomkjs.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_8JnUdebfbaiZmmBEKu2LkQ_4U_x3OKk",  // publishable key — safe to expose (RLS-protected)

  // Every way in to sign-up: the menu link, the article card, the blog page
  // and the wellness check. On since 2026-10-14, once supabase-members.sql had
  // run and "Confirm email" was off. Set false to hide them all again without
  // touching an account — /account itself keeps working either way.
  MEMBERS: true
};
