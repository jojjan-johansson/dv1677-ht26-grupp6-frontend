import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext.jsx";

export default function BookingComments({ bookingId, resourceId }) {
  const { token, user } = useAuth();

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_URL || "";

  // Hämta kommentarer från backend
  const loadComments = useCallback(async () => {
    if (!token || !bookingId) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/comments/booking/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Kunde inte hämta kommentarer.");
      }

      const data = await response.json();

      setComments(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, bookingId, baseUrl]);

  // Hämta kommentarer när komponenten öppnas
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Socket.io: uppdatera kommentarer i realtid
  useEffect(() => {
    if (!token || !resourceId) return;

    const socketUrl =
      import.meta.env.VITE_API_URL || window.location.origin;

    const socket = io(socketUrl);

    const handleCommentChange = (eventData) => {
      // Uppdatera bara kommentarer för aktuell bokning
      if (
        eventData?.booking_id &&
        String(eventData.booking_id) !== String(bookingId)
      ) {
        return;
      }

      loadComments();
    };

    socket.on("connect", () => {
      socket.emit("join", `resource:${resourceId}`);
    });

    socket.on("comment:created", handleCommentChange);
    socket.on("comment:updated", handleCommentChange);
    socket.on("comment:deleted", handleCommentChange);

    return () => {
      socket.off("connect");
      socket.off("comment:created", handleCommentChange);
      socket.off("comment:updated", handleCommentChange);
      socket.off("comment:deleted", handleCommentChange);

      socket.disconnect();
    };
  }, [token, resourceId, bookingId, loadComments]);

  // Skapa en ny kommentar
  const createComment = async (event) => {
    event.preventDefault();

    if (!text.trim()) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${baseUrl}/api/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            booking_id: bookingId,
            text: text.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error("Kunde inte spara kommentaren.");
      }

      setText("");
      await loadComments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Starta redigering
  const startEditing = (comment) => {
    setEditingId(comment._id);
    setEditingText(comment.text);
    setError("");
  };

  // Avbryt redigering
  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  // Spara ändrad kommentar
  const saveEditing = async (commentId) => {
    if (!editingText.trim()) {
      setError("Kommentaren får inte vara tom.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${baseUrl}/api/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            text: editingText.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error("Kunde inte ändra kommentaren.");
      }

      setEditingId(null);
      setEditingText("");

      await loadComments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Radera kommentar
  const deleteComment = async (commentId) => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${baseUrl}/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Kunde inte radera kommentaren.");
      }

      await loadComments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Kontrollera om användaren får ändra kommentaren
  const canManageComment = (comment) => {
    const authorId =
      typeof comment.author === "object"
        ? comment.author?._id
        : comment.author;

    return (
      user?.role === "admin" ||
      String(authorId) === String(user?._id)
    );
  };

  // Formatera datum
  const formatDate = (dateValue) => {
    return new Date(dateValue).toLocaleString("sv-SE");
  };

  return (
    <section className="booking-comments">
      <h4>Kommentarer</h4>

      {error && (
        <p role="alert">{error}</p>
      )}

      {loading ? (
        <p>Laddar kommentarer...</p>
      ) : comments.length === 0 ? (
        <p>Inga kommentarer ännu.</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="comment"
            >
              {editingId === comment._id ? (
                <div>
                  <textarea
                    value={editingText}
                    onChange={(event) =>
                      setEditingText(event.target.value)
                    }
                    maxLength={2000}
                    aria-label="Redigera kommentar"
                  />

                  <button
                    type="button"
                    className="btn"
                    disabled={saving}
                    onClick={() =>
                      saveEditing(comment._id)
                    }
                  >
                    Spara
                  </button>

                  <button
                    type="button"
                    className="btn"
                    disabled={saving}
                    onClick={cancelEditing}
                  >
                    Avbryt
                  </button>
                </div>
              ) : (
                <div>
                  <p>{comment.text}</p>

                  <small>
                    {formatDate(comment.created_at)}
                  </small>

                  {comment.updated_at && (
                    <small> (redigerad)</small>
                  )}

                  {canManageComment(comment) && (
                    <div className="comment-actions">
                      <button
                        type="button"
                        className="btn"
                        disabled={saving}
                        onClick={() =>
                          startEditing(comment)
                        }
                      >
                        Redigera
                      </button>

                      <button
                        type="button"
                        className="btn"
                        disabled={saving}
                        onClick={() =>
                          deleteComment(comment._id)
                        }
                      >
                        Ta bort kommentar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={createComment}>
        <label htmlFor={`comment-${bookingId}`}>
          Skriv en kommentar
        </label>

        <textarea
          id={`comment-${bookingId}`}
          value={text}
          onChange={(event) =>
            setText(event.target.value)
          }
          maxLength={2000}
          required
        />

        <button
          type="submit"
          className="btn"
          disabled={saving || !text.trim()}
        >
          {saving ? "Sparar..." : "Skicka kommentar"}
        </button>
      </form>
    </section>
  );
}