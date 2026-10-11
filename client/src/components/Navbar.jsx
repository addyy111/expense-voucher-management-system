import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Clock, 
  LogOut, 
  UserCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'director': return { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
      case 'accounts': return { background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' };
      default: return { background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' };
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand / Logo */}
        <Link to="/" className="nav-brand">
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
            color: '#fff',
            padding: '7px 9px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Building2 size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ letterSpacing: '-0.3px', fontWeight: 800 }}>PRACHAY</span>
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Voucher Management
            </span>
          </div>
        </Link>

        {/* Dynamic Navigation Links based on Role */}
        <div className="nav-links">
          {user.role === 'employee' && (
            <>
              <NavLink to="/employee/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
              <NavLink to="/employee/vouchers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FileText size={16} />
                My Vouchers
              </NavLink>
              <NavLink to="/employee/create" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <PlusCircle size={16} />
                New Voucher
              </NavLink>
            </>
          )}

          {user.role === 'director' && (
            <>
              <NavLink to="/director/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
              <NavLink to="/director/pending" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Clock size={16} />
                Pending Approvals
              </NavLink>
              <NavLink to="/director/vouchers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FileText size={16} />
                All Vouchers
              </NavLink>
            </>
          )}

          {user.role === 'accounts' && (
            <>
              <NavLink to="/accounts/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
              <NavLink to="/accounts/vouchers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FileText size={16} />
                All Vouchers
              </NavLink>
            </>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="user-profile-menu">
          <div className="user-badge">
            <div className="user-avatar">
              {user.name.charAt(0)}
            </div>
            <div className="user-info-text">
              <span className="user-name">{user.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: 4,
                  ...getRoleBadgeStyle(user.role)
                }}>
                  {user.role}
                </span>
                {user.department && (
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    • {user.department}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            title="Sign out"
            style={{ padding: '7px 11px', color: '#dc2626' }}
          >
            <LogOut size={15} />
            <span style={{ display: 'none', md: 'inline' }}>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
