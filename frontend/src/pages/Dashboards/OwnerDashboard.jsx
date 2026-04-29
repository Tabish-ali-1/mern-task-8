import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Building, Calendar, X } from 'lucide-react';

const OwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent: '',
    location: '',
  });
  const [images, setImages] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      const [propsRes, bookingsRes] = await Promise.all([
        axios.get('/api/properties/owner/my-properties', config),
        axios.get('/api/bookings/owner-bookings', config)
      ]);
      
      setProperties(propsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmitProperty = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('rent', formData.rent);
      data.append('location', formData.location);
      
      if (images) {
        for (let i = 0; i < images.length; i++) {
          data.append('images', images[i]);
        }
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      await axios.post('/api/properties', data, config);
      setIsModalOpen(false);
      // Reset form
      setFormData({ title: '', description: '', rent: '', location: '' });
      setImages(null);
      // Refresh properties
      fetchDashboardData();
    } catch (error) {
      console.error('Error adding property', error);
      alert('Failed to add property. Make sure all fields are filled.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/bookings/${bookingId}/status`, { status }, config);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Properties Section */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b">
            <Building className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-800">My Properties</h2>
          </div>
          
          {properties.length === 0 ? (
            <p className="text-gray-500 text-sm">You haven't listed any properties yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {properties.map(property => (
                <li key={property._id} className="py-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {property.images && property.images.length > 0 && (
                      <img src={property.images[0]} alt="Property" className="w-12 h-12 rounded object-cover" />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{property.title}</h3>
                      <p className="text-sm text-gray-500">${property.rent}/month • {property.location}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${property.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {property.availability ? 'Available' : 'Rented'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bookings Section */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b">
            <Calendar className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-800">Recent Inquiries</h2>
          </div>
          
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-sm">No booking inquiries yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {bookings.map(booking => (
                <li key={booking._id} className="py-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{booking.property?.title}</h3>
                      <p className="text-sm text-gray-500">From: {booking.tenant?.name} ({booking.tenant?.email})</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  {booking.inquiryText && (
                    <div className="text-sm bg-gray-50 p-2 rounded text-gray-700">
                      "{booking.inquiryText}"
                    </div>
                  )}
                  {booking.status === 'pending' && (
                    <div className="flex gap-4 mt-2">
                      <button onClick={() => handleBookingStatus(booking._id, 'confirmed')} className="text-sm text-green-600 font-medium hover:text-green-700 bg-green-50 px-3 py-1 rounded">Accept</button>
                      <button onClick={() => handleBookingStatus(booking._id, 'rejected')} className="text-sm text-red-600 font-medium hover:text-red-700 bg-red-50 px-3 py-1 rounded">Reject</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Add Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">List a New Property</h2>
            
            <form onSubmit={handleSubmitProperty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="input-field" placeholder="E.g., Modern Downtown Apartment" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input required type="text" name="location" value={formData.location} onChange={handleInputChange} className="input-field" placeholder="City, Neighborhood" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent ($)</label>
                <input required type="number" name="rent" value={formData.rent} onChange={handleInputChange} className="input-field" placeholder="1200" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} className="input-field h-24 resize-none" placeholder="Describe the property..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Images (Max 5)</label>
                <input required type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
              </div>

              <button type="submit" disabled={submitting} className="w-full btn-primary py-3 mt-4">
                {submitting ? 'Uploading...' : 'List Property'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
