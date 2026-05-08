export default async function handler(req, res) {
  try {
    const response = await fetch('http://api.open-notify.org/astros.json');
    if (!response.ok) {
      return res.status(502).json({ message: 'Upstream astronaut API unavailable' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch astronaut data' });
  }
}
