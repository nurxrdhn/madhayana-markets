import crypto from 'crypto';

export function nowJakarta(){
  const date = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const jakarta = new Date(utc + 7 * 60 * 60000);
  return `${jakarta.getFullYear()}-${pad(jakarta.getMonth()+1)}-${pad(jakarta.getDate())}T${pad(jakarta.getHours())}:${pad(jakarta.getMinutes())}:${pad(jakarta.getSeconds())}+07:00`;
}

export function minifyJson(data){
  if (!data) return '';
  return JSON.stringify(data);
}

export function sha256Hex(value){
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex').toLowerCase();
}

export function normalizePrivateKey(key){
  if(!key) return '';
  return key.replace(/\\n/g, '\n');
}

export function signAsymmetric(stringToSign){
  const privateKey = normalizePrivateKey(process.env.DANA_PRIVATE_KEY || '');
  if(!privateKey) return '';
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(stringToSign);
  signer.end();
  return signer.sign(privateKey, 'base64');
}

export function signTransaction({ method, path, body, timestamp }){
  const bodyHash = sha256Hex(minifyJson(body));
  const stringToSign = `${method}:${path}:${bodyHash}:${timestamp}`;
  return signAsymmetric(stringToSign);
}

export async function readJson(req){
  if (req.body) return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function danaBaseUrl(){
  if(process.env.DANA_BASE_URL) return process.env.DANA_BASE_URL;
  return process.env.DANA_ENV === 'production' ? 'https://api.saas.dana.id' : 'https://api.sandbox.dana.id';
}

export function isConfigured(){
  return Boolean(process.env.DANA_CLIENT_ID && process.env.DANA_PRIVATE_KEY && process.env.DANA_CHANNEL_ID);
}

export function buildHeaders({ signature, timestamp, customerToken }){
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-TIMESTAMP': timestamp,
    'X-SIGNATURE': signature || 'mock-signature',
    'X-PARTNER-ID': process.env.DANA_CLIENT_ID || 'SANDBOX_CLIENT_ID',
    'X-EXTERNAL-ID': crypto.randomUUID(),
    'CHANNEL-ID': process.env.DANA_CHANNEL_ID || '95221',
    'ORIGIN': process.env.APP_ORIGIN || 'https://madhayana-markets.vercel.app'
  };
  if(process.env.DANA_B2B_TOKEN) headers.Authorization = `Bearer ${process.env.DANA_B2B_TOKEN}`;
  if(customerToken) headers['Authorization-Customer'] = `Bearer ${customerToken}`;
  return headers;
}

export function mapDanaStatus(code){
  const map = { '00':'PAID', '01':'PENDING', '02':'PAYING', '03':'PENDING', '04':'FAILED', '05':'CANCELLED', '06':'FAILED', '07':'FAILED' };
  return map[code] || 'PENDING';
}
