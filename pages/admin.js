import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Link from 'next/link';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9ff'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  header: {
    marginBottom: '2rem'
  },
  headerTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '1rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '0.5rem'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#FF3366'
  },
  searchContainer: {
    marginBottom: '2rem'
  },
  searchInput: {
    width: '100%',
    maxWidth: '400px',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e1e1e1',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    ':focus': {
      borderColor: '#FF3366',
      boxShadow: '0 0 0 3px rgba(255, 51, 102, 0.1)'
    }
  },
  suspiciousIpsSection: {
    marginBottom: '2rem'
  },
  suspiciousIpsTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '1rem'
  },
  suspiciousIpsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem'
  },
  ipCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
    ':hover': {
      boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)'
    }
  },
  userCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  userInfo: {
    flex: 1
  },
  userEmail: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '0.5rem'
  },
  userDetail: {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '0.25rem'
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  proBadge: {
    backgroundColor: '#ebf5ff',
    color: '#1e88e5'
  },
  freeBadge: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  upgradeButton: {
    backgroundColor: '#1e88e5',
    color: 'white',
    ':hover': {
      backgroundColor: '#1976d2'
    }
  },
  downgradeButton: {
    backgroundColor: '#64748b',
    color: 'white',
    ':hover': {
      backgroundColor: '#475569'
    }
  },
  resetButton: {
    backgroundColor: '#10b981',
    color: 'white',
    ':hover': {
      backgroundColor: '#059669'
    }
  },
  banButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    ':hover': {
      backgroundColor: '#dc2626'
    }
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    ':hover': {
      backgroundColor: '#dc2626'
    }
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2rem'
  },
  paginationButton: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #e1e1e1',
    backgroundColor: 'white',
    cursor: 'pointer',
    margin: '0 0.25rem',
    ':hover': {
      backgroundColor: '#f3f4f6'
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  },
  errorMessage: {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem'
  }
};

export default function Admin() {
  const { user, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [ipGroups, setIpGroups] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    proUsers: 0,
    freeUsers: 0
  });

  useEffect(() => {
    if (user && userProfile?.isAdmin) {
      fetchUsers();
    }
  }, [user, userProfile]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': process.env.NEXT_PUBLIC_ADMIN_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);

      // Calculate statistics
      const stats = {
        totalUsers: data.length,
        activeUsers: data.filter(u => !u.disabled).length,
        proUsers: data.filter(u => u.subscription === 'pro').length,
        freeUsers: data.filter(u => !u.subscription || u.subscription === 'free').length
      };
      setStats(stats);

      // Group users by IP
      const ipMap = new Map();
      data.forEach(user => {
        if (user.ipAddress && user.ipAddress !== 'Not recorded') {
          if (!ipMap.has(user.ipAddress)) {
            ipMap.set(user.ipAddress, []);
          }
          ipMap.get(user.ipAddress).push(user);
        }
      });

      // Filter IPs with more than 2 users
      const suspiciousIps = Array.from(ipMap.entries())
        .filter(([_, users]) => users.length > 2)
        .map(([ip, users]) => ({ ip, users }));
      
      setIpGroups(suspiciousIps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, data) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.NEXT_PUBLIC_ADMIN_API_KEY
        },
        body: JSON.stringify({ 
          userId: data.userId,
          action: action,
          data: {
            plan: data.plan,
            scriptsRemaining: action === 'resetScripts' ? (data.plan === 'pro' ? 100 : 3) : undefined
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform action');
      }

      // Refresh the users list after successful action
      await fetchUsers();
    } catch (err) {
      console.error('Action error:', err);
      setError(err.message);
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.ipAddress && user.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const UserCard = ({ user, onAction }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      marginBottom: '15px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px'
      }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{user.displayName || 'No Name'}</h3>
          <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>{user.email}</p>
          <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
            IP: {user.ipAddress || 'Not recorded'}
          </p>
          <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
            Subscription: {user.subscription || 'free'}
          </p>
          <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
            Scripts Remaining: {user.scriptsRemaining || 0}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Show Upgrade button only for free users */}
          {(!user.subscription || user.subscription === 'free') && (
            <button
              onClick={() => onAction('updateSubscription', { userId: user.id, plan: 'pro' })}
              style={{
                padding: '8px 16px',
                backgroundColor: '#FF3366',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Upgrade to Pro
            </button>
          )}
          
          {/* Show Downgrade button only for pro users */}
          {user.subscription === 'pro' && (
            <button
              onClick={() => onAction('updateSubscription', { userId: user.id, plan: 'free' })}
              style={{
                padding: '8px 16px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Downgrade to Free
            </button>
          )}

          <button
            onClick={() => onAction('resetScripts', { userId: user.id })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Reset Scripts
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to ban this user?')) {
                onAction('banUser', { userId: user.id });
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: user.isBanned ? '#666' : '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {user.isBanned ? 'Unban User' : 'Ban User'}
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                onAction('deleteUser', { userId: user.id });
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (!user || !userProfile?.isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '0.5rem' }}>
            Access Denied
          </h1>
          <p style={{ color: '#666' }}>
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navigation />
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
          
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3 style={styles.statLabel}>Total Users</h3>
              <p style={styles.statValue}>{stats.totalUsers}</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statLabel}>Active Users</h3>
              <p style={{ ...styles.statValue, color: '#10b981' }}>{stats.activeUsers}</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statLabel}>Pro Users</h3>
              <p style={{ ...styles.statValue, color: '#1e88e5' }}>{stats.proUsers}</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statLabel}>Free Users</h3>
              <p style={{ ...styles.statValue, color: '#64748b' }}>{stats.freeUsers}</p>
            </div>
            <div style={styles.statCard}>
              <h3 style={styles.statLabel}>Payment History</h3>
              <Link href="/admin/payments" style={{ textDecoration: 'none' }}>
                <p style={{ ...styles.statValue, color: '#FF3366', cursor: 'pointer' }}>
                  View Payments
                </p>
              </Link>
            </div>
          </div>

          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by email or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {error && (
            <div style={styles.errorMessage}>{error}</div>
          )}

          {ipGroups.length > 0 && (
            <div style={styles.suspiciousIpsSection}>
              <h2 style={styles.suspiciousIpsTitle}>Suspicious IP Addresses</h2>
              <div style={styles.suspiciousIpsGrid}>
                {ipGroups.map(({ ip, users }) => (
                  <div key={ip} style={styles.ipCard}>
                    <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>IP: {ip}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                      Users: {users.length}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {users.map(user => (
                        <div key={user.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem',
                          backgroundColor: '#f8f9ff',
                          borderRadius: '6px'
                        }}>
                          <span style={{ fontSize: '0.875rem' }}>{user.email}</span>
                          <button
                            onClick={() => handleAction('deleteUser', { userId: user.id })}
                            style={{
                              color: '#ef4444',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              ':hover': {
                                backgroundColor: '#fee2e2'
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '3px solid #f3f4f6',
                borderTop: '3px solid #FF3366',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : (
            <>
              <div>
                {currentUsers.map(user => (
                  <UserCard key={user.id} user={user} onAction={handleAction} />
                ))}
              </div>

              <div style={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={styles.paginationButton}
                >
                  Previous
                </button>
                <span style={{ margin: '0 1rem' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 