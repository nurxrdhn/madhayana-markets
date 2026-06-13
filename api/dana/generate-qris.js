export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ responseMessage: 'Method not allowed' });
  const body = req.body || {};
  return res.status(200).json({
    mode: process.env.DANA_MERCHANT_ID ? 'ready-template' : 'mock-static-fallback',
    status: 'PENDING',
    referenceNo: body.partnerReferenceNo || body.id,
    qrContent: '',
    responseCode: '2000000',
    responseMessage: process.env.DANA_MERCHANT_ID
      ? 'DANA credential tersedia. Lengkapi signature untuk production.'
      : 'DANA ENV belum aktif. Memakai QRIS statis Madhayana.'
  });
}
