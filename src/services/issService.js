const ISS_PROXY_URL = '/api/iss-now';
const ASTROS_PROXY_URL = '/api/astros';
const ISS_FALLBACK_URL = 'http://api.open-notify.org/iss-now.json';
const ASTROS_FALLBACK_URL = 'http://api.open-notify.org/astros.json';

async function fetchWithFallback(primaryUrl, fallbackUrl) {
  try {
    const primary = await fetch(primaryUrl);
    if (primary.ok) return primary;
  } catch {
    // Ignore and try fallback.
  }

  const fallback = await fetch(fallbackUrl);
  return fallback;
}

export async function fetchIssNow() {
  const response = await fetchWithFallback(ISS_PROXY_URL, ISS_FALLBACK_URL);
  if (!response.ok) {
    throw new Error('ISS API unavailable');
  }

  const data = await response.json();
  return {
    lat: Number(data.iss_position?.latitude),
    lon: Number(data.iss_position?.longitude),
    timestamp: Date.now(),
  };
}

export async function fetchAstronauts() {
  const response = await fetchWithFallback(ASTROS_PROXY_URL, ASTROS_FALLBACK_URL);
  if (!response.ok) {
    throw new Error('Astronaut API unavailable');
  }

  const data = await response.json();
  return {
    number: data.number ?? 0,
    people: data.people ?? [],
  };
}
