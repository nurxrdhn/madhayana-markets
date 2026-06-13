import crypto from 'crypto';

export function nowJakarta(){
  const d=new Date(Date.now()+7*60*60*1000);
  const p=n=>String(n).padStart(2,'0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}+07:00`;
}
export function addMinutesJakarta(m=15){
  const d=new Date(Date.now()+m*60000+7*60*60*1000);
  const p=n=>String(n).padStart(2,'0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}+07:00`;
}
export async function readJson(req){
  if(req.body) return typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body;
  const chunks=[]; for await(const c of req) chunks.push(c);
  const raw=Buffer.concat(chunks).toString('utf8'); return raw?JSON.parse(raw):{};
}
export const minify=x=>JSON.stringify(x||{});
export const sha256=x=>crypto.createHash('sha256').update(x,'utf8').digest('hex').toLowerCase();
export const normKey=k=>(k||'').replace(/\\n/g,'\n');
export function signRSA(text){
  const key=normKey(process.env.DANA_PRIVATE_KEY||'');
  if(!key) return '';
  const signer=crypto.createSign('RSA-SHA256'); signer.update(text); signer.end();
  return signer.sign(key,'base64');
}
export function signRequest({method,path,body,timestamp}){return signRSA(`${method}:${path}:${sha256(minify(body))}:${timestamp}`)}
export function baseUrl(){return process.env.DANA_BASE_URL || (process.env.DANA_ENV==='production'?'https://api.saas.dana.id':'https://api.sandbox.dana.id')}
export function configured(){return Boolean(process.env.DANA_PARTNER_ID && process.env.DANA_MERCHANT_ID && process.env.DANA_PRIVATE_KEY && process.env.DANA_CHANNEL_ID)}
export function headers({signature,timestamp}){return {'Content-Type':'application/json','Accept':'application/json','X-TIMESTAMP':timestamp,'X-SIGNATURE':signature||'','X-PARTNER-ID':process.env.DANA_PARTNER_ID||process.env.DANA_CLIENT_ID||'','X-EXTERNAL-ID':crypto.randomUUID().replace(/-/g,'').slice(0,32),'CHANNEL-ID':process.env.DANA_CHANNEL_ID||'95221','ORIGIN':process.env.APP_ORIGIN||'https://madhayana.com'}}
export function danaStatus(code){return {'00':'PAID','01':'PENDING','02':'FAILED','03':'PENDING','04':'REFUNDED','05':'CANCELLED','06':'FAILED'}[String(code)]||'PENDING'}
