import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  Eye, 
  Printer
} from 'lucide-react';
import StatCard from '../components/StatCard';
import VoucherBadge from '../components/VoucherBadge';
import VoucherModal from '../components/VoucherModal';
import { dashboardAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AccountsDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load accounts dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = data?.stats || {
    totalVouchers: 0,
    pendingApproval: 0,
    approvedVouchers: 0,
    rejectedVouchers: 0,
    totalApprovedExpenseAmount: 0
  };

  const recentApproved = data?.recentApprovedVouchers || [];

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
            Accounts & Settlement Portal
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: 2 }}>
            Monitor approved corporate claims and prepare financial reimbursement disbursements.
          </p>
        </div>

        <Link to="/accounts/vouchers" className="btn btn-secondary">
          <FileText size={16} />
          View All Organization Vouchers
        </Link>
      </div>

      {/* Accounts KPI Grid (Page 8 Requirements) */}
      <div className="stat-grid">
        <StatCard
          label="Total Vouchers"
          value={stats.totalVouchers}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Pending Approval"
          value={stats.pendingApproval}
          icon={Clock}
          color="amber"
          subtitle="Awaiting Director action"
        />
        <StatCard
          label="Approved Vouchers"
          value={stats.approvedVouchers}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Ready for disbursement"
        />
        <StatCard
          label="Rejected Vouchers"
          value={stats.rejectedVouchers}
          icon={XCircle}
          color="rose"
        />
        <StatCard
          label="Total Approved Expense Amount"
          value={`₹${stats.totalApprovedExpenseAmount.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="emerald"
          subtitle="Total payable for reimbursement"
        />
      </div>

      {/* Recent Approved Vouchers Ready for Disbursement */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Approved Vouchers Ready for Settlement</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
              Verified by Director with dual signatures. Print voucher copy for internal accounting records.
            </p>
          </div>
          <Link to="/accounts/vouchers?status=Approved" className="btn btn-secondary btn-sm">
            View All Approved
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
            Loading approved records...
          </div>
        ) : recentApproved.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            <p style={{ color: '#64748b' }}>No approved vouchers awaiting reimbursement currently.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Voucher #</th>
                  <th>Claimant & Dept</th>
                  <th>Title & Category</th>
                  <th>Approval Date</th>
                  <th>Approved By</th>
                  <th>Disbursement Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentApproved.map((v) => (
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
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {v.approval_date ? new Date(v.approval_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 600 }}>
                      {v.approver_name || 'Director'}
                    </td>
                    <td className="table-amount" style={{ color: '#047857' }}>
                      ₹{parseFloat(v.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => setSelectedVoucherId(v.id)}
                          className="btn btn-secondary btn-sm"
                          title="View Details & Signatures"
                        >
                          <Eye size={13} />
                          Details
                        </button>
                        <Link
                          to={`/print/${v.id}`}
                          target="_blank"
                          className="btn btn-secondary btn-sm"
                          title="Print Formal Voucher"
                        >
                          <Printer size={13} />
                          Print
                        </Link>
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
