import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  FileEdit, 
  Trash2, 
  Check, 
  X, 
  Printer, 
  PlusCircle, 
  ArrowUpDown 
} from 'lucide-react';
import VoucherBadge from '../components/VoucherBadge';
import VoucherModal from '../components/VoucherModal';
import ApprovalModal from '../components/ApprovalModal';
import RejectionModal from '../components/RejectionModal';
import { voucherAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'ALL',
  'Equity Research',
  'Technology',
  'Finance & Accounts',
  'Operations',
  'Compliance & Legal',
  'Wealth Management',
  'Human Resources'
];

const CATEGORIES = [
  'ALL',
  'Software & Tools',
  'Client Entertainment',
  'Travel & Conveyance',
  'Training & Certifications',
  'Office Supplies',
  'Meals',
  'Other'
];

const STATUSES = ['ALL', 'Draft', 'Pending Approval', 'Approved', 'Rejected'];

export default function VoucherList() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || 'ALL');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [minAmount, setMinAmount] = useState(searchParams.get('minAmount') || '');
  const [maxAmount, setMaxAmount] = useState(searchParams.get('maxAmount') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');

  // Data & Modal States
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [approvingVoucher, setApprovingVoucher] = useState(null);
  const [rejectingVoucher, setRejectingVoucher] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        department,
        category,
        status,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        sortBy,
        sortOrder
      };

      const res = await voucherAPI.getVouchers(params);
      if (res.success) {
        setVouchers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [department, category, status, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVouchers();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('ALL');
    setCategory('ALL');
    setStatus('ALL');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('created_at');
    setSortOrder('desc');
    setSearchParams({});
    setTimeout(() => fetchVouchers(), 50);
  };

  const handleDelete = async (v) => {
    if (!window.confirm(`Are you sure you want to delete draft voucher ${v.voucher_number}?`)) {
      return;
    }
    try {
      const res = await voucherAPI.deleteVoucher(v.id);
      if (res.success) {
        setActionMessage(res.message);
        fetchVouchers();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const pageTitle = user.role === 'employee' ? 'My Expense Vouchers' : 'Organization Expense Vouchers';

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
            {pageTitle}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 2 }}>
            {user.role === 'employee'
              ? 'Browse, search, and manage your reimbursement submissions.'
              : 'Enterprise repository of all company employee vouchers.'}
          </p>
        </div>

        {user.role === 'employee' && (
          <Link to="/employee/create" className="btn btn-primary">
            <PlusCircle size={16} />
            Create Voucher
          </Link>
        )}
      </div>

      {actionMessage && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '10px 16px',
          borderRadius: 8,
          marginBottom: 16,
          fontSize: '0.88rem'
        }}>
          {actionMessage}
        </div>
      )}

      {/* Bonus Point: Search & Multi-criteria Filtering Panel */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="Search by Voucher #, Title, Claimant Name, or Description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Search size={15} />
              Search
            </button>
            <button type="button" onClick={handleResetFilters} className="btn btn-secondary" title="Reset all filters">
              <RotateCcw size={15} />
              Reset
            </button>
          </div>

          <div className="filter-grid">
            {/* Department */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Department</label>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d === 'ALL' ? 'All Departments' : d}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Expense Category</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Status</label>
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ALL' ? 'All Statuses' : s}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Start */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>From Expense Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>To Expense Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Amount Min */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Min Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>

            {/* Amount Max */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Max Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                placeholder="No limit"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>

            {/* Sort Field & Order */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Sort By</label>
              <div style={{ display: 'flex', gap: 4 }}>
                <select
                  className="form-control"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="created_at">Date Created</option>
                  <option value="expense_date">Expense Date</option>
                  <option value="amount">Amount</option>
                  <option value="voucher_number">Voucher #</option>
                  <option value="status">Status</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="btn btn-secondary"
                  style={{ padding: '0 10px' }}
                  title={`Order: ${sortOrder.toUpperCase()}`}
                >
                  <ArrowUpDown size={14} />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Vouchers Table View */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            Showing {vouchers.length} {vouchers.length === 1 ? 'voucher' : 'vouchers'}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            Fetching vouchers...
          </div>
        ) : vouchers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
            <p style={{ fontWeight: 600, fontSize: '1rem', color: '#334155' }}>No vouchers match your criteria.</p>
            <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Try clearing or adjusting your search filters.</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  {user.role !== 'employee' && <th>Employee / Claimant</th>}
                  <th>Expense Date</th>
                  <th>Title & Department</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#1e3a8a' }}>
                        {v.voucher_number}
                      </span>
                    </td>

                    {user.role !== 'employee' && (
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.employee_name}</div>
                        {v.employee_id_code && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{v.employee_id_code}</div>
                        )}
                      </td>
                    )}

                    <td>{v.expense_date}</td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.expense_title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.department}</div>
                    </td>

                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {v.expense_category}
                    </td>

                    <td className="table-amount">
                      ₹{parseFloat(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td>
                      <VoucherBadge status={v.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => setSelectedVoucherId(v.id)}
                          className="btn btn-secondary btn-sm"
                          title="View Details"
                        >
                          <Eye size={13} />
                          Details
                        </button>

                        {/* Print Action for Approved vouchers or Accounts role */}
                        {(v.status === 'Approved' || user.role === 'accounts') && (
                          <Link
                            to={`/print/${v.id}`}
                            target="_blank"
                            className="btn btn-secondary btn-sm"
                            title="Print Voucher"
                          >
                            <Printer size={13} />
                          </Link>
                        )}

                        {/* Employee Draft Actions */}
                        {user.role === 'employee' && v.status === 'Draft' && (
                          <>
                            <Link
                              to={`/employee/edit/${v.id}`}
                              className="btn btn-secondary btn-sm"
                              title="Edit Draft"
                            >
                              <FileEdit size={13} />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(v)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#dc2626' }}
                              title="Delete Draft"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}

                        {/* Director Pending Actions */}
                        {user.role === 'director' && v.status === 'Pending Approval' && (
                          <>
                            <button
                              onClick={() => setApprovingVoucher(v)}
                              className="btn btn-success btn-sm"
                              title="Approve"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => setRejectingVoucher(v)}
                              className="btn btn-danger btn-sm"
                              title="Reject"
                            >
                              <X size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedVoucherId && (
        <VoucherModal
          voucherId={selectedVoucherId}
          onClose={() => setSelectedVoucherId(null)}
          onActionSuccess={() => {
            setSelectedVoucherId(null);
            fetchVouchers();
          }}
        />
      )}

      {approvingVoucher && (
        <ApprovalModal
          voucher={approvingVoucher}
          onClose={() => setApprovingVoucher(null)}
          onSuccess={(updated) => {
            setApprovingVoucher(null);
            setActionMessage(`Voucher ${updated.voucher_number} approved successfully.`);
            fetchVouchers();
            setTimeout(() => setActionMessage(''), 5000);
          }}
        />
      )}

      {rejectingVoucher && (
        <RejectionModal
          voucher={rejectingVoucher}
          onClose={() => setRejectingVoucher(null)}
          onSuccess={(updated) => {
            setRejectingVoucher(null);
            setActionMessage(`Voucher ${updated.voucher_number} rejected.`);
            fetchVouchers();
            setTimeout(() => setActionMessage(''), 5000);
          }}
        />
      )}
    </div>
  );
}
