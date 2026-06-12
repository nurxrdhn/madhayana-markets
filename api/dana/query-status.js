import { readJson, nowJakarta, signTransaction, buildHeaders, danaBaseUrl, isConfigured, mapDanaStatus } from '../_lib/dana.js';

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ responseCode:'4050000', responseMessage:'Method Not Allowed' });
  const body = await readJson(req);
  const timestamp = nowJakarta();
  const requestBody = {
    originalPartnerReferenceNo: body.originalPartnerReferenceNo || body.partnerReferenceNo,
    originalReferenceNo: body.originalReferenceNo || body.referenceNo || '',
    serviceCode: '00',
    additionalInfo: {}
  };

  if(!isConfigured()){
    return res.status(200).json({ mode:'mock', responseCode:'2000000', responseMessage:'Successful', latestTransactionStatus:'00', status:'PAID', transactionStatusDesc:'Mock success' });
  }

  const path = process.env.DANA_STATUS_PATH || '/v1.0/emoney/transfer-bank-status.htm';
  const signature = signTransaction({ method:'POST', path, body: requestBody, timestamp });
  const response = await fetch(`${danaBaseUrl()}${path}`, {
    method:'POST', headers: buildHeaders({ signature, timestamp }), body: JSON.stringify(requestBody)
  });
  const dana = await response.json().catch(() => ({}));
  return res.status(response.ok ? 200 : response.status).json({ ...dana, status: mapDanaStatus(dana.latestTransactionStatus) });
}
