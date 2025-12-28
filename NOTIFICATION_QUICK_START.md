# 🚀 Quick Start: How to Add Notifications to Your Pages

## Example 1: Booking Confirmation

```jsx
import { useNotifications } from '@/hooks/useNotification';
import { useToast } from '@/hooks/useNotification';

function BookingConfirmation() {
  const { addNotification } = useNotifications();
  const toast = useToast();

  const handleConfirmBooking = async () => {
    try {
      // Call your API to confirm booking
      const response = await api.confirmBooking(bookingId);
      
      // Add notification with sound + bell icon
      addNotification({
        message: '✅ Booking confirmed successfully',
        type: 'booking',
        description: `Your booking for ${property.name} has been confirmed`,
        relatedId: bookingId,
      });
      
      // Also show toast (optional, addNotification does this automatically)
      toast.success('Booking confirmed!');
      
    } catch (error) {
      toast.error('Failed to confirm booking');
    }
  };

  return (
    <button onClick={handleConfirmBooking}>
      Confirm Booking
    </button>
  );
}
```

---

## Example 2: Payment Success

```jsx
function PaymentPage() {
  const { addNotification } = useNotifications();

  const handlePaymentSuccess = (paymentDetails) => {
    addNotification({
      message: '💰 Payment received',
      type: 'payment',
      description: `Payment of Rs. ${paymentDetails.amount} received successfully`,
      relatedId: paymentDetails.paymentId,
    });
    
    // Show success message
    toast.success('Payment processed!');
  };

  return (
    <div>
      {/* Payment form */}
    </div>
  );
}
```

---

## Example 3: Payment Reminder

```jsx
function AdminPaymentReminder() {
  const { addNotification } = useNotifications();

  const sendReminder = (userId, dueDate) => {
    addNotification({
      message: '⏰ Reminder: Payment pending',
      type: 'reminder',
      description: `Your payment is due on ${dueDate}`,
      relatedId: userId,
    });
  };

  return (
    <button onClick={() => sendReminder(userId, '2025-12-30')}>
      Send Payment Reminder
    </button>
  );
}
```

---

## Example 4: Admin Broadcast

```jsx
function AdminBroadcast() {
  const { addNotification } = useNotifications();

  const sendSystemNotice = () => {
    addNotification({
      message: '📢 System maintenance at 10 PM',
      type: 'admin',
      description: 'The system will be under maintenance for 2 hours',
    });
  };

  return (
    <button onClick={sendSystemNotice}>
      Send System Notification
    </button>
  );
}
```

---

## Example 5: Multiple Notifications

```jsx
function TestMultipleNotifications() {
  const { addNotification } = useNotifications();

  const notificationSequence = [
    { message: '✅ Booking confirmed', type: 'booking', delay: 0 },
    { message: '💰 Payment received', type: 'payment', delay: 2000 },
    { message: '📧 Confirmation email sent', type: 'success', delay: 4000 },
    { message: '⏰ Check-in reminder: Tomorrow at 4 PM', type: 'reminder', delay: 6000 },
  ];

  const triggerSequence = () => {
    notificationSequence.forEach((notif) => {
      setTimeout(() => {
        addNotification({
          message: notif.message,
          type: notif.type,
        });
      }, notif.delay);
    });
  };

  return (
    <button onClick={triggerSequence}>
      Test Sequence
    </button>
  );
}
```

---

## Notification Object Structure

```javascript
{
  // Required
  message: string,      // Main notification text
  type: string,         // 'success' | 'error' | 'warning' | 'info' | 
                        // 'booking' | 'payment' | 'reminder' | 'admin'
  
  // Optional
  description: string,  // Additional details shown in notification panel
  relatedId: string,    // ID of related entity (booking, payment, etc)
  userId: string,       // If sending to specific user
  broadcast: boolean,   // If true, send to all users (admin only)
}
```

---

## API Integration Points

When you confirm a booking in the backend:

```javascript
// Backend: Node.js/Express
router.post('/bookings/:id/confirm', async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, {
    status: 'confirmed'
  });

  // Create notification record
  const notification = await Notification.create({
    userId: booking.tenantId,
    message: '✅ Booking confirmed successfully',
    type: 'booking',
    description: `Your booking for ${booking.propertyName}`,
    relatedId: booking.id,
  });

  // Emit to client via EventSource
  io.to(booking.tenantId).emit('notification', notification);

  res.json(booking);
});
```

The frontend will automatically:
- Show ✅ toast notification
- Update bell icon count (+1)
- Add to notification panel
- Play sound (if enabled)
- Send mobile push (if Firebase configured)

---

## All Notification Types and Icons

| Type | Icon | Use Case |
|------|------|----------|
| `booking` | ✅ | Booking confirmed/approved |
| `payment` | 💰 | Payment received/processed |
| `reminder` | ⏰ | Upcoming deadline/reminder |
| `admin` | 📢 | System announcement |
| `success` | ✅ | General success |
| `error` | ❌ | Error occurred |
| `warning` | ⚠️ | Warning message |
| `info` | ℹ️ | Information |

---

## Quick Copy-Paste Template

```jsx
import { useNotifications } from '@/hooks/useNotification';
import { useToast } from '@/hooks/useNotification';

function MyComponent() {
  const { addNotification } = useNotifications();
  const toast = useToast();

  const handleAction = async () => {
    try {
      // Do something
      
      // Show notification
      addNotification({
        message: '✅ Action completed',
        type: 'success',
        description: 'Details here',
      });
      
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <button onClick={handleAction}>Click Me</button>
  );
}

export default MyComponent;
```

---

## Testing the System

1. Add NotificationDemo to a test page:
```jsx
import NotificationDemo from '@/components/NotificationDemo';

function TestPage() {
  return <NotificationDemo />;
}
```

2. Visit the test page and click buttons to see:
   - Toast notifications
   - Bell icon updates
   - Notification panel
   - Sound playing
   - Real-time updates

3. Check browser console for any errors

---

## That's It! 🎉

You now have a complete, production-ready notification system!

✅ Toast popups
✅ Bell icon with count
✅ Notification panel with filtering
✅ Sound notifications
✅ Real-time updates
✅ Mobile push ready
✅ All 8 notification types
✅ Auto-dismiss toasts
✅ Unread highlighting
✅ Delete notifications
✅ Mark as read
✅ Time ago display
✅ 7/15/30 day filtering

Just add `addNotification()` to your backend callbacks and you're done!
