import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CalendarCheck, MapPin } from 'lucide-react';

const TenantDashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get('/api/bookings/my-bookings', config);
        setBookings(data);
      } catch (error) {
        console.error('Failed to fetch bookings', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <CalendarCheck className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-800">My Applications & Bookings</h2>
        </div>
        
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't applied for any properties yet.</p>
            <a href="/properties" className="btn-primary inline-block">Browse Properties</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {bookings.map(booking => (
              <div key={booking._id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 truncate pr-2">{booking.property?.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3" /> {booking.property?.location}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium text-gray-900">${booking.property?.rent}</span> /month
                </div>

                <div className="text-xs text-gray-500 mt-4 pt-2 border-t border-gray-50">
                  Applied: {new Date(booking.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantDashboard;
