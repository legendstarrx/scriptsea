import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Link from 'next/link';

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#FF3366',
    margin: 0,
  },
  searchContainer: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #ddd',
    color: '#666',
    fontSize: '14px',
    fontWeight: '600',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontWeight: '500',
    color: '#333',
  },
  userEmail: {
    color: '#666',
    fontSize: '13px',
  },
  select: {
    padding: '6px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    minWidth: '120px',
  },
  banButton: {
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  unbanButton: {
    backgroundColor: '#00C851',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  deleteButton: {
    backgroundColor: '#ff3366',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    color: '#fff',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #ff3366',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '10px',
  },
  noUsers: {
    textAlign: 'center',
    padding: '20px',
    color: '#fff',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  deleteByIPButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  banByIPButton: {
    backgroundColor: '#ff6b6b',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  expiryInfo: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: '#2d2d2d',
    color: '#fff',
    fontSize: '14px',
  },
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.email === 'legendstarr2024@gmail.com') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/get-users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      console.log('Client: Fetched users:', data.users); // Debug log
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserSubscription = async (userId, newSubscription) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.NEXT_PUBLIC_ADMIN_API_KEY
        },
        body: JSON.stringify({ 
          userId,
          action: 'updateSubscription',
          data: { plan: newSubscription }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const toggleUserBan = async (userId, currentBanStatus) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.NEXT_PUBLIC_ADMIN_API_KEY
        },
        body: JSON.stringify({
          userId,
          action: currentBanStatus ? 'unbanUser' : 'banUser'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle ban status');
      }
      await fetchUsers();
    } catch (error) {
      console.error('Error toggling ban status:', error);
    }
  };

  const deleteUserAccount = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.NEXT_PUBLIC_ADMIN_API_KEY
          },
          body: JSON.stringify({
            userId,
            action: 'deleteUser'
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
      await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const deleteUsersByIP = async (ipAddress) => {
    if (window.confirm(`Are you sure you want to delete all users with IP: ${ipAddress}?`)) {
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.NEXT_PUBLIC_ADMIN_API_KEY
          },
          body: JSON.stringify({
            action: 'deleteByIP',
            data: { ipAddress }
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete users by IP');
        }
        await fetchUsers();
      } catch (error) {
        console.error('Error deleting users by IP:', error);
      }
    }
  };

  const banUsersByIP = async (ipAddress) => {
    if (window.confirm(`Are you sure you want to ban all users with IP: ${ipAddress}?`)) {
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.NEXT_PUBLIC_ADMIN_API_KEY
          },
          body: JSON.stringify({
            action: 'banByIP',
            data: { ipAddress }
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to ban users by IP');
        }
        await fetchUsers();
      } catch (error) {
        console.error('Error banning users by IP:', error);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.ipAddress?.toLowerCase().includes(searchLower)
    );
  });

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 0;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (!user || user.email !== 'legendstarr2024@gmail.com') {
    return null;
  }

  return (
    <AdminProtectedRoute>
    <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard</h1>
        </div>
          
        <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <h3 style={styles.statLabel}>Total Users</h3>
            <p style={styles.statValue}>{users.length}</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statLabel}>Pro Users</h3>
            <p style={styles.statValue}>
              {users.filter(u => u.subscription === 'pro').length}
            </p>
            </div>
            <div style={styles.statCard}>
            <h3 style={styles.statLabel}>Banned Users</h3>
            <p style={styles.statValue}>
              {users.filter(u => u.isBanned).length}
            </p>
            </div>
          </div>

          <div style={styles.searchContainer}>
            <input
              type="text"
            placeholder="Search by email, name, or IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div style={styles.noUsers}>No users found</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>IP Address</th>
                  <th style={styles.th}>Subscription</th>
                  <th style={styles.th}>Expires In</th>
                  <th style={styles.th}>Scripts Left</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userInfo}>
                        <div style={styles.userName}>{user.displayName || 'N/A'}</div>
                        <div style={styles.userEmail}>{user.email}</div>
                      </div>
                    </td>
                    <td style={styles.td}>{user.ipAddress || 'N/A'}</td>
                    <td style={styles.td}>
                      {user.subscription} {user.subscriptionType ? `(${user.subscriptionType})` : ''}
                    </td>
                    <td style={styles.td}>
                      {user.subscriptionEnd ? (
                        <div style={styles.expiryInfo}>
                          {getDaysUntilExpiry(user.subscriptionEnd)} days
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td style={styles.td}>{user.scriptsRemaining || 0}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => toggleUserBan(user.id, user.isBanned)}
                          style={user.isBanned ? styles.unbanButton : styles.banButton}
                        >
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                        {user.ipAddress && (
                          <button
                            onClick={() => banUsersByIP(user.ipAddress)}
                            style={styles.banByIPButton}
                          >
                            Ban by IP
                          </button>
                        )}
                          <button
                          onClick={() => deleteUserAccount(user.id)}
                          style={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
    </div>
    </AdminProtectedRoute>
  );
} 