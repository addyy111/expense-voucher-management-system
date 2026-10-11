import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Send, AlertCircle, FileText } from 'lucide-react';
import SignaturePad from '../components/SignaturePad';
import { voucherAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Equity Research',
  'Technology',
  'Finance & Accounts',
  'Operations',
  'Compliance & Legal',
  'Wealth Management',
  'Human Resources'
];

const CATEGORIES = [
  'Software & Tools',
  'Client Entertainment',
  'Travel & Conveyance',
  'Training & Certifications',
  'Office Supplies',
  'Meals',
  'Other'
];

export default function CreateVoucher() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    expenseDate: new Date().toISOString().split('T')[0],
    department: user?.department || 'Equity Research',
    expenseTitle: '',
    expenseCategory: 'Travel & Conveyance',
    expenseDescription: '',
    amount: '',
    employeeIdCode: user?.employeeId || ''
  });

  const [signatureImage, setSignatureImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = (isSubmitting = false) => {
    const errs = {};
    if (!formData.department || !formData.department.trim()) {
      errs.department = 'Department is mandatory.';
    }
    if (!formData.expenseTitle || !formData.expenseTitle.trim()) {
      errs.expenseTitle = 'Expense title is mandatory.';
    }
    if (!formData.expenseDate) {
      errs.expenseDate = 'Expense date is mandatory.';
    }
    const num = parseFloat(formData.amount);
    if (!formData.amount || isNaN(num) || num <= 0) {
      errs.amount = 'Amount is mandatory and must be greater than zero.';
    }

    // Business rule: Employee Signature is mandatory before submission
    if (isSubmitting && !signatureImage) {
      errs.signature = 'Employee signature is mandatory before submitting for approval.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAction = async (statusTarget) => {
    const isSubmitting = statusTarget === 'Pending Approval';
    if (!validate(isSubmitting)) {
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        signatureImage,
        status: statusTarget
      };

      const res = await voucherAPI.createVoucher(payload);
      if (res.success) {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setErrors({ form: err.message || 'Failed to create voucher.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/employee/dashboard"
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', marginBottom: 12 }}
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
          Create New Expense Voucher
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 2 }}>
          Submit employee reimbursement claim. Vouchers can be saved as Draft or submitted directly for Director review.
        </p>
      </div>

      {errors.form && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecdd3',
          padding: '12px 16px',
          borderRadius: 8,
          color: '#b91c1c',
          marginBottom: 20,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          fontSize: '0.88rem'
        }}>
          <AlertCircle size={16} />
          {errors.form}
        </div>
      )}

      <div className="card">
        {/* Section 1: Basic Information */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="#1e3a8a" />
            1. Basic Expense Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {/* Department */}
            <div className="form-group">
              <label className="form-label" htmlFor="department">
                Department Name <span className="required">*</span>
              </label>
              <select
                id="department"
                className="form-control"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.department && <p className="form-error">{errors.department}</p>}
            </div>

            {/* Expense Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="expenseDate">
                Expense Date <span className="required">*</span>
              </label>
              <input
                id="expenseDate"
                type="date"
                className="form-control"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
              />
              {errors.expenseDate && <p className="form-error">{errors.expenseDate}</p>}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="expenseTitle">
              Expense Title <span className="required">*</span>
            </label>
            <input
              id="expenseTitle"
              type="text"
              className="form-control"
              placeholder="e.g. Travel Ticket to NSE Office, Mumbai / Annual Research Data Subscription"
              value={formData.expenseTitle}
              onChange={(e) => setFormData({ ...formData, expenseTitle: e.target.value })}
            />
            {errors.expenseTitle && <p className="form-error">{errors.expenseTitle}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="expenseCategory">
                Expense Category <span className="required">*</span>
              </label>
              <select
                id="expenseCategory"
                className="form-control"
                value={formData.expenseCategory}
                onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="amount">
                Amount (₹ INR) <span className="required">*</span>
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                className="form-control"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              {errors.amount && <p className="form-error">{errors.amount}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="expenseDescription">
              Expense Description & Business Justification
            </label>
            <textarea
              id="expenseDescription"
              className="form-control"
              rows={3}
              placeholder="Describe the business purpose and provide any relevant breakdown or vendor references..."
              value={formData.expenseDescription}
              onChange={(e) => setFormData({ ...formData, expenseDescription: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Employee Information */}
        <div style={{ marginBottom: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
            2. Claimant Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Employee Name</label>
              <input
                type="text"
                className="form-control"
                value={user?.name || ''}
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Employee ID (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. EMP-1042"
                value={formData.employeeIdCode}
                onChange={(e) => setFormData({ ...formData, employeeIdCode: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Signature */}
        <div style={{ marginBottom: 28, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            3. Employee Signature
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 14 }}>
            Mandatory before submitting for Director approval. Can be skipped if saving as Draft.
          </p>

          <SignaturePad
            label="Employee Signature"
            onSave={(data) => {
              setSignatureImage(data);
              if (data && errors.signature) {
                setErrors((prev) => ({ ...prev, signature: null }));
              }
            }}
          />
          {errors.signature && <p className="form-error">{errors.signature}</p>}
        </div>

        {/* Actions Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          paddingTop: 16,
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            type="button"
            onClick={() => handleAction('Draft')}
            className="btn btn-secondary"
            disabled={submitting}
          >
            <Save size={15} />
            {submitting ? 'Saving...' : 'Save as Draft'}
          </button>

          <button
            type="button"
            onClick={() => handleAction('Pending Approval')}
            className="btn btn-primary"
            disabled={submitting}
          >
            <Send size={15} />
            {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}
