const db = require('../config/db');
const { generateVoucherNumber } = require('../utils/voucherNumberGenerator');
const { saveBase64Signature } = require('../middleware/upload');

// Helper to log audit trail
function logAudit(voucherId, action, user, remarks = null) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (voucher_id, action, performed_by, performed_by_name, performed_by_role, remarks)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(voucherId, action, user.id, user.name, user.role, remarks);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

// 1. Create a Voucher (Defaults to Draft, or directly submitted if requested)
exports.createVoucher = (req, res, next) => {
  try {
    const {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      employeeIdCode,
      signatureImage, // base64 string or relative URL from previous file upload
      status = 'Draft'
    } = req.body;

    // Field Validations
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department is mandatory.' });
    }
    if (!expenseTitle || !expenseTitle.trim()) {
      return res.status(400).json({ success: false, message: 'Expense title is mandatory.' });
    }
    if (!expenseDate) {
      return res.status(400).json({ success: false, message: 'Expense date is mandatory.' });
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount is mandatory and must be greater than zero.' });
    }

    // Process signature if provided
    let processedSignature = null;
    if (signatureImage) {
      if (signatureImage.startsWith('data:image/')) {
        processedSignature = saveBase64Signature(signatureImage);
      } else {
        processedSignature = signatureImage;
      }
    }

    // If submitted directly for approval
    const finalStatus = status === 'Pending Approval' ? 'Pending Approval' : 'Draft';
    if (finalStatus === 'Pending Approval' && !processedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Employee Signature is mandatory before submitting a voucher for approval.'
      });
    }

    const voucherNumber = generateVoucherNumber();
    const today = new Date().toISOString().split('T')[0];
    const employeeName = req.user.name;
    const empId = employeeIdCode || req.user.employeeId || null;

    const result = db.prepare(`
      INSERT INTO vouchers (
        voucher_number, voucher_date, expense_date, department,
        expense_title, expense_category, expense_description, amount,
        employee_id_code, employee_name, employee_signature,
        status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      voucherNumber,
      today,
      expenseDate,
      department.trim(),
      expenseTitle.trim(),
      expenseCategory || 'General',
      expenseDescription || '',
      numAmount,
      empId,
      employeeName,
      processedSignature,
      finalStatus,
      req.user.id
    );

    const newId = result.lastInsertRowid;
    logAudit(
      newId,
      finalStatus === 'Draft' ? 'CREATED_DRAFT' : 'SUBMITTED_FOR_APPROVAL',
      req.user,
      finalStatus === 'Draft' ? 'Voucher created as draft' : 'Voucher submitted directly for approval'
    );

    const createdVoucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(newId);

    res.status(201).json({
      success: true,
      message: finalStatus === 'Draft' ? 'Voucher saved as Draft successfully.' : 'Voucher submitted for approval successfully.',
      data: createdVoucher
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get list of vouchers with search, filter, and sorting
exports.getVouchers = (req, res, next) => {
  try {
    const {
      search,
      department,
      category,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const conditions = [];
    const params = [];

    // Role-based visibility isolation:
    // Employees can only view vouchers created by themselves.
    // Director and Accounts can view all vouchers across organization.
    if (req.user.role === 'employee') {
      conditions.push('v.created_by = ?');
      params.push(req.user.id);
    }

    // Keyword Search across voucher number, title, description, employee name
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(v.voucher_number LIKE ? OR v.expense_title LIKE ? OR v.expense_description LIKE ? OR v.employee_name LIKE ?)');
      params.push(term, term, term, term);
    }

    // Filter: Department
    if (department && department !== 'ALL') {
      conditions.push('v.department = ?');
      params.push(department);
    }

    // Filter: Expense Category
    if (category && category !== 'ALL') {
      conditions.push('v.expense_category = ?');
      params.push(category);
    }

    // Filter: Status
    if (status && status !== 'ALL') {
      conditions.push('v.status = ?');
      params.push(status);
    }

    // Filter: Date Range (Expense Date)
    if (startDate) {
      conditions.push('v.expense_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('v.expense_date <= ?');
      params.push(endDate);
    }

    // Filter: Amount Range
    if (minAmount && !isNaN(parseFloat(minAmount))) {
      conditions.push('v.amount >= ?');
      params.push(parseFloat(minAmount));
    }
    if (maxAmount && !isNaN(parseFloat(maxAmount))) {
      conditions.push('v.amount <= ?');
      params.push(parseFloat(maxAmount));
    }

    // Sorting safe list
    const allowedSortFields = {
      'created_at': 'v.created_at',
      'expense_date': 'v.expense_date',
      'voucher_date': 'v.voucher_date',
      'amount': 'v.amount',
      'status': 'v.status',
      'voucher_number': 'v.voucher_number'
    };
    const orderCol = allowedSortFields[sortBy] || 'v.created_at';
    const direction = (sortOrder || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT 
        v.*,
        u.email as creator_email,
        a.name as approver_name
      FROM vouchers v
      LEFT JOIN users u ON v.created_by = u.id
      LEFT JOIN users a ON v.approved_by = a.id
      ${whereClause}
      ORDER BY ${orderCol} ${direction}
    `;

    const vouchers = db.prepare(sql).all(...params);

    res.json({
      success: true,
      count: vouchers.length,
      data: vouchers
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get single voucher details + audit trail
exports.getVoucherById = (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = db.prepare(`
      SELECT 
        v.*,
        u.email as creator_email,
        a.name as approver_name
      FROM vouchers v
      LEFT JOIN users u ON v.created_by = u.id
      LEFT JOIN users a ON v.approved_by = a.id
      WHERE v.id = ?
    `).get(id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    // Enforce role permission: Employee can only see their own voucher
    if (req.user.role === 'employee' && voucher.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view vouchers created by other employees.'
      });
    }

    // Fetch audit timeline
    const auditLogs = db.prepare(`
      SELECT * FROM audit_logs WHERE voucher_id = ? ORDER BY id ASC
    `).all(id);

    res.json({
      success: true,
      data: {
        ...voucher,
        auditLogs
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update Voucher (Only for Draft vouchers created by current employee)
exports.updateVoucher = (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    // Check ownership
    if (voucher.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit your own vouchers.'
      });
    }

    // Check status: Only Drafts can be edited
    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Voucher cannot be edited because it is in '${voucher.status}' status. Only Draft vouchers may be edited.`
      });
    }

    const {
      expenseDate,
      department,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      employeeIdCode,
      signatureImage,
      submitNow = false
    } = req.body;

    // Field Validations
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department is mandatory.' });
    }
    if (!expenseTitle || !expenseTitle.trim()) {
      return res.status(400).json({ success: false, message: 'Expense title is mandatory.' });
    }
    if (!expenseDate) {
      return res.status(400).json({ success: false, message: 'Expense date is mandatory.' });
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount is mandatory and must be greater than zero.' });
    }

    // Process signature if updated
    let updatedSignature = voucher.employee_signature;
    if (signatureImage) {
      if (signatureImage.startsWith('data:image/')) {
        updatedSignature = saveBase64Signature(signatureImage);
      } else {
        updatedSignature = signatureImage;
      }
    }

    const newStatus = submitNow ? 'Pending Approval' : 'Draft';

    if (submitNow && !updatedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Employee Signature is mandatory before submitting a voucher for approval.'
      });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE vouchers SET
        expense_date = ?,
        department = ?,
        expense_title = ?,
        expense_category = ?,
        expense_description = ?,
        amount = ?,
        employee_id_code = ?,
        employee_signature = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      expenseDate,
      department.trim(),
      expenseTitle.trim(),
      expenseCategory || voucher.expense_category,
      expenseDescription !== undefined ? expenseDescription : voucher.expense_description,
      numAmount,
      employeeIdCode || voucher.employee_id_code,
      updatedSignature,
      newStatus,
      now,
      id
    );

    logAudit(
      id,
      submitNow ? 'SUBMITTED_FOR_APPROVAL' : 'UPDATED_DRAFT',
      req.user,
      submitNow ? 'Voucher updated and submitted for approval' : 'Draft voucher details updated'
    );

    const updated = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    res.json({
      success: true,
      message: submitNow ? 'Voucher submitted for approval successfully.' : 'Draft updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Voucher (Only Draft vouchers created by current employee)
exports.deleteVoucher = (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own draft vouchers.'
      });
    }

    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete voucher in '${voucher.status}' status. Only Draft vouchers can be deleted.`
      });
    }

    db.prepare('DELETE FROM vouchers WHERE id = ?').run(id);

    res.json({
      success: true,
      message: `Voucher ${voucher.voucher_number} deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// 6. Submit Voucher (Draft -> Pending Approval)
exports.submitVoucher = (req, res, next) => {
  try {
    const { id } = req.params;
    const { signatureImage } = req.body;
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only submit your own vouchers.'
      });
    }

    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Voucher is already in '${voucher.status}' status. Only Draft vouchers can be submitted.`
      });
    }

    let finalSignature = voucher.employee_signature;
    if (signatureImage) {
      if (signatureImage.startsWith('data:image/')) {
        finalSignature = saveBase64Signature(signatureImage);
      } else {
        finalSignature = signatureImage;
      }
    }

    // Business rule: Employee signature is mandatory before submission
    if (!finalSignature) {
      return res.status(400).json({
        success: false,
        message: 'Employee Signature is mandatory before submitting for approval.'
      });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE vouchers SET
        status = 'Pending Approval',
        employee_signature = ?,
        updated_at = ?
      WHERE id = ?
    `).run(finalSignature, now, id);

    logAudit(id, 'SUBMITTED_FOR_APPROVAL', req.user, 'Submitted for Director review');

    const updated = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Voucher submitted for Director approval successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// 7. Approve Voucher (Director only)
exports.approveVoucher = (req, res, next) => {
  try {
    const { id } = req.params;
    const { directorSignature, remarks } = req.body;
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.status !== 'Pending Approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve voucher. Current status is '${voucher.status}', expected 'Pending Approval'.`
      });
    }

    // Validation rule: Director Signature is mandatory before approval
    let signaturePath = null;
    if (directorSignature) {
      if (directorSignature.startsWith('data:image/')) {
        signaturePath = saveBase64Signature(directorSignature);
      } else {
        signaturePath = directorSignature;
      }
    }

    if (!signaturePath) {
      return res.status(400).json({
        success: false,
        message: 'Director Signature is mandatory to approve this voucher.'
      });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE vouchers SET
        status = 'Approved',
        director_signature = ?,
        approval_date = ?,
        approved_by = ?,
        rejection_reason = NULL,
        updated_at = ?
      WHERE id = ?
    `).run(signaturePath, now, req.user.id, now, id);

    logAudit(id, 'APPROVED', req.user, remarks || 'Approved by Director');

    const updated = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    res.json({
      success: true,
      message: `Voucher ${voucher.voucher_number} approved successfully. It is now visible to Accounts for reimbursement.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// 8. Reject Voucher (Director only)
exports.rejectVoucher = (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.status !== 'Pending Approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject voucher. Current status is '${voucher.status}', expected 'Pending Approval'.`
      });
    }

    // Validation rule: Rejection Reason is mandatory if a voucher is rejected
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory when rejecting a voucher.'
      });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE vouchers SET
        status = 'Rejected',
        rejection_reason = ?,
        approval_date = ?,
        approved_by = ?,
        updated_at = ?
      WHERE id = ?
    `).run(rejectionReason.trim(), now, req.user.id, now, id);

    logAudit(id, 'REJECTED', req.user, `Rejected: ${rejectionReason.trim()}`);

    const updated = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);

    res.json({
      success: true,
      message: `Voucher ${voucher.voucher_number} has been rejected.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
