import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from '../api/auth.js'


export default function Login() {
  const [ userEmail, setUserEmail ] = useState("")
  const [ userPassword, setUserPassword ] = useState("")
  const navigate = useNavigate()


  const registerLink = () => {
    navigate("/register", { replace: true });
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
      const data = await apiLogin(userEmail, userPassword)
      login(data.user, data.token)

      if (!response.ok) {
        throw new Error("Kunde inte logga in");
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
      <h3>Logga in</h3>
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
          Logga in
        </button>

      </form>
      <br />
      <p>
        Inget konto?
      </p>
      <button onClick={registerLink} className="btn blue">Registrera dig</button>
    </main>
  );
}
