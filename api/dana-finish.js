import { readJson, danaStatus } from './_lib/dana.js';
import { updateOrder } from './_lib/firebaseAdmin.js';
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(200).json({responseCode:'2000000',responseMessage:'DANA Finish Notify endpoint ready'});
  const payload=await readJson(req);
  const partner=payload.originalPartnerReferenceNo||payload.partnerReferenceNo;
  const status=danaStatus(payload.latestTransactionStatus);
  const result=await updateOrder(partner,{status,referenceNo:payload.originalReferenceNo||'',originalExternalId:payload.originalExternalId||'',transactionStatusDesc:payload.transactionStatusDesc||'',paidAtText:payload.finishedTime||payload.additionalInfo?.paymentInfo?.paidTime||'',danaNotifyPayload:payload});
  return res.status(200).json({responseCode:'2000000',responseMessage:'SUCCESS',status,update:result});
}
