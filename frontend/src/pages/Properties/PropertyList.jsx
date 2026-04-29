import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, DollarSign } from 'lucide-react';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const { data } = await axios.get(`/api/properties?${queryParams}`);
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []); // Initial load

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Next Home</h1>
        
        {/* Filters and Search */}
        <form onSubmit={handleSearch} className="card p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search properties..."
              value={filters.search}
              onChange={handleFilterChange}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="location"
              placeholder="Location..."
              value={filters.location}
              onChange={handleFilterChange}
              className="input-field pl-10"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min $"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="input-field w-24"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max $"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="input-field w-24"
            />
          </div>

          <button type="submit" className="btn-primary flex items-center justify-center gap-2">
            <Search className="h-4 w-4" /> Filter
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 text-gray-500 card">No properties found matching your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property._id} className="card flex flex-col">
              <div className="h-48 overflow-hidden bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
                <div className="flex items-center text-gray-500 mb-2 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center text-primary-600 font-bold text-lg">
                    <DollarSign className="h-5 w-5" />
                    {property.rent} <span className="text-sm text-gray-500 font-normal">/month</span>
                  </div>
                  <button className="btn-secondary text-sm">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyList;
