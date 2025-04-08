import AdminProtectedRoute from '../../components/AdminProtectedRoute';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { userProfile } = useAuth();

  return (
    <AdminProtectedRoute>
      <div>
        {/* Your admin dashboard content */}
      </div>
    </AdminProtectedRoute>
  );
} 