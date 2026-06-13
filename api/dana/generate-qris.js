import { readJson, nowJakarta, addMinutesJakarta, configured, signRequest, headers, baseUrl } from '../_lib/dana.js';

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({responseCode:'4050000',responseMessage:'Method Not Allowed'});
  const order=await readJson(req);
  const amount=Number(order.grandTotal||order.total||0);
  const partnerReferenceNo=order.partnerReferenceNo||order.id||`MM-${Date.now()}`;
  const path=process.env.DANA_QRIS_GENERATE_PATH||'/v1.0/qr/qr-mpm-generate.htm';
  const timestamp=nowJakarta();
  const body={
    merchantId:process.env.DANA_MERCHANT_ID||'',
    subMerchantId:process.env.DANA_SUB_MERCHANT_ID||'',
    storeId:process.env.DANA_STORE_ID||'madhayana-market',
    terminalId:'A01',
    partnerReferenceNo,
    amount:{value:amount.toFixed(2),currency:'IDR'},
    validityPeriod:addMinutesJakarta(15),
    additionalInfo:{terminalSource:'MER',envInfo:{sessionId:partnerReferenceNo,websiteLanguage:'id_ID',clientIp:req.headers['x-forwarded-for']||'127.0.0.1',osType:'WEB',appVersion:'5.0.0',sdkVersion:'1.0',sourcePlatform:'IPG',terminalType:'SYSTEM',orderTerminalType:'WEB',merchantAppVersion:'5.0.0',extendInfo:JSON.stringify({bizScenario:'MADHAYANA_MARKET_QRIS_MPM'})}}
  };
  if(!configured()) return res.status(200).json({mode:'static-qris-real-fallback',responseCode:'2004700',responseMessage:'DANA credential belum aktif. Frontend menampilkan QRIS asli Madhayana Market.',status:'PENDING',partnerReferenceNo,referenceNo:partnerReferenceNo,qrContent:'',qrImage:'/qris-madhayana-market.jpg',expiresAt:body.validityPeriod});
  const sig=signRequest({method:'POST',path,body,timestamp});
  const r=await fetch(`${baseUrl()}${path}`,{method:'POST',headers:headers({signature:sig,timestamp}),body:JSON.stringify(body)});
  const dana=await r.json().catch(()=>({}));
  const qrContent=dana.qrContent||dana.QRContent||dana.qrPayload||dana.additionalInfo?.qrContent||'';
  return res.status(r.ok?200:r.status).json({...dana,mode:'dana-qris-mpm',status:qrContent?'PENDING':'FAILED',partnerReferenceNo,referenceNo:dana.referenceNo||'',qrContent,qrPayload:qrContent,expiresAt:body.validityPeriod});
}
