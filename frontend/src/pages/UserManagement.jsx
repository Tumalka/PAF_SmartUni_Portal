import React, { useState, useEffect } from 'react'
import apiClient from '../services/api'
import './Pages.css'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingUserId, setEditingUserId] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users')
      setUsers(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Failed to load users')
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await apiClient.put(`/users/${userId}/role`, { role: newRole })
      setSuccessMessage(response.data.message)
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchUsers() // Refresh user list
      setEditingUserId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const response = await apiClient.put(`/users/${userId}/status`, { isActive: !currentStatus })
      setSuccessMessage(response.data.message)
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchUsers() // Refresh user list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await apiClient.delete(`/users/${userId}`)
      setSuccessMessage(response.data.message)
      setTimeout(() => setSuccessMessage(''), 3000)
      fetchUsers() // Refresh user list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
      setTimeout(() => setError(''), 3000)
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'role-badge-admin'
      case 'MANAGER': return 'role-badge-manager'
      case 'TECHNICIAN': return 'role-badge-technician'
      default: return 'role-badge-user'
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p style={{ color: '#6b7280' }}>Manage system users and their roles</p>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success-message" style={{ marginBottom: '1rem', color: '#059669' }}>
          {successMessage}
        </div>
      )}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Login Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {user.profilePictureUrl && (
                      <img 
                        src={user.profilePictureUrl} 
                        alt={user.fullName}
                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                      />
                    )}
                    <strong>{user.fullName}</strong>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  {editingUserId === user.userId ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                      onBlur={() => setEditingUserId(null)}
                      autoFocus
                      style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #3b82f6' }}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MANAGER">Manager</option>
                      <option value="TECHNICIAN">Technician</option>
                    </select>
                  ) : (
                    <span 
                      className={`role-badge ${getRoleBadgeClass(user.role)}`}
                      onClick={() => setEditingUserId(user.userId)}
                      style={{ cursor: 'pointer' }}
                      title="Click to edit role"
                    >
                      {user.role}
                    </span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleStatusToggle(user.userId, user.isActive)}
                    className={`status-btn ${user.isActive ? 'active' : 'inactive'}`}
                    title={user.isActive ? 'Click to deactivate' : 'Click to activate'}
                  >
                    {user.isActive ? '✓ Active' : '✗ Inactive'}
                  </button>
                </td>
                <td>
                  {user.googleId ? (
                    <span title="Google OAuth">🔵 Google</span>
                  ) : (
                    <span title="Regular login">📧 Email</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user.userId, user.email)}
                    className="delete-btn"
                    title="Delete user"
                    style={{ 
                      background: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
