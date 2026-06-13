import admin from 'firebase-admin';
function norm(k){return (k||'').replace(/\\n/g,'\n')}
export function db(){
  if(!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) return null;
  if(!admin.apps.length){admin.initializeApp({credential:admin.credential.cert({projectId:process.env.FIREBASE_PROJECT_ID,clientEmail:process.env.FIREBASE_CLIENT_EMAIL,privateKey:norm(process.env.FIREBASE_PRIVATE_KEY)})})}
  return admin.firestore();
}
export async function updateOrder(partnerReferenceNo,data){
  const store=db(); if(!store) return {updated:false,reason:'firebase-admin-env-empty'};
  const snap=await store.collection('orders').where('partnerReferenceNo','==',partnerReferenceNo).limit(1).get();
  if(snap.empty) return {updated:false,reason:'order-not-found'};
  await snap.docs[0].ref.update({...data,updatedAt:admin.firestore.FieldValue.serverTimestamp()});
  return {updated:true,id:snap.docs[0].id};
}
