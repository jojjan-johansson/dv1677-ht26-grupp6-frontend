import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register as apiRegister } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'


export default function RegisterPage() {
  const [ userEmail, setUserEmail ] = useState("")
  const [ userPassword, setUserPassword ] = useState("")
  const navigate = useNavigate()

  const loginLink = () => {
    navigate("/login", { replace: true });
  };
  
  const login = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true)

    // localStorage.setItem('token', data.token)

    if (!userEmail || !userPassword) {
      setError("Fyll i alla fält.");
      return;
    }

    try {
      const data = await apiRegister(userEmail, userPassword)
      register(data.user, data.token)

      if (!response.ok) {
        throw new Error("Kunde inte regristrera dig");
      }
      navigate('/')
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false)
    }
  };

  return (
    <main className="main" id="main">
      <h3>Regristrering</h3>
      <form className="login-form" onSubmit={login}>

        <label htmlFor="user_name">Email</label>

        <input
          id="user_name"
          type="email"
          // value={startTime}
          onChange={(event) => setUserEmail(event.target.value)}
          required
        />

        <label htmlFor="user_password">Lösenord</label>

        <input
          id="user_password"
          type="text"
          // value={endTime}
          onChange={(event) => setUserPassword(event.target.value)}
          required
        />

        <button type="submit" className="btn">
          Regristrera dig!
        </button>

      </form>

      <br />
      <p>
        Har du redan ett konto?
      </p>
      <button onClick={loginLink} className="btn blue">Logga in</button>
    </main>
  );
}