import { supabaseServer } from "./supabaseServer";

let cachedSettings = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedSettings() {
  const now = Date.now();
  if (cachedSettings && (now - lastFetchTime < CACHE_TTL)) {
    return cachedSettings;
  }

  const { data: settingsData, error } = await supabaseServer
    .from("settings")
    .select("*");
  
  if (error) {
    console.error("Failed to fetch settings for cache:", error);
    // If we have stale cache, return it rather than failing
    if (cachedSettings) return cachedSettings;
    throw error;
  }

  const settingsMap = {};
  settingsData.forEach(row => {
    settingsMap[row.key] = row.value;
  });

  cachedSettings = settingsMap;
  lastFetchTime = now;
  return cachedSettings;
}

export function clearSettingsCache() {
  cachedSettings = null;
  lastFetchTime = 0;
}
