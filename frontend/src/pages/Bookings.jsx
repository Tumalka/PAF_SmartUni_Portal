import React, { useState, useEffect } from 'react'
import { BookingAPI, ResourceAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import AdminSidebar from '../components/AdminSidebar'
import './AdminDashboard.css'

export default function Bookings() {
  const { user, logout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewMode, setViewMode] = useState('list')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [resources, setResources] = useState([])
  const [newBooking, setNewBooking] = useState({
    resourceId: '',
    startTime: '',
    endTime: '',
    bookingPurpose: ''
  })

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    try {
      let response
      if (statusFilter === 'All') {
        response = await BookingAPI.getAll()
      } else {
        response = await BookingAPI.getByStatus(statusFilter.toUpperCase())
      }
      setBookings(response.data || [])
    } catch (err) {
      setError('Failed to load bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await BookingAPI.approve(id, 'Approved')
      fetchBookings()
    } catch (err) {
      setError('Failed to approve booking')
    }
  }

  const handleReject = async (id) => {
    try {
      await BookingAPI.reject(id, 'Rejected')
      fetchBookings()
    } catch (err) {
      setError('Failed to reject booking')
    }
  }

  const fetchResources = async () => {
    try {
      const response = await ResourceAPI.getAll()
      setResources(response.data || [])
    } catch (err) {
      console.error('Failed to fetch resources:', err)
    }
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    try {
      await BookingAPI.create({
        ...newBooking,
        resourceId: parseInt(newBooking.resourceId),
        userId: 1
      })
      setShowCreateModal(false)
      setNewBooking({ resourceId: '', startTime: '', endTime: '', bookingPurpose: '' })
      fetchBookings()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking')
    }
  }

  const handleLogout = () => {
    logout()
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'badge-approved'
      case 'PENDING':
        return 'badge-pending'
      case 'REJECTED':
        return 'badge-rejected'
      case 'CANCELLED':
        return 'badge-cancelled'
      default:
        return 'badge-default'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  return (
    <div className="admin-dashboard">
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Header */}
        <div className="admin-header">
          <div className="header-title">Bookings Management</div>
          <div className="header-actions">
            <input type="text" className="search-input" placeholder="Search anything..." />
            <button className="header-icon-btn">🔔</button>
            <button className="header-icon-btn">👤</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="admin-content">
          {error && <div className="error-message">{error}</div>}

          {/* View Mode Tabs */}
          <div className="view-tabs">
            <button 
              className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
            <button 
              className={`tab-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </button>
          </div>

          {/* Action Bar */}
          <div className="booking-action-bar">
            <div className="filter-buttons">
              {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
            <button className="new-booking-btn" onClick={() => setShowCreateModal(true)}>
              + New Booking
            </button>
          </div>

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bookings-table-wrapper">
              {loading ? (
                <div className="loading-message">Loading bookings...</div>
              ) : bookings.length === 0 ? (
                <div className="empty-message">No bookings found</div>
              ) : (
                <div className="bookings-table">
                  <div className="table-row table-header">
                    <div className="table-cell id-col">ID</div>
                    <div className="table-cell resource-col">RESOURCE</div>
                    <div className="table-cell requested-col">REQUESTED BY</div>
                    <div className="table-cell date-col">DATE & TIME</div>
                    <div className="table-cell purpose-col">PURPOSE</div>
                    <div className="table-cell attendees-col">ATTENDEES</div>
                    <div className="table-cell status-col">STATUS</div>
                    <div className="table-cell actions-col">ACTIONS</div>
                  </div>

                  {bookings.map((booking, index) => (
                    <div className="table-row" key={booking.bookingId || index}>
                      <div className="table-cell id-col">#{booking.bookingId || 'N/A'}</div>
                      <div className="table-cell resource-col">{booking.resourceName || 'Lab A-101'}</div>
                      <div className="table-cell requested-col">{booking.userFullName || 'User'}</div>
                      <div className="table-cell date-col">{formatDate(booking.startTime)}</div>
                      <div className="table-cell purpose-col">{booking.bookingPurpose || 'N/A'}</div>
                      <div className="table-cell attendees-col">{booking.attendees || '—'}</div>
                      <div className="table-cell status-col">
                        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                          ● {booking.status}
                        </span>
                      </div>
                      <div className="table-cell actions-col">
                        {booking.status === 'PENDING' ? (
                          <div className="action-buttons">
                            <button 
                              className="action-approve"
                              onClick={() => handleApprove(booking.bookingId)}
                              title="Approve"
                            >
                              ✓
                            </button>
                            <button 
                              className="action-reject"
                              onClick={() => handleReject(booking.bookingId)}
                              title="Reject"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button className="view-btn">View</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="calendar-view">
              <div className="coming-soon">Calendar view coming soon</div>
            </div>
          )}
        </div>
      </main>

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Booking</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateBooking} className="modal-form">
              <div className="form-group">
                <label>Resource</label>
                <select
                  value={newBooking.resourceId}
                  onChange={(e) => setNewBooking({ ...newBooking, resourceId: e.target.value })}
                  onFocus={fetchResources}
                  required
                >
                  <option value="">Select a resource</option>
                  {resources.map((resource) => (
                    <option key={resource.resourceId} value={resource.resourceId}>
                      {resource.resourceName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  value={newBooking.startTime}
                  onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="datetime-local"
                  value={newBooking.endTime}
                  onChange={(e) => setNewBooking({ ...newBooking, endTime: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <input
                  type="text"
                  value={newBooking.bookingPurpose}
                  onChange={(e) => setNewBooking({ ...newBooking, bookingPurpose: e.target.value })}
                  placeholder="Enter booking purpose"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-create">
                  Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
