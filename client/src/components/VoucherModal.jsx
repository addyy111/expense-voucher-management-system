import React, { useState, useEffect } from 'react';
import { X, Printer, Calendar, Tag, Building, DollarSign, User, FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import VoucherBadge from './VoucherBadge';
import { voucherAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function VoucherModal({ voucherId, onClose, onActionSuccess }) {
  const { user } = useAuth();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!voucherId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await voucherAPI.getVoucherById(voucherId);
        if (res.success) {
          setVoucher(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load voucher details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [voucherId]);

  if (!voucherId) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              {voucher ? voucher.voucher_number : 'Voucher Details'}
            </h3>
            {voucher && <VoucherBadge status={voucher.status} />}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Loading voucher details...
            </div>
          ) : error ? (
            <div style={{ padding: 16, background: '#fef2f2', border: '1px solid #fecdd3', borderRadius: 8, color: '#b91c1c' }}>
              {error}
            </div>
          ) : voucher ? (
            <div>
              {/* Rejection Alert if Rejected */}
              {voucher.status === 'Rejected' && (
                <div style={{
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: 8,
                  padding: '14px 16px',
                  marginBottom: 20,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start'
                }}>
                  <AlertTriangle size={20} color="#be123c" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h5 style={{ fontWeight: 700, color: '#9f1239', fontSize: '0.88rem' }}>
                      Rejection Reason (Director Remarks)
                    </h5>
                    <p style={{ fontSize: '0.85rem', color: '#be123c', marginTop: 4 }}>
                      {voucher.rejection_reason || 'No specific reason provided.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Expense Information Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16,
                background: '#f8fafc',
                padding: 18,
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                marginBottom: 20
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Expense Title
                  </span>
                  <p style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a', marginTop: 2 }}>
                    {voucher.expense_title}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Claimed Amount
                  </span>
                  <p style={{
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    color: '#1e3a8a',
                    fontFamily: 'var(--font-mono)',
                    marginTop: 2
                  }}>
                    ₹{parseFloat(voucher.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Department
                  </span>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginTop: 2 }}>
                    {voucher.department}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Expense Category
                  </span>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginTop: 2 }}>
                    {voucher.expense_category}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Expense Date
                  </span>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginTop: 2 }}>
                    {voucher.expense_date}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Voucher Date
                  </span>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginTop: 2 }}>
                    {voucher.voucher_date}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Description / Justification
                </span>
                <p style={{
                  fontSize: '0.88rem',
                  color: '#334155',
                  marginTop: 6,
                  padding: 12,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {voucher.expense_description || 'No description provided.'}
                </p>
              </div>

              {/* Signatures Block */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16,
                marginBottom: 20
              }}>
                {/* Employee Signature */}
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 14,
                  background: '#ffffff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Employee Signature
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#1e3a8a', fontWeight: 600 }}>
                      {voucher.employee_name} {voucher.employee_id_code ? `(${voucher.employee_id_code})` : ''}
                    </span>
                  </div>
                  {voucher.employee_signature ? (
                    <div style={{
                      height: 70,
                      background: '#f8fafc',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed #cbd5e1'
                    }}>
                      <img
                        src={voucher.employee_signature}
                        alt="Employee Signature"
                        style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <div style={{ height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                      No signature recorded yet (Draft)
                    </div>
                  )}
                </div>

                {/* Director Signature */}
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 14,
                  background: '#ffffff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Director Approval Signature
                    </span>
                    {voucher.approver_name && (
                      <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                        {voucher.approver_name}
                      </span>
                    )}
                  </div>
                  {voucher.director_signature ? (
                    <div style={{
                      height: 70,
                      background: '#f8fafc',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px dashed #cbd5e1'
                    }}>
                      <img
                        src={voucher.director_signature}
                        alt="Director Signature"
                        style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <div style={{ height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                      {voucher.status === 'Approved' ? 'Signature recorded' : 'Pending Director Review'}
                    </div>
                  )}
                  {voucher.approval_date && (
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 6, textAlign: 'right' }}>
                      Decision Date: {new Date(voucher.approval_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Trail Timeline */}
              {voucher.auditLogs && voucher.auditLogs.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 12 }}>
                    Voucher Audit Trail & Lifecycle History
                  </span>
                  <div className="audit-list">
                    {voucher.auditLogs.map((log) => (
                      <div key={log.id} className="audit-item">
                        <div className="audit-bullet" />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="audit-action">{log.action.replace(/_/g, ' ')}</span>
                          <span className="audit-meta">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>
                          Performed by: <strong>{log.performed_by_name}</strong> ({log.performed_by_role})
                          {log.remarks && ` — "${log.remarks}"`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Modal Footer with Actions */}
        <div className="modal-footer">
          {voucher && (
            <>
              {/* Printable Voucher Button */}
              <Link
                to={`/print/${voucher.id}`}
                target="_blank"
                className="btn btn-secondary"
                style={{ marginRight: 'auto' }}
              >
                <Printer size={15} />
                Print / Export Voucher
              </Link>

              {/* Employee Draft Action */}
              {user.role === 'employee' && voucher.status === 'Draft' && (
                <Link to={`/employee/edit/${voucher.id}`} className="btn btn-secondary">
                  Edit Draft
                </Link>
              )}
            </>
          )}

          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
