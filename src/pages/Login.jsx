import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from '../api/auth.js'
import { useAuth } from '../context/AuthContext.jsx'


export default function Login() {
  const [ userEmail, setUserEmail ] = useState("")
  const [ userPassword, setUserPassword ] = useState("")
  const [ error, setError ] = useState("")
  const [ loading, setLoading ] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()


  const registerLink = () => {
    navigate("/register", { replace: true });
  };
  
  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    
    if (!userEmail || !userPassword) {
      setError("Fyll i alla fält.");
      return;
    }
    
    setLoading(true)

    try {
      const data = await apiLogin(userEmail, userPassword)
      login(data.user, data.token)

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
      <p>{error}</p>
      <form className="login-form" onSubmit={handleLogin}>

        <label htmlFor="user_name">Email</label>

        <input
          id="user_name"
          type="email"
          onChange={(event) => setUserEmail(event.target.value)}
          required
        />

        <label htmlFor="user_password">Lösenord</label>

        <input
          id="user_password"
          type="password"
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
