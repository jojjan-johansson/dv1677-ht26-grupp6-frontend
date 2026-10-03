import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Recource() {
  const [resource, setResource] = useState({});
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookedBy, setBookedBy] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  const resourceId = window.sessionStorage.getItem("resource_id");
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const loadBookings = () => {
    return fetch(`${apiUrl}/api/bookings/resource/${resourceId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kunde inte hämta bokningarna");
        }

        return response.json();
      })
      .then((data) => {
        setBookings(data);
      });
  };

  useEffect(() => {
    fetch(`${apiUrl}/api/resources/${resourceId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kunde inte hämta resursen");
        }

        return response.json();
      })
      .then((data) => {
        setResource(data);
      })
      .catch((error) => {
        setError(error.message);
      });

    loadBookings().catch((error) => {
      setError(error.message);
    });

    fetch(`${apiUrl}/api/users`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kunde inte hämta användare");
        }

        return response.json();
      })
      .then((data) => {
        setUsers(data);

        if (data.length > 0) {
          setBookedBy(data[0]._id);
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  const getUserEmail = (userId) => {
    const user = users.find((user) => user._id === userId);
    return user ? user.email : userId;
  };

  const createBooking = async (event) => {
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

    try {
      const response = await fetch(`${apiUrl}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resource_id: resourceId,
          booked_by: bookedBy,
          start_time: startTime,
          end_time: endTime
        })
      });

      if (!response.ok) {
        throw new Error("Kunde inte skapa bokningen");
      }

      setStartTime("");
      setEndTime("");

      await loadBookings();
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteBooking = async (bookingId) => {
    setError("");

    try {
      const response = await fetch(
        `${apiUrl}/api/bookings/${bookingId}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Kunde inte ta bort bokningen");
      }

      await loadBookings();
    } catch (error) {
      setError(error.message);
    }
  };

  const backToResources = () => {
    navigate("/");
  };

  return (
    <main className="main" id="main">
      <button
        type="button"
        className="btn"
        onClick={backToResources}
      >
        ← Tillbaka till resurser
      </button>

      <h2>{resource.name}</h2>

      <p>
        {resource.type} — {resource.description}
      </p>

      <p>Kapacitet: {resource.capacity}</p>

      {error && <p>{error}</p>}

      <h3>Bokningar</h3>

      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <div key={booking._id} className="booking-card">
            <p>
              <strong>{getUserEmail(booking.booked_by)}</strong>
            </p>

            <p>
              {booking.start_time} - {booking.end_time}
            </p>

            <p className="status">{booking.status}</p>

            <button
              type="button"
              className="btn"
              onClick={() => deleteBooking(booking._id)}
            >
              Ta bort bokning
            </button>
          </div>
        ))
      ) : (
        <p>Inga bokningar för denna resurs.</p>
      )}

      <h3>Ny bokning</h3>

      <form className="booking-form" onSubmit={createBooking}>
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
          Boka
        </button>
      </form>
    </main>
  );
}