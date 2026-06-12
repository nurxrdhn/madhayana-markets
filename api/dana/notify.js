import { readJson, mapDanaStatus } from '../_lib/dana.js';

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ responseCode:'4054300', responseMessage:'Method Not Allowed' });
  const payload = await readJson(req);
  const status = mapDanaStatus(payload.latestTransactionStatus);

  // Production note:
  // Save payload to database here: Firestore/Supabase/Postgres/Upstash.
  // Frontend operator dashboard can subscribe to that database for real-time status.
  console.log('DANA_FINISH_NOTIFY', JSON.stringify({ status, payload }));

  return res.status(200).json({ responseCode: '2004300', responseMessage: 'Successful' });
}
