import { Smartphone, Zap, WalletCards } from 'lucide-react';
export default function PPOBSection() {
 const items=[['Pulsa & Data','Siap dikembangkan ke integrasi provider PPOB.',Smartphone],['Token PLN','Form nomor meter, nominal, dan status transaksi.',Zap],['E-Wallet','Top up saldo dompet digital dengan riwayat order.',WalletCards]];
 return <section id="ppob" className="ppobSection"><div className="sectionHead"><h2>Layanan PPOB</h2><p>Modul awal PPOB sudah disiapkan sebagai katalog dan bisa dikembangkan ke API provider.</p></div><div className="ppobGrid">{items.map(([title,desc,Icon])=><div className="ppobCard" key={title}><Icon size={28}/><h3>{title}</h3><p>{desc}</p></div>)}</div></section>
}
