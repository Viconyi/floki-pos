import React, { useState } from 'react';
import { HotelAPI } from '../api';

export default function QRPage() {
  const [merchantName, setMerchantName] = useState('Floki Hotel');
  const [refNo, setRefNo] = useState('Invoice Test');
  const [amount, setAmount] = useState(1);
  const [trxCode, setTrxCode] = useState('BG');
  const [cpi, setCpi] = useState('174379'); // sandbox default paybill/business
  const [size, setSize] = useState(300);
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setError('');
    setLoading(true);
    setQrData('');
    try {
      const payload = {
        MerchantName: merchantName,
        RefNo: refNo,
        Amount: Number(amount) || 1,
        TrxCode: trxCode,
        CPI: cpi,
        Size: String(size),
      };
      const res = await HotelAPI.generateQR(payload);
      const code = res && res.QRCode;
      if (!code) throw new Error(res && res.ResponseDescription ? res.ResponseDescription : 'No QRCode returned');
      setQrData(code);
    } catch (e) {
      setError(e && e.message ? e.message : 'Failed to generate QR');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '1rem auto' }}>
      <h2 style={{ marginTop: 0, color: '#1a2236' }}>Generate M-PESA QR</h2>
      <p style={{ color: '#6a708a' }}>Create a dynamic QR for customers to scan and pay. Defaults use sandbox values.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Merchant Name</label>
          <input value={merchantName} onChange={e=>setMerchantName(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Reference</label>
          <input value={refNo} onChange={e=>setRefNo(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Amount (Kshs)</label>
          <input type="number" min={1} value={amount} onChange={e=>setAmount(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Transaction Code</label>
          <select value={trxCode} onChange={e=>setTrxCode(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }}>
            <option value="BG">BG: Buy Goods</option>
            <option value="PB">PB: Pay Bill</option>
            <option value="SM">SM: Send Money</option>
            <option value="SB">SB: Send to Business</option>
            <option value="WA">WA: Withdraw at Agent</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>CPI (ShortCode/MSISDN)</label>
          <input value={cpi} onChange={e=>setCpi(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Size (px)</label>
          <input type="number" min={100} value={size} onChange={e=>setSize(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
        <button onClick={generate} disabled={loading} style={{ background: '#1a2236', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700 }}>
          {loading ? 'Generating…' : 'Generate QR'}
        </button>
        {error && <span style={{ color: 'crimson', fontWeight: 600 }}>{error}</span>}
      </div>
      {qrData && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: 0, color: '#1a2236' }}>QR Code</h3>
          <p style={{ color: '#6a708a' }}>Scan with M-PESA app to pay.</p>
          <img alt="M-PESA QR" src={`data:image/png;base64,${qrData}`} style={{ width: size, height: size, border: '1px solid #e1e4ee', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}
