import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError, useAuth } from "../auth/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname ?? "/simulador", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al iniciar sesión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card">
      <h1>Entrar al laboratorio</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? "Verificando…" : "Entrar"}
        </button>
      </form>
      <p className="muted">
        ¿Sin cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </section>
  );
}