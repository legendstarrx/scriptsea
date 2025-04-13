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

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check admin access
    if (user && user.email !== 'legendstarr2024@gmail.com') {
      router.push('/');
      return;
    }
    
    if (user?.email === 'legendstarr2024@gmail.com') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const updateUserSubscription = async (userId, newSubscription) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscription: newSubscription,
        scriptsRemaining: newSubscription === 'premium' ? 999999 : 3
      });
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const toggleUserBan = async (userId, currentBanStatus) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isBanned: !currentBanStatus
      });
      await fetchUsers();
    } catch (error) {
      console.error('Error toggling ban status:', error);
    }
  };

  const deleteUserAccount = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      await fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.email !== 'legendstarr2024@gmail.com') {
    return null;
  }

  return (
    <AdminProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Search Input */}
            <input
              type="text"
          placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        {/* Users Table */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>IP Address</th>
                  <th>Subscription</th>
                  <th>Scripts Left</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.displayName}</td>
                    <td>{user.ipAddress || 'N/A'}</td>
                    <td>{user.subscription}</td>
                    <td>{user.scriptsRemaining}</td>
                    <td>
                      <select
                        value={user.subscription}
                        onChange={(e) => updateUserSubscription(user.id, e.target.value)}
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                      </select>
                      <button
                        onClick={() => toggleUserBan(user.id, user.isBanned)}
                        className={user.isBanned ? 'unban-btn' : 'ban-btn'}
                      >
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                          <button
                        onClick={() => deleteUserAccount(user.id)}
                        className="delete-btn"
                          >
                            Delete
                          </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
            </div>
    </AdminProtectedRoute>
  );
} 