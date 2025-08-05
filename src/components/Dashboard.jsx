import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import PasswordForm from './PasswordForm'
import PasswordList from './PasswordList'
import './Dashboard.css'

const Dashboard = () => {
  const { user, logout, API_BASE_URL } = useAuth()
  const [passwords, setPasswords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPassword, setEditingPassword] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchPasswords()
  }, [])

  const fetchPasswords = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/passwords`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPasswords(data)
      } else {
        console.error('Failed to fetch passwords')
      }
    } catch (error) {
      console.error('Error fetching passwords:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPassword = () => {
    setEditingPassword(null)
    setShowForm(true)
  }

  const handleEditPassword = (password) => {
    setEditingPassword(password)
    setShowForm(true)
  }

  const handleDeletePassword = async (passwordId) => {
    if (!window.confirm('Are you sure you want to delete this password?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/passwords/${passwordId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setPasswords(passwords.filter(p => p.id !== passwordId))
      } else {
        alert('Failed to delete password')
      }
    } catch (error) {
      console.error('Error deleting password:', error)
      alert('Error deleting password')
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      const url = editingPassword 
        ? `${API_BASE_URL}/passwords/${editingPassword.id}`
        : `${API_BASE_URL}/passwords`
      
      const method = editingPassword ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchPasswords() // Refresh the list
        setShowForm(false)
        setEditingPassword(null)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save password')
      }
    } catch (error) {
      console.error('Error saving password:', error)
      alert('Error saving password')
    }
  }

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout()
    }
  }

  // Filter passwords based on search term and category
  const filteredPasswords = passwords.filter(password => {
    const matchesSearch = password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         password.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         password.username.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
                           password.category === selectedCategory ||
                           (!password.category && selectedCategory === 'uncategorized')
    
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = ['all', ...new Set(passwords.map(p => p.category || 'uncategorized'))]

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your passwords...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="header-info">
              <h1>Password Manager</h1>
              <p>Welcome back, {user?.username}</p>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-controls">
          <div className="search-bar">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : 
                   category === 'uncategorized' ? 'Uncategorized' : 
                   category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <button className="add-button" onClick={handleAddPassword}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Password
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {filteredPasswords.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <h3>No passwords found</h3>
              <p>
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first password'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <button className="add-button" onClick={handleAddPassword}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Add Your First Password
                </button>
              )}
            </div>
          ) : (
            <PasswordList
              passwords={filteredPasswords}
              onEdit={handleEditPassword}
              onDelete={handleDeletePassword}
            />
          )}
        </div>
      </main>

      {showForm && (
        <PasswordForm
          password={editingPassword}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingPassword(null)
          }}
        />
      )}
    </div>
  )
}

export default Dashboard

