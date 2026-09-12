import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, useAuth } from "../auth/useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setBusy(true);
    try {
      await register(email, username, password);
      navigate("/simulador", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al crear la cuenta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card">
      <h1>Alta en laboratorio</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Usuario
          <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? "Creando…" : "Crear cuenta"}
        </button>
      </form>
      <p className="muted">
        ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
      </p>
    </section>
  );
}