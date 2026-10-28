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
            <p>Typ: {resource.type ?? "Ej angivet"}</p>

            <p>{resource.description}</p>

            <p>Provider: {resource.provider ?? "Ej angivet"}</p>

            <p>{resource.active ? "Aktiv" : "Oaktiv"}</p>

            <p>Kapacitet:</p>

            <p>
              vCPU: {resource.capacity?.vcpus ?? "Ej angivet"}
            </p>

            <p>
              RAM: {resource.capacity?.ramMb ?? "Ej angivet"} MB
            </p>

            {resource.provider === "proxmox" && (
              <p>
                Disk: {resource.capacity?.diskGb ?? "Ej angivet"} GB
              </p>
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