export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ responseMessage: 'Method not allowed' });
  return res.status(200).json({ status: 'PENDING', responseMessage: 'Query Payment template aktif. Hubungkan credential DANA untuk production.' });
}
