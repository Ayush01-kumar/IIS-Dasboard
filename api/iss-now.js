export default async function handler(req, res) {
  try {
    const response = await fetch('http://api.open-notify.org/iss-now.json');
    if (!response.ok) {
      return res.status(502).json({ message: 'Upstream ISS API unavailable' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch ISS data' });
  }
}
