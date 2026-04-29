import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Real Components
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import PropertyList from './pages/Properties/PropertyList';
import OwnerDashboard from './pages/Dashboards/OwnerDashboard';
import TenantDashboard from './pages/Dashboards/TenantDashboard';

const Home = () => (
  <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
      Find Your Perfect <span className="text-primary-600">Rental</span>
    </h1>
    <p className="text-xl text-gray-600 max-w-2xl mb-10">
      The premium platform connecting property owners with reliable tenants. Browse beautifully curated listings and book with ease.
    </p>
    <div className="flex flex-col sm:flex-row gap-4">
      <Link to="/properties" className="btn-primary text-lg px-8 py-3">Browse Properties</Link>
      <Link to="/register" className="btn-secondary text-lg px-8 py-3">List Your Property</Link>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/properties" element={<PropertyList />} />
            
            {/* Protected Owner Routes */}
            <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            </Route>

            {/* Protected Tenant Routes */}
            <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
              <Route path="/tenant/dashboard" element={<TenantDashboard />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
