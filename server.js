/* ============================================
   GoonerCraft server hub — live status widget
   ============================================ */

// ==== CONFIG ============================================================
// Public address players connect with (the playit.gg game tunnel).
// This is what mcstatus.io pings, so it must be reachable from the internet.
const SERVER_ADDRESS = "dvd-vitalize.gl.joinmc.link";
// BlueMap web UI. LAN address by default; swap for a public URL if you
// ever tunnel/proxy the map.
const BLUEMAP_URL = "minecraft-map.simonteague.xyz";
// ========================================================================

const STATUS_API = "https://api.mcstatus.io/v2/status/java/";

function el(id) { return document.getElementById(id); }

function setStatus(cls, line, sub) {
  el("status-dot").className = "status-dot " + cls;
  el("status-line").textContent = line;
  el("status-sub").textContent = sub;
}

async function refreshStatus() {
  el("map-link").href = BLUEMAP_URL;
  el("server-addr").textContent = SERVER_ADDRESS;

  if (SERVER_ADDRESS.startsWith("CHANGE_ME")) {
    setStatus("unknown", "Status not configured", "Set SERVER_ADDRESS in server.js");
    return;
  }

  try {
    const res = await fetch(STATUS_API + encodeURIComponent(SERVER_ADDRESS));
    const data = await res.json();
    if (data.online) {
      const players = data.players
        ? `${data.players.online} / ${data.players.max} online`
        : "online";
      const names = (data.players && data.players.list || [])
        .map(p => p.name_clean).filter(Boolean).join(", ");
      setStatus("online", players, names || (data.version ? data.version.name_clean : ""));
    } else {
      setStatus("offline", "Server offline", "");
    }
  } catch (err) {
    setStatus("unknown", "Status unavailable", "");
  }
}

refreshStatus();
setInterval(refreshStatus, 60_000);
