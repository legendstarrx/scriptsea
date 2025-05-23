import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AdminProtectedRoute from '../components/AdminProtectedRoute';

// Move this outside the component
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const VALID_ACTIONS = {
    UPDATE_SUBSCRIPTION: 'updateSubscription',
    DELETE_USER: 'deleteUser',
    BAN_IP: 'banByIP',
    UNBAN_IP: 'unbanByIP'
};

function AdminDashboard() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionDetails, setActionDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.email) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/admin/get-users', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`,
          'x-admin-email': user.email
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      if (!Array.isArray(data.users)) {
        throw new Error('Invalid response format');
      }
      
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('Admin Dashboard - Auth state:', {
      authLoading,
      userEmail: user?.email,
      adminEmail: ADMIN_EMAIL,
      userProfile
    });

    if (!authLoading) {
      if (!user?.email) {
        console.log('Admin Dashboard - No user email, redirecting');
        router.push('/');
        return;
      }

      if (user.email !== ADMIN_EMAIL) {
        console.log('Admin Dashboard - Not admin, redirecting');
        router.push('/');
        return;
      }

      console.log('Admin Dashboard - Fetching users');
      fetchUsers();
    }
  }, [user, authLoading, router, fetchUsers, userProfile]);

  const handleAction = async (action, userId, data = {}) => {
    try {
        console.log('Attempting action:', { action, userId, data });
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`,
                'x-admin-email': user.email
            },
            body: JSON.stringify({ 
                action,
                userId,
                data: {
                    ...data,
                    adminEmail: user.email
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Action failed');
        }

        // If it's a delete action, force revoke all sessions
        if (action === VALID_ACTIONS.DELETE_USER) {
            try {
                await fetch('/api/admin/revoke-sessions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`,
                    },
                    body: JSON.stringify({ userId })
                });
            } catch (error) {
                console.error('Failed to revoke sessions:', error);
            }
        }

        // Update local state based on action
        if (action === VALID_ACTIONS.UPDATE_SUBSCRIPTION) {
            setUsers(prevUsers => prevUsers.map(u => {
                if (u.id === userId) {
                    const subscription = data.plan.startsWith('pro') ? 'pro' : 'free';
                    const subscriptionType = data.plan === 'free' ? null 
                        : data.plan === 'pro_yearly' ? 'yearly' : 'monthly';
                    return {
                        ...u,
                        subscription,
                        subscriptionType,
                        scriptsRemaining: subscription === 'pro' ? 100 : 3,
                        scriptsLimit: subscription === 'pro' ? 100 : 3
                    };
                }
                return u;
            }));
        } else if (action === VALID_ACTIONS.BAN_IP) {
            setUsers(prevUsers => prevUsers.map(u => 
                u.ipAddress === data.ipAddress ? { ...u, isBanned: true } : u
            ));
        } else if (action === VALID_ACTIONS.UNBAN_IP) {
            setUsers(prevUsers => prevUsers.map(u => 
                u.ipAddress === data.ipAddress ? { ...u, isBanned: false } : u
            ));
        } else if (action === VALID_ACTIONS.DELETE_USER) {
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        }

        toast.success('Action completed successfully');
    } catch (error) {
        console.error('Action error:', error);
        toast.error(error.message || 'Failed to perform action');
    }
};

  const handleBanUnbanIP = (user) => {
    const action = user.isBanned ? VALID_ACTIONS.UNBAN_IP : VALID_ACTIONS.BAN_IP;
    handleAction(action, user.id, { ipAddress: user.ipAddress });
  };

  const confirmAction = (action, userId, data = {}) => {
    setActionDetails({ action, userId, data });
    setShowConfirmation(true);
  };

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    proUsers: users.filter(user => user.subscription === 'pro').length,
    freeUsers: users.filter(user => user.subscription === 'free').length,
    bannedUsers: users.filter(user => user.isBanned).length
  };

  // Filter and paginate users
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <AdminProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your users and monitor system statistics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.proUsers}</div>
            <div className="text-sm text-gray-600">Pro Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-600">{stats.freeUsers}</div>
            <div className="text-sm text-gray-600">Free Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">{stats.bannedUsers}</div>
            <div className="text-sm text-gray-600">Banned Users</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by email or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scripts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.ipAddress}
                    <button 
                      onClick={() => handleBanUnbanIP(user)}
                      className={`ml-2 px-2 py-1 text-xs ${
                          user.isBanned 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-red-500 hover:bg-red-600'
                      } text-white rounded`}
                    >
                      {user.isBanned ? 'Unban IP' : 'Ban IP'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.subscription === 'pro' 
                        ? `Pro (${user.subscriptionType})` 
                        : user.subscription}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.scriptsRemaining}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleAction(VALID_ACTIONS.UPDATE_SUBSCRIPTION, user.id, { plan: 'pro_monthly' })}
                        className={`px-3 py-1 ${
                            user.subscription === 'pro' && user.subscriptionType === 'monthly'
                                ? 'bg-blue-300'
                                : 'bg-blue-500 hover:bg-blue-600'
                        } text-white rounded`}
                        disabled={user.subscription === 'pro' && user.subscriptionType === 'monthly'}
                      >
                        Monthly Pro
                      </button>
                      <button 
                        onClick={() => handleAction(VALID_ACTIONS.UPDATE_SUBSCRIPTION, user.id, { plan: 'pro_yearly' })}
                        className={`px-3 py-1 ${
                            user.subscription === 'pro' && user.subscriptionType === 'yearly'
                                ? 'bg-green-300'
                                : 'bg-green-500 hover:bg-green-600'
                        } text-white rounded`}
                        disabled={user.subscription === 'pro' && user.subscriptionType === 'yearly'}
                      >
                        Yearly Pro
                      </button>
                      <button 
                        onClick={() => handleAction(VALID_ACTIONS.UPDATE_SUBSCRIPTION, user.id, { plan: 'free' })}
                        className={`px-3 py-1 ${
                            user.subscription === 'free'
                                ? 'bg-yellow-300'
                                : 'bg-yellow-500 hover:bg-yellow-600'
                        } text-white rounded`}
                        disabled={user.subscription === 'free'}
                      >
                        Downgrade to Free
                      </button>
                      <button 
                        onClick={() => handleAction(VALID_ACTIONS.DELETE_USER, user.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}

// Use getStaticProps to ensure proper server-side initialization
export const getStaticProps = async () => {
  return {
    props: {
      protected: true,
      adminOnly: true
    }
  };
};

export default AdminDashboard; 