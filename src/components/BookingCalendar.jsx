import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const BookingCalendar = ({ propertyId, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState([null, null]);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(true);

  // Fetch booked dates for the property
  useEffect(() => {
    fetchBookedDates();
  }, [propertyId]);

  const fetchBookedDates = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/bookings`);
      const data = await response.json();
      
      if (data.bookings) {
        const booked = data.bookings.flatMap(booking => {
          const dates = [];
          const start = new Date(booking.check_in_date);
          const end = new Date(booking.check_out_date);
          
          for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
          }
          return dates;
        });
        
        setBookedDates(booked);
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  };

  // Check availability for selected dates
  const checkAvailability = async (dates) => {
    if (!dates[0] || !dates[1]) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          checkInDate: dates[0].toISOString().split('T')[0],
          checkOutDate: dates[1].toISOString().split('T')[0]
        })
      });
      
      const data = await response.json();
      setAvailability(data.available);
      
      if (data.available && onDateSelect) {
        onDateSelect(dates);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection
  const handleDateChange = (dates) => {
    setSelectedDate(dates);
    checkAvailability(dates);
  };

  // Tile content for booked dates
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      
      // Check if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        return 'text-gray-300 cursor-not-allowed';
      }
      
      // Check if date is booked
      if (bookedDates.includes(dateString)) {
        return 'bg-red-100 text-red-600 rounded';
      }
      
      // Check if date is in selected range
      if (selectedDate[0] && selectedDate[1]) {
        const start = selectedDate[0];
        const end = selectedDate[1];
        
        if (date >= start && date <= end) {
          return availability ? 'bg-blue-100 text-blue-600 rounded' : 'bg-red-100 text-red-600 rounded';
        }
      }
      
      // Check if date is selected
      if (selectedDate[0] && date.toDateString() === selectedDate[0].toDateString()) {
        return 'bg-blue-500 text-white rounded-l';
      }
      
      if (selectedDate[1] && date.toDateString() === selectedDate[1].toDateString()) {
        return 'bg-blue-500 text-white rounded-r';
      }
    }
    return '';
  };

  // Disable booked dates
  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      
      // Disable past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        return true;
      }
      
      // Disable booked dates
      return bookedDates.includes(dateString);
    }
    return false;
  };

  // Format date for display
  const formatDate = (date) => {
    return date ? date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : '';
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!selectedDate[0] || !selectedDate[1]) return 0;
    
    const diffTime = Math.abs(selectedDate[1] - selectedDate[0]);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Assuming daily rate is monthly rate / 30
    const dailyRate = 50; // This should come from property data
    return diffDays * dailyRate;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Select Dates</h2>
      
      {/* Selected Dates */}
      <div className="mb-6">
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div>
            <div className="text-sm text-gray-600">Check-in</div>
            <div className="font-semibold">{formatDate(selectedDate[0])}</div>
          </div>
          <div className="text-gray-400">→</div>
          <div>
            <div className="text-sm text-gray-600">Check-out</div>
            <div className="font-semibold">{formatDate(selectedDate[1])}</div>
          </div>
        </div>
        
        {selectedDate[0] && selectedDate[1] && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">
                  {availability ? '✅ Available' : '❌ Not Available'}
                </div>
                <div className="text-sm text-gray-600">
                  {loading ? 'Checking availability...' : 
                   `Total: $${calculateTotal().toFixed(2)}`}
                </div>
              </div>
              
              {availability && (
                <button
                  onClick={() => onDateSelect(selectedDate)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Calendar */}
      <div className="mb-4">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          selectRange={true}
          tileClassName={tileClassName}
          tileDisabled={tileDisabled}
          minDate={new Date()}
          className="border-0 w-full"
        />
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 rounded"></div>
          <span>Selected Dates</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 rounded"></div>
          <span>Booked/Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Check-in/Check-out</span>
        </div>
      </div>
      
      {/* Instant Booking Notice */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600">⚡</span>
          <span className="font-medium">Instant Booking Available</span>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          Book this property instantly without waiting for owner approval.
          Confirmation is immediate.
        </p>
      </div>
    </div>
  );
};

export default BookingCalendar;