import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = 'blue', subtitle }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtitle && <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 3 }}>{subtitle}</span>}
      </div>
      {Icon && (
        <div className="stat-icon-box">
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}
