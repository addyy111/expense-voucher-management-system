import React, { useState } from 'react';
import { X, XCircle, AlertCircle } from 'lucide-react';
import { voucherAPI } from '../api/client';

export default function RejectionModal({ voucher, onClose, onSuccess }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!voucher) return null;

  const handleReject = async () => {
    setError('');
    // Validation rule: Rejection Reason is mandatory if a voucher is rejected
    if (!rejectionReason || !rejectionReason.trim()) {
      setError('Rejection reason is mandatory. Please state why this expense cannot be approved.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await voucherAPI.rejectVoucher(voucher.id, {
        rejectionReason: rejectionReason.trim()
      });

      if (res.success) {
        onSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to reject voucher.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#dc2626' }}>
              Reject Expense Voucher
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

          <div style={{ background: '#fff1f2', padding: 12, borderRadius: 8, border: '1px solid #fecdd3', marginBottom: 16 }}>
            <p style={{ fontSize: '0.82rem', color: '#9f1239' }}>
              The employee will be able to review this rejection explanation on their dashboard.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Rejection Reason <span className="required">*</span>
            </label>
            <textarea
              className="form-control"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this expense request was rejected (e.g. Missing tax invoice, exceeds quarterly department budget, personal expense not covered by policy)..."
              autoFocus
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary" disabled={submitting}>
            Cancel
          </button>
          <button onClick={handleReject} className="btn btn-danger" disabled={submitting}>
            <XCircle size={15} />
            {submitting ? 'Rejecting...' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}
