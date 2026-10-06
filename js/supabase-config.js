// supabase-config.js — Conexão com o Supabase (projeto gratuito, região São Paulo)
// A chave "publishable" é pública por design: pode ir no navegador.
// Requer o supabase-js (UMD) carregado antes deste arquivo.

const SUPABASE_URL = "https://gbeuvgsipxyodqyzsbdc.supabase.co";
const SUPABASE_KEY = "sb_publishable_7uVk1fV98v7g_1u19XCA8g_lAwE125C";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
