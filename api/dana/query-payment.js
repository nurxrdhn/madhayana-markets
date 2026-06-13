import { readJson, nowJakarta, configured, signRequest, headers, baseUrl, danaStatus } from '../_lib/dana.js';
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({responseCode:'4050000',responseMessage:'Method Not Allowed'});
  const order=await readJson(req); const path=process.env.DANA_QRIS_QUERY_PATH||'/v1.0/qr/qr-mpm-query.htm'; const timestamp=nowJakarta();
  const body={originalPartnerReferenceNo:order.originalPartnerReferenceNo||order.partnerReferenceNo||order.id,originalReferenceNo:order.originalReferenceNo||order.referenceNo||'',merchantId:process.env.DANA_MERCHANT_ID||'',serviceCode:'47',additionalInfo:{}};
  if(!configured()) return res.status(200).json({mode:'static-qris-real',responseCode:'2000000',responseMessage:'DANA API belum aktif. Untuk QRIS statis, cek mutasi merchant lalu operator tekan Paid.',status:'PENDING',latestTransactionStatus:'03'});
  const sig=signRequest({method:'POST',path,body,timestamp}); const r=await fetch(`${baseUrl()}${path}`,{method:'POST',headers:headers({signature:sig,timestamp}),body:JSON.stringify(body)});
  const dana=await r.json().catch(()=>({})); return res.status(r.ok?200:r.status).json({...dana,status:danaStatus(dana.latestTransactionStatus)});
}
