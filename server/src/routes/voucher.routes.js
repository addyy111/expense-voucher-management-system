const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

// All voucher routes require authentication
router.use(authenticateToken);

// Read routes (Employee views own; Director and Accounts view all)
router.get('/', voucherController.getVouchers);
router.get('/:id', voucherController.getVoucherById);

// Employee voucher creation and management
router.post('/', requireRoles('employee'), voucherController.createVoucher);
router.put('/:id', requireRoles('employee'), voucherController.updateVoucher);
router.delete('/:id', requireRoles('employee'), voucherController.deleteVoucher);
router.post('/:id/submit', requireRoles('employee'), voucherController.submitVoucher);

// Director approval actions
router.post('/:id/approve', requireRoles('director'), voucherController.approveVoucher);
router.post('/:id/reject', requireRoles('director'), voucherController.rejectVoucher);

module.exports = router;
