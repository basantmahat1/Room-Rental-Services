import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { wishlistAPI } from '../../services/api';
                import { HeartOutlined, HeartFilled } from "@ant-design/icons";

const PropertyCard = ({ property, onWishlistChange }) => {
    const { user } = useAuth();
    const [inWishlist, setInWishlist] = useState(property.inWishlist || false);
    const [loading, setLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const imageContainerRef = useRef(null);

    const amenities = property.amenities || [];

    const getAmenityIcon = (amenity) => {
        const icons = {
            wifi: '📶', parking: '🅿️', water: '💧', kitchen: '🍳', ac: '❄️',
            laundry: '🧺', security: '🔒', pool: '🏊', gym: '💪', elevator: '🛗',
            tv: '📺', heating: '🔥', balcony: '🌆', garden: '🌳', pet_friendly: '🐾'
        };
        return icons[amenity] || "🏠";
    };

    const parseImages = () => {
        let images = [];
        try {
            if (typeof property.images === 'string') {
                const parsed = JSON.parse(property.images);
                if (Array.isArray(parsed)) {
                    images = parsed.filter(img => img && img.trim() !== '');
                }
            } else if (Array.isArray(property.images)) {
                images = property.images.filter(img => img && img.trim() !== '');
            }
            if (property.primary_image && property.primary_image.trim() !== '') {
                if (!images.includes(property.primary_image)) {
                    images = [property.primary_image, ...images];
                }
            }
            images = [...new Set(images)];
        } catch (err) {
            console.error('Error parsing images:', err);
        }
        return images.length === 0 ? ['/api/placeholder/400/300'] : images;
    };

    const images = parseImages();

    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [images.length]);

    const nextImage = (e) => {
        e?.preventDefault(); e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e?.preventDefault(); e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleWishlistToggle = async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!user || user.role !== 'tenant') {
            alert('Please login as a tenant to add to wishlist');
            return;
        }
        setLoading(true);
        try {
            const response = await wishlistAPI.toggle(property.id);
            setInWishlist(response.data.inWishlist);
            if (onWishlistChange) onWishlistChange(property.id, response.data.inWishlist);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update wishlist');
        } finally { setLoading(false); }
    };

    const handleShare = async (e) => {
        e.preventDefault(); e.stopPropagation();
        const shareUrl = `${window.location.origin}/properties/${property.id}`;
        if (navigator.share) {
            try { await navigator.share({ title: property.title, url: shareUrl }); } catch (err) {}
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Link copied!');
        }
    };

    const handleWhatsAppShare = (e) => {
        e.preventDefault(); e.stopPropagation();
        const shareUrl = `${window.location.origin}/properties/${property.id}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(property.title + ' ' + shareUrl)}`, '_blank');
    };

    return (
        <Link
            to={`/properties/${property.id}`}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 block group"
        >
            {/* Image Section */}
            <div className="relative h-60 overflow-hidden" ref={imageContainerRef}>
                <div className="relative h-full w-full">
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-700 ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <img src={img} alt={property.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                    ))}
                </div>

                {/* Arrows */}
                {images.length > 1 && (
                    <>
                        <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">←</button>
                        <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">→</button>
                    </>
                )}

                {/* Badges - Design Consistent with Image */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="bg-[#00BFA5] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">New Listing</span>
                    {property.featured && <span className="bg-yellow-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">⭐ Featured</span>}
                    {property.is_verified && <span className="bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">✅ Verified</span>}
                </div>

                {/* Wishlist */}


<button
  onClick={handleWishlistToggle}
  disabled={loading}
  className="absolute top-3 right-3 cursor-pointer transition-transform hover:scale-125"
>
  {loading ? (
    '...'
  ) : inWishlist ? (
    <HeartFilled style={{ color: '#ff4d4f', fontSize: '24px' }} />
  ) : (
    <HeartOutlined style={{ color: '#4B5563', fontSize: '24px' }} />
  )}
</button>

                
                {/* Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, idx) => (
                            <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-4 bg-[#00BFA5]' : 'w-1.5 bg-white/60'}`} />
                        ))}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-[#1A2B3C] truncate">{property.title}</h3>
                        <p className="text-sm text-gray-500 truncate">📍 {property.address}, {property.city}</p>
                    </div>
                    <div className="text-right ml-4">
                        <span className="font-bold text-xl text-[#00BFA5]">Rs. {property.price.toLocaleString()}</span>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">per month</p>
                    </div>
                </div>

                {/* Property Features */}
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 my-4 py-2 border-y border-gray-50">
                    <span>🛏️ {property.bedrooms} Bed</span>
                    <span>🚿 {property.bathrooms} Bath</span>
                    <span>📐 {property.area_sqft} sqft</span>
                </div>

                {/* Amenities Icons */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                    {amenities.slice(0, 4).map((a, i) => (
                        <span key={i} className="bg-gray-50 text-gray-600 text-[10px] px-2 py-1 rounded border border-gray-100" title={a}>
                            {getAmenityIcon(a)} {a.replace('_', ' ')}
                        </span>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // This will work through the parent Link
                      }}
                      className="flex-grow bg-[#00BFA5] text-white text-center py-2.5 rounded-xl hover:brightness-110 transition-all font-bold text-sm shadow-sm active:scale-95">
                        View Details
                    </button>
                    <button onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/properties/${property.id}/map`;
                      }} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 border border-blue-100" title="View on Map">📍</button>
                    <button onClick={handleShare} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 border border-gray-100" title="Share">🔗</button>
                    <button onClick={handleWhatsAppShare} className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 border border-green-100" title="WhatsApp Share">💬</button>
                </div>
            </div>
        </Link>
    );
};

export default PropertyCard;