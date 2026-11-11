import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getResources } from "../api/resources.js";

export default function Homepage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  window.sessionStorage.clear();

  const navigate = useNavigate();

  const resourceHandle = (id) => {
    window.sessionStorage.setItem("resource_id", id);
    navigate("/resource/", { replace: true });
  };

  useEffect(() => {
    getResources()
      .then(setResources)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="main" id="main">
      <h2>Resurser</h2>

      {error && <p>{error}</p>}

      {resources.map((resource) => (
        <div key={resource._id} className="resource-card">
          <h3>{resource.name}</h3>

          <div className="resource-meta">
            <p>Provider: {resource.provider}</p>
            <p>Status: {resource.active ? ("Aktiv") : ("Oaktiv")}</p>
            <p>Kapacitet:</p>
            <p>vcpus: {Math.round(resource.capacity?.vcpus)}</p>
            <p>ramMb: {Math.round(resource.capacity?.ramMb)}</p>
            {resource.provider === "proxmox" && (
              <p>diskGb: {Math.round(resource.capacity?.diskGb)}</p>
            )}
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => resourceHandle(resource._id)}
          >
            Visa / boka
          </button>
        </div>
      ))}
    </main>
  );
}