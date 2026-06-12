import { readJson, nowJakarta, signTransaction, buildHeaders, danaBaseUrl, isConfigured } from '../_lib/dana.js';

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({ responseCode:'4050000', responseMessage:'Method Not Allowed' });
  const order = await readJson(req);
  const partnerReferenceNo = order.partnerReferenceNo || order.id || `MM-${Date.now()}`;
  const total = Number(order.total || 0);
  const customerPhone = (order.customer?.phone || '').replace(/^0/, '62');
  const timestamp = nowJakarta();

  // DANA Widget/API style direct payment body. Field can be adjusted to exact product enabled during DANA onboarding.
  const body = {
    partnerReferenceNo,
    merchantId: process.env.DANA_MERCHANT_ID || process.env.DANA_CLIENT_ID || 'MADHAYANA_MARKETS',
    amount: { value: total.toFixed(2), currency: 'IDR' },
    urlParams: [
      { url: `${process.env.APP_ORIGIN || ''}/payment-result?order=${partnerReferenceNo}`, type: 'PAY_RETURN', isDeeplink: 'N' },
      { url: `${process.env.APP_ORIGIN || ''}/api/dana/notify`, type: 'NOTIFICATION', isDeeplink: 'N' }
    ],
    payOptionDetails: [
      {
        payMethod: 'BALANCE',
        payOption: 'DANA_BALANCE',
        transAmount: { value: total.toFixed(2), currency: 'IDR' },
        additionalInfo: { payerAccountNo: customerPhone, topupAndPay: true }
      }
    ],
    additionalInfo: {
      order: {
        orderTitle: `Madhayana Markets ${partnerReferenceNo}`,
        buyer: { nickname: order.customer?.name || 'Customer', externalUserId: customerPhone, externalUserType: 'PHONE_NUMBER' },
        goods: (order.items || []).map((item) => ({
          merchantGoodsId: item.id,
          description: item.title,
          category: item.category || 'DIGITAL',
          price: { value: Number(item.price || 0).toFixed(2), currency: 'IDR' },
          quantity: '1'
        }))
      },
      envInfo: {
        sourcePlatform: 'IPG',
        orderTerminalType: 'WEB',
        terminalType: 'WEB',
        websiteLanguage: 'id-ID'
      }
    }
  };

  if(!isConfigured()){
    return res.status(200).json({
      mode: 'mock',
      responseCode: '2005600',
      responseMessage: 'Mock DANA payment created. Configure env for real DANA.',
      status: 'PENDING',
      latestTransactionStatus: '03',
      referenceNo: `DANA-MOCK-${Date.now()}`,
      redirectUrl: '',
      partnerReferenceNo
    });
  }

  const path = process.env.DANA_DIRECT_DEBIT_PATH || '/v1.0/debit/payment.htm';
  const signature = signTransaction({ method:'POST', path, body, timestamp });
  const response = await fetch(`${danaBaseUrl()}${path}`, {
    method: 'POST',
    headers: buildHeaders({ signature, timestamp, customerToken: process.env.DANA_CUSTOMER_TOKEN }),
    body: JSON.stringify(body)
  });
  const dana = await response.json().catch(() => ({}));
  return res.status(response.ok ? 200 : response.status).json({
    mode: 'dana',
    status: dana.responseCode?.startsWith('200') ? 'PENDING' : 'FAILED',
    partnerReferenceNo,
    referenceNo: dana.referenceNo,
    redirectUrl: dana.webRedirectUrl || dana.redirectUrl || dana.additionalInfo?.redirectUrl || '',
    ...dana
  });
}
