import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import PropertyCard from './Properties/PropertyCard';
import { propertyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', property_type: '', max_price: '' });

  const [activeSlide, setActiveSlide] = useState(0);
  const sliderImages = [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1600607687940-c52af04657b3?auto=format&fit=crop&w=1600&q=80"
  ];

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      await Promise.all([loadAllProperties(), loadFeaturedProperties()]);
      setInitialLoading(false);
    };
    
    loadData();
    
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderImages.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadAllProperties();
  }, [filters]);

  const loadAllProperties = async () => {
    setLoading(true);
    try {
      const res = await propertyAPI.getAll(filters);
      setProperties(res.data.properties || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally { 
      setLoading(false); 
    }
  };

  const loadFeaturedProperties = async () => {
    try {
      const res = await propertyAPI.getFeatured();
      setFeaturedProperties(res.data.properties || []);
    } catch (err) { 
      console.error('Error loading featured properties:', err);
      setFeaturedProperties([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/properties', { state: { filters } });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCategoryClick = (type) => {
    handleFilterChange('property_type', type);
    if (window.innerWidth < 768) {
      navigate('/properties', { state: { filters: { ...filters, property_type: type } } });
    }
  };

  const handleCityClick = (city) => {
    handleFilterChange('city', city);
    if (window.innerWidth < 768) {
      navigate('/properties', { state: { filters: { ...filters, city } } });
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BFA5]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1A2B3C] antialiased">
      <Navbar />

      {/* 1. PREMIUM HERO SECTION */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden">
        {sliderImages.map((img, idx) => (
          <div key={idx} className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${idx === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60 z-10" />
            <img src={img} alt="Premium Living" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}

        <div className="relative z-20 max-w-6xl mx-auto text-center px-4 sm:px-6">
          <span className="inline-block bg-[#00BFA5]/20 backdrop-blur-md text-[#00BFA5] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6 animate-fade-in">
            ✨ Your Premium Rental Partner
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-6 sm:mb-8 tracking-tight leading-tight">
            Elevate Your <span className="text-[#00BFA5]">Living</span> Experience
          </h1>
          
          {/* Glassmorphism Search Bar */}
          <div className="bg-white/10 backdrop-blur-xl p-2 sm:p-3 rounded-2xl sm:rounded-[32px] shadow-2xl border border-white/20 max-w-4xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
            <form onSubmit={handleSearch} className="bg-white rounded-xl sm:rounded-[24px] p-2 flex flex-col md:flex-row gap-2 items-center">
              <div className="flex-[2] flex items-center px-4 sm:px-6 w-full md:border-r border-gray-100">
                <span className="text-gray-400 mr-2 sm:mr-3 text-lg sm:text-xl">📍</span>
                <input 
                  type="text" 
                  placeholder="Where do you want to live?" 
                  className="w-full py-3 sm:py-4 outline-none text-gray-700 bg-transparent font-medium placeholder:text-gray-400 text-sm sm:text-base" 
                  value={filters.city} 
                  onChange={(e) => handleFilterChange('city', e.target.value)} 
                />
              </div>
              <div className="flex-1 px-4 w-full md:w-auto">
                <select 
                  className="w-full h-full outline-none text-gray-600 bg-transparent font-semibold cursor-pointer py-3 sm:py-0 text-sm sm:text-base" 
                  value={filters.property_type} 
                  onChange={(e) => handleFilterChange('property_type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="room">Single Room</option>
                  <option value="flat">Full Flat</option>
                  <option value="house">House</option>
                </select>
              </div>
              <button type="submit" className="w-full md:w-auto bg-[#1A2B3C] hover:bg-[#00BFA5] text-white px-6 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group text-sm sm:text-base">
                Search <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </form>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 sm:gap-4 text-white/80 text-xs sm:text-sm font-medium">
            <span className="opacity-60 uppercase tracking-widest text-[10px] flex items-center">Trending Cities:</span>
            {['Kathmandu', 'Pokhara', 'Lalitpur', 'Butwal'].map(city => (
              <button 
                key={city} 
                onClick={() => handleCityClick(city)} 
                className="px-2 sm:px-3 py-1 bg-white/10 hover:bg-[#00BFA5] rounded-full backdrop-blur-sm transition-colors text-xs sm:text-sm"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STATS & TRUST BAR */}
      <section className="relative -mt-12 sm:-mt-16 z-30 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
          {[
            { n: '3,000+', l: 'Listings' }, 
            { n: '10k+', l: 'Happy Users' }, 
            { n: '100%', l: 'Verified' }, 
            { n: '0%', l: 'Commission' }
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#1A2B3C] group-hover:text-[#00BFA5] transition-colors">{stat.n}</p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{stat.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CATEGORIES */}
      <section className="py-12 sm:py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 md:mb-16 gap-4 sm:gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-4">Explore by <span className="text-[#00BFA5]">Category</span></h2>
            <p className="text-gray-500 text-sm sm:text-base">Tailored spaces for your unique lifestyle. From cozy rooms to spacious flats.</p>
          </div>
          <Link to="/properties" className="text-[#1A2B3C] font-bold flex items-center gap-2 hover:text-[#00BFA5] transition-colors text-sm sm:text-base">
            View All <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {[
            { label: 'Single Room', icon: '🏠', type: 'room' },
            { label: 'Luxury Flat', icon: '🏢', type: 'flat' },
            { label: 'House', icon: '🏡', type: 'house' },
            { label: 'Office', icon: '💼', type: 'office' },
            { label: 'Roommate', icon: '🤝', type: 'roommate' }
          ].map((cat) => (
            <button 
              key={cat.label}
              onClick={() => handleCategoryClick(cat.type)}
              className="group bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 hover:border-[#00BFA5]/30 hover:shadow-[0_20px_40px_rgba(0,191,165,0.1)] transition-all duration-500 text-center"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 md:mb-6 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">{cat.icon}</div>
              <p className="font-bold text-[#1A2B3C] group-hover:text-[#00BFA5] transition-colors text-xs sm:text-sm md:text-base">{cat.label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 4. PREMIUM LISTINGS */}
      {featuredProperties.length > 0 && (
        <section className="bg-white py-12 sm:py-16 md:py-24 px-4 sm:px-6 border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8 sm:mb-12">
              <div className="h-px bg-gray-200 flex-grow"></div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#1A2B3C] uppercase tracking-tighter whitespace-nowrap">⭐ Premium Selection</h2>
              <div className="h-px bg-gray-200 flex-grow"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              {featuredProperties.slice(0, 3).map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* 5. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1A2B3C]">Recently Added</h2>
          <Link to="/properties" className="group text-[#1A2B3C] font-bold flex items-center gap-2 hover:text-[#00BFA5] transition-colors text-sm sm:text-base">
            Explore All Listings <span className="group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 sm:h-80 md:h-96 bg-gray-100 rounded-2xl sm:rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {properties.slice(0, 6).map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-600 mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new listings.</p>
          </div>
        )}
      </section>

      {/* 6. LANDLORD CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16 md:pb-24">
        <div className="relative rounded-3xl sm:rounded-[48px] overflow-hidden bg-[#1A2B3C] p-6 sm:p-8 md:p-12 lg:p-24 text-center">
          <div className="absolute top-0 right-0 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-[#00BFA5]/20 rounded-full blur-[50px] sm:blur-[100px] -mr-12 sm:-mr-24 md:-mr-48 -mt-12 sm:-mt-24 md:-mt-48"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6">
              List Your Property <br/> For <span className="text-[#00BFA5]">Free</span>
            </h2>
            <p className="text-white/60 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-12 max-w-xl mx-auto">
              Get access to thousands of verified tenants and manage your property with ease.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link 
                to={isAuthenticated ? "/post-ad" : "/login"} 
                state={!isAuthenticated ? { from: "/post-ad" } : null}
                className="bg-[#00BFA5] text-[#1A2B3C] px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold sm:font-black text-base sm:text-lg hover:scale-105 transition-all shadow-xl shadow-[#00BFA5]/20"
              >
                Start Listing Now
              </Link>
              <Link 
                to="/how-it-works" 
                className="bg-white/10 text-white backdrop-blur-md border border-white/20 px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold sm:font-black text-base sm:text-lg hover:bg-white/20 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS */}
      <section className="py-12 sm:py-16 md:py-24 bg-white border-b border-gray-100 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-xl sm:text-2xl md:text-3xl font-black mb-8 sm:mb-12 md:mb-16">Simple. Fast. Reliable.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16">
            {[
              { t: 'Smart Discovery', d: 'Advanced filters to find exactly what you need.', i: '01' },
              { t: 'Verified Tours', d: 'Connect directly with owners for real visits.', i: '02' },
              { t: 'Secure Move-in', d: 'Paperwork and keys made simple.', i: '03' }
            ].map((step) => (
              <div key={step.i} className="relative group">
                <span className="text-5xl sm:text-6xl md:text-7xl font-black text-[#1A2B3C]/5 absolute -top-8 sm:-top-10 -left-2 sm:-left-4 group-hover:text-[#00BFA5]/10 transition-colors">
                  {step.i}
                </span>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 relative z-10">{step.t}</h3>
                <p className="text-gray-500 text-sm sm:text-base relative z-10">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-12 sm:py-16 md:py-24 bg-[#F8FAFC] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-gray-50">
                <div className="flex text-[#00BFA5] mb-4 sm:mb-6">★★★★★</div>
                <p className="text-gray-600 leading-relaxed mb-6 sm:mb-8 italic text-sm sm:text-base">
                  "The transparency of this platform is unmatched. I found my current flat in just 2 days without paying a single rupee to brokers."
                </p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full" />
                  <div>
                    <p className="font-bold text-sm sm:text-base">Anil Sharma</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Verified Tenant</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-[#1A2B3C] text-white pt-12 sm:pt-16 md:pt-24 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 md:gap-16 mb-12 sm:mb-16 md:mb-24">
          <div className="col-span-1 lg:col-span-1">
            <h2 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 tracking-tighter">
              Room<span className="text-[#00BFA5]">Rental</span>
            </h2>
            <p className="text-white/40 leading-relaxed text-sm sm:text-base">
              Redefining the rental ecosystem in Nepal through technology, trust, and transparency.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 sm:mb-8 text-base sm:text-lg uppercase tracking-widest">Platform</h4>
            <ul className="space-y-2 sm:space-y-4 text-white/50 font-medium text-sm sm:text-base">
              <li><Link to="/properties" className="hover:text-white transition">Search Properties</Link></li>
              <li><Link to="/featured" className="hover:text-white transition">Featured Homes</Link></li>
              <li><Link to="/post-ad" className="hover:text-white transition">List a Room</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 sm:mb-8 text-base sm:text-lg uppercase tracking-widest">Company</h4>
            <ul className="space-y-2 sm:space-y-4 text-white/50 font-medium text-sm sm:text-base">
              <li><Link to="/about" className="hover:text-white transition">Our Story</Link></li>
              <li><Link to="/safety" className="hover:text-white transition">Safety First</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>
          <div className="bg-white/5 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/10">
            <h4 className="font-bold text-white mb-3 sm:mb-4 text-base sm:text-lg">Join our Newsletter</h4>
            <div className="flex bg-white/10 rounded-lg sm:rounded-xl p-1">
              <input 
                type="email" 
                placeholder="Email" 
                className="bg-transparent px-3 sm:px-4 py-2 outline-none w-full text-xs sm:text-sm" 
              />
              <button className="bg-[#00BFA5] p-2 px-3 sm:px-4 rounded-lg font-bold text-xs sm:text-sm">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-white/20 text-xs font-bold tracking-widest uppercase border-t border-white/5 pt-6 sm:pt-8 md:pt-12">
          <p className="text-center md:text-left mb-4 md:mb-0">© 2025 RoomRental. All rights reserved.</p>
          <div className="flex gap-4 sm:gap-6 md:gap-8">
            <span className="hover:text-white cursor-pointer transition">Facebook</span>
            <span className="hover:text-white cursor-pointer transition">Instagram</span>
            <span className="hover:text-white cursor-pointer transition">LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;