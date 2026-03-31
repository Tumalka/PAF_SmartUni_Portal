import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../pages/AdminDashboard.css'

export default function AdminSidebar({ activeView, onActiveViewChange, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    onLogout()
    navigate('/')
  }
  
  const isActive = (path) => location.pathname === path

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo-icon">🎓</div>
          <div className="logo-text">
            <div className="logo-name">SmartUni Portal</div>
            <div className="logo-badge">ADMIN</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Main Section */}
        <div className="nav-section">
          <div className="nav-section-label">MAIN</div>
          <button 
            onClick={() => onActiveViewChange && onActiveViewChange('dashboard')} 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} 
            style={{ border: 'none', width: '100%', textAlign: 'left' }}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Dashboard</span>
          </button>
          <button 
            onClick={() => onActiveViewChange && onActiveViewChange('users')} 
            className={`nav-item ${activeView === 'users' ? 'active' : ''}`} 
            style={{ border: 'none', width: '100%', textAlign: 'left' }}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">Users</span>
          </button>
        </div>

        {/* Facilities Section */}
        <div className="nav-section">
          <div className="nav-section-label">FACILITIES</div>
          <Link to="/resources" className={`nav-item ${isActive('/resources') ? 'active' : ''}`}>
            <span className="nav-icon">🏢</span>
            <span className="nav-label">Facilities & Assets</span>
          </Link>
          <Link to="/bookings" className={`nav-item ${isActive('/bookings') ? 'active' : ''}`}>
            <span className="nav-icon">📅</span>
            <span className="nav-label">Bookings</span>
            <span className="nav-badge">4</span>
          </Link>
        </div>

        {/* Maintenance Section */}
        <div className="nav-section">
          <div className="nav-section-label">MAINTENANCE</div>
          <Link to="/tickets" className={`nav-item ${isActive('/tickets') ? 'active' : ''}`}>
            <span className="nav-icon">🎫</span>
            <span className="nav-label">Tickets</span>
            <span className="nav-badge" style={{ backgroundColor: '#ef4444' }}>7</span>
          </Link>
        </div>

        {/* Account Section */}
        <div className="nav-section">
          <div className="nav-section-label">ACCOUNT</div>
          <Link to="/notifications" className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}>
            <span className="nav-icon">🔔</span>
            <span className="nav-label">Notifications</span>
            <span className="nav-badge" style={{ backgroundColor: '#ef4444' }}>3</span>
          </Link>
          <Link to="/admin/users" className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            <span className="nav-label">Analytics</span>
          </Link>
        </div>
      </nav>

      {/* Logout Button at Bottom */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          <span className="logout-icon">🚪</span>
          <span className="logout-label">Logout</span>
        </button>
      </div>
    </aside>
  )
}
