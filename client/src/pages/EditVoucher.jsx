import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

export default function EditVoucher() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [voucherNumber, setVoucherNumber] = useState('');
  const [formData, setFormData] = useState({
    expenseDate: '',
    department: '',
    expenseTitle: '',
    expenseCategory: '',
    expenseDescription: '',
    amount: '',
    employeeIdCode: ''
  });

  const [signatureImage, setSignatureImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setLoading(true);
        const res = await voucherAPI.getVoucherById(id);
        if (res.success) {
          const v = res.data;
          // Enforce rule: only Draft vouchers can be edited
          if (v.status !== 'Draft') {
            alert(`Voucher ${v.voucher_number} cannot be edited because it is in '${v.status}' status. Only Draft vouchers are editable.`);
            navigate('/employee/dashboard');
            return;
          }

          setVoucherNumber(v.voucher_number);
          setFormData({
            expenseDate: v.expense_date,
            department: v.department,
            expenseTitle: v.expense_title,
            expenseCategory: v.expense_category,
            expenseDescription: v.expense_description || '',
            amount: v.amount,
            employeeIdCode: v.employee_id_code || ''
          });
          setSignatureImage(v.employee_signature || null);
        }
      } catch (err) {
        setErrors({ form: err.message || 'Failed to load voucher.' });
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [id, navigate]);

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

    if (isSubmitting && !signatureImage) {
      errs.signature = 'Employee signature is mandatory before submitting for approval.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (submitNow) => {
    if (!validate(submitNow)) {
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        signatureImage,
        submitNow
      };

      const res = await voucherAPI.updateVoucher(id, payload);
      if (res.success) {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setErrors({ form: err.message || 'Failed to update voucher.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
        Loading voucher draft...
      </div>
    );
  }

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
          Edit Draft Voucher: {voucherNumber}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 2 }}>
          Modify voucher information while it is in Draft status. Once submitted, it becomes locked and read-only.
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
        {/* Section 1 */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="#1e3a8a" />
            1. Expense Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Department Name <span className="required">*</span></label>
              <select
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

            <div className="form-group">
              <label className="form-label">Expense Date <span className="required">*</span></label>
              <input
                type="date"
                className="form-control"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
              />
              {errors.expenseDate && <p className="form-error">{errors.expenseDate}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expense Title <span className="required">*</span></label>
            <input
              type="text"
              className="form-control"
              value={formData.expenseTitle}
              onChange={(e) => setFormData({ ...formData, expenseTitle: e.target.value })}
            />
            {errors.expenseTitle && <p className="form-error">{errors.expenseTitle}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Expense Category <span className="required">*</span></label>
              <select
                className="form-control"
                value={formData.expenseCategory}
                onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹ INR) <span className="required">*</span></label>
              <input
                type="number"
                step="0.01"
                min="1"
                className="form-control"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              {errors.amount && <p className="form-error">{errors.amount}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expense Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.expenseDescription}
              onChange={(e) => setFormData({ ...formData, expenseDescription: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2 */}
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
              <label className="form-label">Employee ID</label>
              <input
                type="text"
                className="form-control"
                value={formData.employeeIdCode}
                onChange={(e) => setFormData({ ...formData, employeeIdCode: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div style={{ marginBottom: 28, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            3. Employee Signature
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 14 }}>
            Mandatory to submit for Director review.
          </p>

          <SignaturePad
            label="Employee Signature"
            initialValue={signatureImage}
            onSave={(data) => {
              setSignatureImage(data);
              if (data && errors.signature) {
                setErrors((prev) => ({ ...prev, signature: null }));
              }
            }}
          />
          {errors.signature && <p className="form-error">{errors.signature}</p>}
        </div>

        {/* Actions */}
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
            onClick={() => handleSave(false)}
            className="btn btn-secondary"
            disabled={submitting}
          >
            <Save size={15} />
            {submitting ? 'Saving...' : 'Update Draft'}
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
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
