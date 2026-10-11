import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  FileEdit, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PlusCircle, 
  Eye, 
  Trash2, 
  IndianRupee,
  Send
} from 'lucide-react';
import StatCard from '../components/StatCard';
import VoucherBadge from '../components/VoucherBadge';
import VoucherModal from '../components/VoucherModal';
import { dashboardAPI, voucherAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (voucher) => {
    if (!window.confirm(`Are you sure you want to delete draft voucher ${voucher.voucher_number}?`)) {
      return;
    }

    try {
      const res = await voucherAPI.deleteVoucher(voucher.id);
      if (res.success) {
        setActionMessage(res.message);
        loadData();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete voucher');
    }
  };

  const stats = data?.stats || {
    totalVouchers: 0,
    draftVouchers: 0,
    pendingApproval: 0,
    approvedVouchers: 0,
    rejectedVouchers: 0,
    totalAmountClaimed: 0
  };

  const recentList = data?.recentVouchers || [];

  return (
    <div>
      {/* Header with Title and Create Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Welcome back, {user?.name}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: 2 }}>
            Manage, submit, and track your employee reimbursement vouchers.
          </p>
        </div>

        <Link to="/employee/create" className="btn btn-primary">
          <PlusCircle size={16} />
          Create Expense Voucher
        </Link>
      </div>

      {actionMessage && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '10px 16px',
          borderRadius: 8,
          marginBottom: 20,
          fontSize: '0.88rem'
        }}>
          {actionMessage}
        </div>
      )}

      {/* KPI Stat Cards Grid (Page 7 Requirements) */}
      <div className="stat-grid">
        <StatCard
          label="Total Vouchers"
          value={stats.totalVouchers}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Draft Vouchers"
          value={stats.draftVouchers}
          icon={FileEdit}
          color="slate"
        />
        <StatCard
          label="Pending Approval"
          value={stats.pendingApproval}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Approved Vouchers"
          value={stats.approvedVouchers}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          label="Rejected Vouchers"
          value={stats.rejectedVouchers}
          icon={XCircle}
          color="rose"
        />
        <StatCard
          label="Total Amount Claimed"
          value={`₹${stats.totalAmountClaimed.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="indigo"
          subtitle="Cumulative submitted claims"
        />
      </div>

      {/* Recent Vouchers Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">My Recent Vouchers</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
              Displaying your latest expense claims. (Restricted to your submissions only).
            </p>
          </div>
          <Link to="/employee/vouchers" className="btn btn-secondary btn-sm">
            View All My Vouchers
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
            Loading vouchers...
          </div>
        ) : recentList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <FileText size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600 }}>No expense vouchers created yet.</p>
            <p style={{ fontSize: '0.82rem', marginTop: 4 }}>
              Click the "Create Expense Voucher" button above to get started.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Expense Date</th>
                  <th>Title & Department</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentList.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#1e3a8a' }}>
                        {v.voucher_number}
                      </span>
                    </td>
                    <td>{v.expense_date}</td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{v.expense_title}</span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.department}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#475569' }}>{v.expense_category}</span>
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

                        {/* Edit and Delete available ONLY for Draft status (Page 8 Rule 4) */}
                        {v.status === 'Draft' && (
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedVoucherId && (
        <VoucherModal
          voucherId={selectedVoucherId}
          onClose={() => setSelectedVoucherId(null)}
          onActionSuccess={() => {
            setSelectedVoucherId(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
