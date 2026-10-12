import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBooking, editBooking } from "../api/bookings";
import { getUsers } from "../api/users";
import { useAuth } from '../context/AuthContext.jsx'

export default function EditBooking() {
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookedBy, setBookedBy] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const bookingId = window.sessionStorage.getItem("booking_id");
  const resourceId = window.sessionStorage.getItem("resource_id");

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      console.error('Ogiltigt datum:', dateString);
      return '';
    }

    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset)
      .toISOString()
      .slice(0, 16);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const bookingData = await getBooking(token, bookingId);
        if (!isMounted) return;
        setBooking(bookingData);

        setStartTime(formatDateTimeLocal(bookingData.start_time));
        setEndTime(formatDateTimeLocal(bookingData.end_time));

        const usersData = await getUsers();
        if (!isMounted) return;
        setUsers(usersData);

        if (user?.role === 'admin' && usersData.length > 0) {
          setBookedBy(bookingData.booked_by);
        } else if (user?._id) {
          setBookedBy(user._id);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (token && bookingId) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [token, bookingId, user?._id, user?.role]);
  

  const editABooking = async (event) => {
    event.preventDefault();
    setError("");
    
    if (!bookedBy || !startTime || !endTime) {
      setError("Fyll i alla fält.");
      return;
    }
    
    if (new Date(endTime) <= new Date(startTime)) {
      setError("Sluttiden måste vara efter starttiden.");
      return;
    }
    setLoading(true)

    try {

      const data = {
          resource_id: resourceId,
          booked_by: bookedBy,
          start_time: startTime,
          end_time: endTime,
          status: 'confirmed'
        }
      await editBooking(token, bookingId, data)

      navigate(`/resource/`, { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false)
    }
  };


  return (
    <main className="main" id="main">

      <h3>Ändra bokning</h3>

      {error && <p className="error-message">{error}</p>}

      <form className="booking-form" onSubmit={editABooking}>

        {user.role === 'admin' ? (
          <>
            <label htmlFor="booked_by">Användare</label>

            <select
              id="booked_by"
              value={bookedBy}
              onChange={(event) => setBookedBy(event.target.value)}
              required
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.email}
                </option>
              ))}
            </select>
          </>)
        : null
        }

        <label htmlFor="start_time">Starttid</label>

        <input
          id="start_time"
          type="datetime-local"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
          required
        />

        <label htmlFor="end_time">Sluttid</label>

        <input
          id="end_time"
          type="datetime-local"
          value={endTime}
          onChange={(event) => setEndTime(event.target.value)}
          required
        />

        <button type="submit" className="btn">
          Ändra bokning
        </button>
      </form>
    </main>
  );
}