// src/pages/PaymentStatus.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const AdminPaymentStatus = () => {
  const { bookingId } = useParams();
  const [status, setStatus] = useState({ loading: true });

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/booking/payment/verify/${bookingId}`
        );
        setStatus({ loading: false, data: res.data });
      } catch (err) {
        setStatus({ loading: false, error: err.response?.data?.message || "Verification failed" });
      }
    };

    verify();
  }, [bookingId]);

  if (status.loading) return <h3 style={{ textAlign: "center", marginTop: 50 }}>Verifying payment...</h3>;

  if (status.error) return (
    <div style={{ textAlign: "center", marginTop: 50, color: "red" }}>{status.error}</div>
  );

  const { booking, message, success } = status.data;

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h2>Payment Status</h2>
      <div
        style={{
          marginTop: 20,
          padding: 20,
          fontSize: 20,
          fontWeight: "bold",
          color: success ? "green" : "red",
          border: `2px solid ${success ? "green" : "red"}`,
          display: "inline-block",
          borderRadius: 10,
          textAlign: "left"
        }}
      >
        <p><b>Status:</b> {booking.payment_status}</p>
        <p><b>Tenant Name:</b> {booking.tenant_name}</p>
        <p><b>Email:</b> {booking.tenant_email}</p>
        <p><b>Phone:</b> {booking.tenant_phone}</p>
        <p><b>Amount:</b> Rs. {booking.amount}</p>
        <p><b>Booking Dates:</b> {booking.start_date} to {booking.end_date}</p>
        <p><b>Message:</b> {message}</p>
      </div>
    </div>
  );
};

export default AdminPaymentStatus;
