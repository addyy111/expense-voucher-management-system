const db = require('../config/db');

exports.getDashboardStats = (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    if (role === 'employee') {
      // 1. Employee Dashboard Stats
      const totalVouchers = db.prepare('SELECT COUNT(*) as count FROM vouchers WHERE created_by = ?').get(userId).count;
      const draftVouchers = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE created_by = ? AND status = 'Draft'").get(userId).count;
      const pendingVouchers = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE created_by = ? AND status = 'Pending Approval'").get(userId).count;
      const approvedVouchers = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE created_by = ? AND status = 'Approved'").get(userId).count;
      const rejectedVouchers = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE created_by = ? AND status = 'Rejected'").get(userId).count;
      
      const totalClaimed = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM vouchers WHERE created_by = ?').get(userId).total;

      const recentVouchers = db.prepare(`
        SELECT * FROM vouchers WHERE created_by = ? ORDER BY created_at DESC LIMIT 5
      `).all(userId);

      return res.json({
        success: true,
        data: {
          role: 'employee',
          stats: {
            totalVouchers,
            draftVouchers,
            pendingApproval: pendingVouchers,
            approvedVouchers,
            rejectedVouchers,
            totalAmountClaimed: totalClaimed
          },
          recentVouchers
        }
      });
    }

    if (role === 'director') {
      // 2. Director Dashboard Stats
      const pendingApprovalCount = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Pending Approval'").get().count;
      
      // Approved Today (matched by date prefix on approval_date)
      const approvedToday = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Approved' AND approval_date LIKE ?").get(`${today}%`).count;
      
      // Rejected Today
      const rejectedToday = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Rejected' AND approval_date LIKE ?").get(`${today}%`).count;
      
      // Total Pending Amount
      const totalPendingAmount = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM vouchers WHERE status = 'Pending Approval'").get().total;

      // Recent Voucher Activity (last 8 vouchers across organization)
      const recentActivity = db.prepare(`
        SELECT 
          v.*,
          u.name as creator_name
        FROM vouchers v
        LEFT JOIN users u ON v.created_by = u.id
        ORDER BY v.updated_at DESC
        LIMIT 8
      `).all();

      return res.json({
        success: true,
        data: {
          role: 'director',
          stats: {
            pendingApprovalCount,
            approvedToday,
            rejectedToday,
            totalPendingAmount
          },
          recentActivity
        }
      });
    }

    if (role === 'accounts') {
      // 3. Accounts Dashboard Stats
      const totalVouchers = db.prepare('SELECT COUNT(*) as count FROM vouchers').get().count;
      const pendingApproval = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Pending Approval'").get().count;
      const approvedVouchers = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Approved'").get().count;
      const rejectedVouchers = db.prepare("SELECT COUNT(*) as count FROM vouchers WHERE status = 'Rejected'").get().count;
      
      const totalApprovedAmount = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM vouchers WHERE status = 'Approved'").get().total;

      // Recent Approved Vouchers
      const recentApprovedVouchers = db.prepare(`
        SELECT 
          v.*,
          u.name as creator_name,
          a.name as approver_name
        FROM vouchers v
        LEFT JOIN users u ON v.created_by = u.id
        LEFT JOIN users a ON v.approved_by = a.id
        WHERE v.status = 'Approved'
        ORDER BY v.approval_date DESC
        LIMIT 8
      `).all();

      return res.json({
        success: true,
        data: {
          role: 'accounts',
          stats: {
            totalVouchers,
            pendingApproval,
            approvedVouchers,
            rejectedVouchers,
            totalApprovedExpenseAmount: totalApprovedAmount
          },
          recentApprovedVouchers
        }
      });
    }

    res.status(400).json({ success: false, message: 'Invalid role.' });
  } catch (error) {
    next(error);
  }
};
