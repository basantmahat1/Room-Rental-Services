import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const InstantBooking = ({ propertyId, propertyTitle, propertyPrice, checkInDate, checkOutDate }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [bookingData, setBookingData] = useState({
        propertyId,
        checkInDate: checkInDate || '',
        checkOutDate: checkOutDate || '',
        guests: 1,
        specialRequests: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: ''
    });
    const [totalAmount, setTotalAmount] = useState(0);

    // Calculate total amount
    useEffect(() => {
        if (bookingData.checkInDate && bookingData.checkOutDate) {
            const checkIn = new Date(bookingData.checkInDate);
            const checkOut = new Date(bookingData.checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            setTotalAmount(nights * propertyPrice);
        }
    }, [bookingData.checkInDate, bookingData.checkOutDate, propertyPrice]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        setCardDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateCardNumber = (number) => {
        // Simple validation for demo
        return number.replace(/\s/g, '').length === 16;
    };

    const validateExpiryDate = (date) => {
        const [month, year] = date.split('/');
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        
        if (!month || !year) return false;
        if (parseInt(month) < 1 || parseInt(month) > 12) return false;
        if (parseInt(year) < currentYear) return false;
        if (parseInt(year) === currentYear && parseInt(month) < currentMonth) return false;
        
        return true;
    };

    const handleBooking = async () => {
        if (!user) {
            alert('Please login to book');
            return;
        }

        // Validation
        if (!bookingData.checkInDate || !bookingData.checkOutDate) {
            alert('Please select check-in and check-out dates');
            return;
        }

        if (new Date(bookingData.checkInDate) >= new Date(bookingData.checkOutDate)) {
            alert('Check-out date must be after check-in date');
            return;
        }

        if (paymentMethod === 'credit_card') {
            if (!validateCardNumber(cardDetails.cardNumber)) {
                alert('Please enter a valid 16-digit card number');
                return;
            }
            if (!validateExpiryDate(cardDetails.expiryDate)) {
                alert('Please enter a valid expiry date (MM/YY)');
                return;
            }
            if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
                alert('Please enter a valid CVV');
                return;
            }
            if (!cardDetails.nameOnCard) {
                alert('Please enter name on card');
                return;
            }
        }

        if (!window.confirm(`Confirm booking for $${totalAmount}?`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/bookings/instant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    ...bookingData,
                    paymentMethod,
                    cardDetails: paymentMethod === 'credit_card' ? cardDetails : null,
                    totalAmount,
                    isInstant: true
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Booking confirmed! Booking ID: ${data.bookingId}`);
                // Redirect to bookings page
                window.location.href = '/tenant/bookings';
            } else {
                throw new Error(data.message || 'Booking failed');
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert(`Booking failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Instant Booking</h2>
            
            {/* Property Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-lg mb-2">{propertyTitle}</h3>
                <div className="flex justify-between items-center">
                    <div className="text-gray-600">
                        <div>Property ID: {propertyId}</div>
                        <div>Price: ${propertyPrice}/night</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                        ${totalAmount}
                    </div>
                </div>
            </div>

            {/* Booking Details */}
            <div className="mb-6">
                <h3 className="font-bold text-lg mb-4">Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Check-in Date *
                        </label>
                        <input
                            type="date"
                            name="checkInDate"
                            value={bookingData.checkInDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            required
                        />
                        {bookingData.checkInDate && (
                            <div className="text-sm text-gray-500 mt-1">
                                {formatDate(bookingData.checkInDate)}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Check-out Date *
                        </label>
                        <input
                            type="date"
                            name="checkOutDate"
                            value={bookingData.checkOutDate}
                            onChange={handleInputChange}
                            min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            required
                        />
                        {bookingData.checkOutDate && (
                            <div className="text-sm text-gray-500 mt-1">
                                {formatDate(bookingData.checkOutDate)}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Guests *
                    </label>
                    <select
                        name="guests"
                        value={bookingData.guests}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                        ))}
                    </select>
                </div>
                
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requests (Optional)
                    </label>
                    <textarea
                        name="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Any special requirements or requests..."
                    />
                </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
                <h3 className="font-bold text-lg mb-4">Payment Method</h3>
                <div className="space-y-3">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="credit_card"
                            checked={paymentMethod === 'credit_card'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-2"
                        />
                        Credit/Debit Card
                    </label>
                    
                    {paymentMethod === 'credit_card' && (
                        <div className="p-4 border rounded-lg space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Card Number *
                                </label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={cardDetails.cardNumber}
                                    onChange={handleCardChange}
                                    placeholder="1234 5678 9012 3456"
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                    maxLength="19"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expiry Date (MM/YY) *
                                    </label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        value={cardDetails.expiryDate}
                                        onChange={handleCardChange}
                                        placeholder="MM/YY"
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                        maxLength="5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CVV *
                                    </label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={cardDetails.cvv}
                                        onChange={handleCardChange}
                                        placeholder="123"
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                        maxLength="3"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name on Card *
                                </label>
                                <input
                                    type="text"
                                    name="nameOnCard"
                                    value={cardDetails.nameOnCard}
                                    onChange={handleCardChange}
                                    placeholder="John Doe"
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                        </div>
                    )}
                    
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="pay_later"
                            checked={paymentMethod === 'pay_later'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-2"
                        />
                        Pay at Property
                    </label>
                </div>
            </div>

            {/* Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-lg mb-3">Booking Summary</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Property Price</span>
                        <span>${propertyPrice}/night</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Number of Nights</span>
                        <span>
                            {bookingData.checkInDate && bookingData.checkOutDate 
                                ? Math.ceil((new Date(bookingData.checkOutDate) - new Date(bookingData.checkInDate)) / (1000 * 60 * 60 * 24))
                                : 0} nights
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Service Fee</span>
                        <span>$0.00</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold text-lg">
                        <span>Total Amount</span>
                        <span className="text-green-600">${totalAmount}</span>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-6 p-4 border rounded-lg">
                <label className="flex items-start">
                    <input type="checkbox" className="mt-1 mr-2" required />
                    <span className="text-sm">
                        I agree to the Terms and Conditions and understand that this is an instant booking. 
                        The property will be reserved immediately upon confirmation. Cancellation policies apply.
                    </span>
                </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleBooking}
                    disabled={loading || !bookingData.checkInDate || !bookingData.checkOutDate}
                    className="flex-1 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Confirm Instant Booking'}
                </button>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-blue-50 rounded text-sm text-blue-700">
                <p className="font-medium mb-1">🔒 Secure Booking</p>
                <p>Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.</p>
            </div>
        </div>
    );
};

export default InstantBooking;