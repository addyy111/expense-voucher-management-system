import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  Eye, 
  Check, 
  X, 
  AlertCircle,
  FileText
} from 'lucide-react';
import StatCard from '../components/StatCard';
import VoucherBadge from '../components/VoucherBadge';
import VoucherModal from '../components/VoucherModal';
import ApprovalModal from '../components/ApprovalModal';
import RejectionModal from '../components/RejectionModal';
import { dashboardAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DirectorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [approvingVoucher, setApprovingVoucher] = useState(null);
  const [rejectingVoucher, setRejectingVoucher] = useState(null);
  const [bannerMessage, setBannerMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load director dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = data?.stats || {
    pendingApprovalCount: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalPendingAmount: 0
  };

  const recentActivity = data?.recentActivity || [];

  return (
    <div>
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
            Director Review Portal
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: 2 }}>
            Review, authorize, or reject organization-wide employee expense reimbursements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/director/pending" className="btn btn-primary">
            <Clock size={16} />
            Review Pending Queue ({stats.pendingApprovalCount})
          </Link>
          <Link to="/director/vouchers" className="btn btn-secondary">
            <FileText size={16} />
            All Vouchers
          </Link>
        </div>
      </div>

      {bannerMessage && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20,
          fontSize: '0.88rem'
        }}>
          {bannerMessage}
        </div>
      )}

      {/* Director KPI Grid (Page 7 Requirements) */}
      <div className="stat-grid">
        <StatCard
          label="Pending Approval Count"
          value={stats.pendingApprovalCount}
          icon={Clock}
          color="amber"
          subtitle="Vouchers awaiting decision"
        />
        <StatCard
          label="Approved Today"
          value={stats.approvedToday}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Passed to Accounts today"
        />
        <StatCard
          label="Rejected Today"
          value={stats.rejectedToday}
          icon={XCircle}
          color="rose"
          subtitle="Declined today"
        />
        <StatCard
          label="Total Pending Amount"
          value={`₹${stats.totalPendingAmount.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="blue"
          subtitle="Total liquidity under review"
        />
      </div>

      {/* Recent Activity Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Voucher Activity</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
              Latest expense vouchers submitted across all company departments.
            </p>
          </div>
          <Link to="/director/vouchers" className="btn btn-secondary btn-sm">
            View All Org Vouchers
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
            Loading organization vouchers...
          </div>
        ) : recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <p style={{ color: '#64748b' }}>No voucher activity found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Claimant & Dept</th>
                  <th>Title & Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Last Update</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#1e3a8a' }}>
                        {v.voucher_number}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{v.employee_name}</span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.department}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 500 }}>{v.expense_title}</span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.expense_category}</div>
                      </div>
                    </td>
                    <td className="table-amount">
                      ₹{parseFloat(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <VoucherBadge status={v.status} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(v.updated_at).toLocaleDateString()}
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

                        {/* Approval / Rejection buttons for Pending vouchers */}
                        {v.status === 'Pending Approval' && (
                          <>
                            <button
                              onClick={() => setApprovingVoucher(v)}
                              className="btn btn-success btn-sm"
                              title="Approve Voucher"
                            >
                              <Check size={13} />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingVoucher(v)}
                              className="btn btn-danger btn-sm"
                              title="Reject Voucher"
                            >
                              <X size={13} />
                              Reject
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

      {/* Approval Modal */}
      {approvingVoucher && (
        <ApprovalModal
          voucher={approvingVoucher}
          onClose={() => setApprovingVoucher(null)}
          onSuccess={(updated) => {
            setApprovingVoucher(null);
            setBannerMessage(`Voucher ${updated.voucher_number} approved and dispatched to Accounts.`);
            loadData();
            setTimeout(() => setBannerMessage(''), 5000);
          }}
        />
      )}

      {/* Rejection Modal */}
      {rejectingVoucher && (
        <RejectionModal
          voucher={rejectingVoucher}
          onClose={() => setRejectingVoucher(null)}
          onSuccess={(updated) => {
            setRejectingVoucher(null);
            setBannerMessage(`Voucher ${updated.voucher_number} rejected.`);
            loadData();
            setTimeout(() => setBannerMessage(''), 5000);
          }}
        />
      )}
    </div>
  );
}
