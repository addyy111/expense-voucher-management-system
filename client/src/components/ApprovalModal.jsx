import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import SignaturePad from './SignaturePad';
import { voucherAPI } from '../api/client';

export default function ApprovalModal({ voucher, onClose, onSuccess }) {
  const [signature, setSignature] = useState(null);
  const [remarks, setRemarks] = useState('Approved by Director');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!voucher) return null;

  const handleApprove = async () => {
    setError('');
    // Validation: Director signature is mandatory before approval
    if (!signature) {
      setError('Director signature is mandatory to approve this voucher.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await voucherAPI.approveVoucher(voucher.id, {
        directorSignature: signature,
        remarks: remarks.trim()
      });

      if (res.success) {
        onSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to approve voucher.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Approve Expense Voucher
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {voucher.voucher_number} • ₹{parseFloat(voucher.amount).toLocaleString('en-IN')}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecdd3',
              borderRadius: 6,
              padding: '10px 14px',
              color: '#b91c1c',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <p style={{ fontSize: '0.85rem', color: '#334155' }}>
              Claimant: <strong>{voucher.employee_name}</strong> ({voucher.department})
            </p>
            <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: 4 }}>
              Title: <strong>{voucher.expense_title}</strong>
            </p>
          </div>

          <div className="form-group">
            <SignaturePad
              label="Director Signature (Mandatory)"
              onSave={(data) => setSignature(data)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Approval Remarks / Notes (Optional)</label>
            <textarea
              className="form-control"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Approved. Forwarded to Accounts for payment."
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary" disabled={submitting}>
            Cancel
          </button>
          <button onClick={handleApprove} className="btn btn-success" disabled={submitting}>
            <CheckCircle size={15} />
            {submitting ? 'Approving...' : 'Confirm Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}
