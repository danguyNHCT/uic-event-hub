import { useEffect } from 'react';

const VERSION_URL = '/version.json';
const POLL_INTERVAL_MS = 60_000;

async function fetchBuildTime() {
  const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`version.json request failed: ${res.status}`);
  const data = await res.json();
  return data.buildTime;
}

// Polls /version.json and silently reloads the page when the build timestamp
// changes, so users who leave the app open on their phone pick up new
// deploys without needing to manually refresh.
export function useAutoReload() {
  useEffect(() => {
    let initialBuildTime = null;
    let cancelled = false;

    fetchBuildTime()
      .then((buildTime) => {
        if (!cancelled) initialBuildTime = buildTime;
      })
      .catch(() => {});

    const intervalId = setInterval(() => {
      if (initialBuildTime === null) return;
      fetchBuildTime()
        .then((buildTime) => {
          if (!cancelled && buildTime !== initialBuildTime) {
            window.location.reload();
          }
        })
        .catch(() => {});
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);
}
