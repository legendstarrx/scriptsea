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
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
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

  if (!user || user.email !== 'legendstarr2024@gmail.com') {
    return null;
  }

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500">Total Users</dt>
                  <dd className="mt-1 text-3xl font-semibold text-pink-600">{users.length}</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500">Pro Users</dt>
                  <dd className="mt-1 text-3xl font-semibold text-pink-600">
                    {users.filter(u => u.subscription === 'pro' || u.subscription === 'premium').length}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500">Banned Users</dt>
                  <dd className="mt-1 text-3xl font-semibold text-pink-600">
                    {users.filter(u => u.isBanned).length}
                  </dd>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            {/* Users Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scripts Left</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.filter(user => 
                        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map(user => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.ipAddress || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.subscription}
                              onChange={(e) => updateUserSubscription(user.id, e.target.value)}
                              className="text-sm rounded-md border-gray-300 focus:ring-pink-500 focus:border-pink-500"
                            >
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.scriptsRemaining}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => toggleUserBan(user.id, user.isBanned)}
                              className={`mr-2 px-3 py-1 rounded-md ${
                                user.isBanned 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {user.isBanned ? 'Unban' : 'Ban'}
                            </button>
                            <button
                              onClick={() => deleteUserAccount(user.id)}
                              className="text-red-600 hover:text-red-900"
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
          </div>
        </div>
        <Footer />
      </div>
    </AdminProtectedRoute>
  );
} 