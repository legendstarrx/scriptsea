import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { getAllUsers, getUsersByIP, updateSubscription, deleteUserAccount } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchIP, setSearchIP] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByIP = async () => {
    if (!searchIP) {
      setFilteredUsers(users);
      return;
    }

    try {
      setLoading(true);
      const usersWithIP = await getUsersByIP(searchIP);
      setFilteredUsers(usersWithIP);
    } catch (err) {
      setError('Failed to search users by IP');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (userId, newPlan) => {
    try {
      await updateSubscription(userId, newPlan);
      await loadUsers(); // Reload users to reflect changes
    } catch (err) {
      setError('Failed to update subscription');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUserAccount(userId);
        await loadUsers(); // Reload users to reflect changes
      } catch (err) {
        setError('Failed to delete user');
        console.error(err);
      }
    }
  };

  const handleDeleteUsersByIP = async (ipAddress) => {
    if (window.confirm(`Are you sure you want to delete all users with IP: ${ipAddress}?`)) {
      try {
        const usersToDelete = await getUsersByIP(ipAddress);
        await Promise.all(usersToDelete.map(user => deleteUserAccount(user.id)));
        await loadUsers(); // Reload users to reflect changes
      } catch (err) {
        setError('Failed to delete users by IP');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchIP}
            onChange={(e) => setSearchIP(e.target.value)}
            placeholder="Search by IP address"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSearchByIP}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scripts Generated
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {user.displayName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {user.ipAddress || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  <select
                    value={user.subscription || 'free'}
                    onChange={(e) => handleUpdateSubscription(user.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {user.scriptsGenerated || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    {user.ipAddress && (
                      <button
                        onClick={() => handleDeleteUsersByIP(user.ipAddress)}
                        className="bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800"
                      >
                        Delete by IP
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel; 