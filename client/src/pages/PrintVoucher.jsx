import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Building2 } from 'lucide-react';
import { voucherAPI } from '../api/client';

export default function PrintVoucher() {
  const { id } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setLoading(true);
        const res = await voucherAPI.getVoucherById(id);
        if (res.success) {
          setVoucher(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load voucher');
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
        Loading voucher document...
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#dc2626' }}>
        {error || 'Voucher not found.'}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 840, margin: '20px auto', padding: '0 16px' }}>
      {/* Top Toolbar (Hidden when printing) */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        background: '#ffffff',
        padding: '12px 20px',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <button
          onClick={() => window.close()}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <button
          onClick={handlePrint}
          className="btn btn-primary btn-sm"
        >
          <Printer size={15} />
          Print / Save PDF
        </button>
      </div>

      {/* Corporate Printable Voucher Document */}
      <div className="printable-voucher" style={{
        background: '#ffffff',
        border: '2px solid #0f172a',
        padding: 36,
        fontFamily: 'serif'
      }}>
        {/* Header Block */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2px solid #0f172a',
          paddingBottom: 20,
          marginBottom: 24
        }}>
          <div>
            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'var(--font-sans)'
            }}>
              PRACHAY SECURITIES PRIVATE LIMITED
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#334155', marginTop: 4, fontFamily: 'var(--font-sans)' }}>
              Corporate Headquarters • Financial District, Mumbai, India
            </p>
            <p style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-sans)' }}>
              CIN: U67120MH2021PTC358941 • accounts@prachay.com
            </p>
          </div>

          <div style={{ textAlign: 'right', fontFamily: 'var(--font-sans)' }}>
            <div style={{
              display: 'inline-block',
              background: '#0f172a',
              color: '#ffffff',
              padding: '6px 14px',
              fontWeight: 700,
              fontSize: '0.88rem',
              borderRadius: 4,
              letterSpacing: '0.5px'
            }}>
              EXPENSE VOUCHER
            </div>
            <div style={{
              marginTop: 8,
              fontSize: '1rem',
              fontWeight: 800,
              color: '#0f172a',
              fontFamily: 'var(--font-mono)'
            }}>
              {voucher.voucher_number}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: 2 }}>
              Status: <strong>{voucher.status.toUpperCase()}</strong>
            </div>
          </div>
        </div>

        {/* Voucher Metadata Table */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          marginBottom: 24,
          fontFamily: 'var(--font-sans)',
          fontSize: '0.88rem'
        }}>
          <div style={{ border: '1px solid #cbd5e1', padding: 12, borderRadius: 4 }}>
            <table style={{ width: '100%', lineHeight: 1.8 }}>
              <tbody>
                <tr>
                  <td style={{ color: '#64748b', width: '40%' }}>Employee Name:</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{voucher.employee_name}</td>
                </tr>
                <tr>
                  <td style={{ color: '#64748b' }}>Employee Code:</td>
                  <td style={{ fontWeight: 600 }}>{voucher.employee_id_code || 'N/A'}</td>
                </tr>
                <tr>
                  <td style={{ color: '#64748b' }}>Department:</td>
                  <td style={{ fontWeight: 600 }}>{voucher.department}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ border: '1px solid #cbd5e1', padding: 12, borderRadius: 4 }}>
            <table style={{ width: '100%', lineHeight: 1.8 }}>
              <tbody>
                <tr>
                  <td style={{ color: '#64748b', width: '40%' }}>Voucher Date:</td>
                  <td style={{ fontWeight: 600 }}>{voucher.voucher_date}</td>
                </tr>
                <tr>
                  <td style={{ color: '#64748b' }}>Expense Date:</td>
                  <td style={{ fontWeight: 600 }}>{voucher.expense_date}</td>
                </tr>
                <tr>
                  <td style={{ color: '#64748b' }}>Expense Category:</td>
                  <td style={{ fontWeight: 600 }}>{voucher.expense_category}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Items Breakdown */}
        <div style={{ marginBottom: 28, fontFamily: 'var(--font-sans)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #0f172a' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #0f172a' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  Description & Purpose
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', width: '25%' }}>
                  Category
                </th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.8rem', textTransform: 'uppercase', width: '25%' }}>
                  Amount (INR)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                    {voucher.expense_title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: 4 }}>
                    {voucher.expense_description || 'Expense incurred during regular official business.'}
                  </div>
                </td>
                <td style={{ padding: '14px 12px', fontSize: '0.88rem' }}>
                  {voucher.expense_category}
                </td>
                <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
                  ₹{parseFloat(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                <td colSpan={2} style={{ padding: '12px', textAlign: 'right', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  Total Reimbursement Payable:
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '1.15rem', fontFamily: 'var(--font-mono)', color: '#1e3a8a' }}>
                  ₹{parseFloat(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Dual Signatures & Authorization Box (Mandatory Requirement) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginTop: 36,
          paddingTop: 16,
          fontFamily: 'var(--font-sans)'
        }}>
          {/* Employee Sign Box */}
          <div style={{ border: '1px solid #cbd5e1', padding: 12, borderRadius: 4, textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Claimant Signature
            </span>
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0' }}>
              {voucher.employee_signature ? (
                <img
                  src={voucher.employee_signature}
                  alt="Employee Signature"
                  style={{ maxHeight: 50, maxWidth: '100%', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Pending Signature</span>
              )}
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{voucher.employee_name}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Date: {voucher.voucher_date}</div>
            </div>
          </div>

          {/* Director Sign Box */}
          <div style={{ border: '1px solid #cbd5e1', padding: 12, borderRadius: 4, textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Director Approval
            </span>
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0' }}>
              {voucher.director_signature ? (
                <img
                  src={voucher.director_signature}
                  alt="Director Signature"
                  style={{ maxHeight: 50, maxWidth: '100%', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                  {voucher.status === 'Approved' ? 'Approved' : 'Pending Approval'}
                </span>
              )}
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                {voucher.approver_name || 'Executive Director'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {voucher.approval_date ? new Date(voucher.approval_date).toLocaleDateString() : '—'}
              </div>
            </div>
          </div>

          {/* Accounts Department Stamp Box */}
          <div style={{ border: '1px solid #cbd5e1', padding: 12, borderRadius: 4, textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Accounts Verification
            </span>
            <div style={{
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '8px 0',
              border: '1px dashed #cbd5e1',
              borderRadius: 4
            }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {voucher.status === 'Approved' ? 'VERIFIED FOR PAYMENT' : 'AWAITING APPROVAL'}
              </span>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 6 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Disbursement Officer</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Payment Mode: Direct Bank Transfer</div>
            </div>
          </div>
        </div>

        {/* Footer Audit Notice */}
        <div style={{
          marginTop: 30,
          borderTop: '1px solid #e2e8f0',
          paddingTop: 10,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: '#94a3b8',
          fontFamily: 'var(--font-sans)'
        }}>
          <span>System Generated Voucher Document • Audit ID #{voucher.id}</span>
          <span>Printed on: {new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
