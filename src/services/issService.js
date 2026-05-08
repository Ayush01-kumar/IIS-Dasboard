const ISS_URL = 'http://api.open-notify.org/iss-now.json';
const ASTROS_URL = 'http://api.open-notify.org/astros.json';

export async function fetchIssNow() {
  const response = await fetch(ISS_URL);
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
  const response = await fetch(ASTROS_URL);
  if (!response.ok) {
    throw new Error('Astronaut API unavailable');
  }

  const data = await response.json();
  return {
    number: data.number ?? 0,
    people: data.people ?? [],
  };
}
