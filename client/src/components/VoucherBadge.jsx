import React from 'react';
import { Clock, CheckCircle2, XCircle, FileEdit } from 'lucide-react';

export default function VoucherBadge({ status }) {
  switch (status) {
    case 'Draft':
      return (
        <span className="badge badge-draft">
          <FileEdit size={13} />
          Draft
        </span>
      );
    case 'Pending Approval':
      return (
        <span className="badge badge-pending">
          <Clock size={13} />
          Pending Approval
        </span>
      );
    case 'Approved':
      return (
        <span className="badge badge-approved">
          <CheckCircle2 size={13} />
          Approved
        </span>
      );
    case 'Rejected':
      return (
        <span className="badge badge-rejected">
          <XCircle size={13} />
          Rejected
        </span>
      );
    default:
      return <span className="badge">{status}</span>;
  }
}
