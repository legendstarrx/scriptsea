import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AdminProtectedRoute from '../components/AdminProtectedRoute';

function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionDetails, setActionDetails] = useState(null);

  useEffect(() => {
    if (!user?.email || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/get-users', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      if (!data.users) {
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
  };

  const handleAction = async (action, userId, data = {}) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`
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

      if (response.ok) {
        toast.success('Action completed successfully');
        fetchUsers();
      } else {
        throw new Error('Action failed');
      }
    } catch (error) {
      toast.error('Failed to perform action');
    }
  };

  const confirmAction = (action, userId, data = {}) => {
    setActionDetails({ action, userId, data });
    setShowConfirmation(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 text-xl mb-4">Error: {error}</div>
        <button 
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {users.length === 0 ? (
        <div className="text-center text-gray-600">No users found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scripts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {user.ipAddress}
                      {user.isBanned && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Banned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.subscription}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{user.scriptsRemaining} / {user.scriptsLimit}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {user.lastPayment ? new Date(user.lastPayment).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAction('updateSubscription', user.id, { plan: 'pro_monthly' })}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Monthly Pro
                      </button>
                      <button
                        onClick={() => handleAction('updateSubscription', user.id, { plan: 'pro_yearly' })}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Yearly Pro
                      </button>
                      <button
                        onClick={() => handleAction('updateSubscription', user.id, { plan: 'free' })}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Free
                      </button>
                      <button
                        onClick={() => confirmAction('deleteUser', user.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                      {!user.isBanned ? (
                        <button
                          onClick={() => confirmAction('banByIP', user.id, { ipAddress: user.ipAddress })}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Ban IP
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction('unbanByIP', user.id, { ipAddress: user.ipAddress })}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Unban IP
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
            <p className="mb-4">Are you sure you want to perform this action?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAction(actionDetails.action, actionDetails.userId, actionDetails.data);
                  setShowConfirmation(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap the component with AdminProtectedRoute
export default function ProtectedAdminDashboard() {
  return (
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  );
} 