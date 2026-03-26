import { useState } from "react";
import "./Login.css";

function formatApiError(detail) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => (typeof e === "object" && e?.msg ? e.msg : String(e))).join(" ");
  }
  return "Something went wrong";
}

/**
 * Sign in or create an account; parent stores the JWT from /api/login.
 */
export function Login(props) {
  const [mode, setMode] = useState("login"); /*login or register*/
  const [username, setUsername] = useState(""); /*username input*/
  const [password, setPassword] = useState(""); /*password input*/
  const [error, setError] = useState(null); /*error message*/
  const [busy, setBusy] = useState(false); /*true if the user is submitting the form*/

  async function submitLogin() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`${props.apiBase}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.detail != null ? formatApiError(data.detail) : "Login failed");
        return;
      }
      props.onLoggedIn(data.access_token);
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  async function submitRegister() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`${props.apiBase}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.detail != null ? formatApiError(data.detail) : "Registration failed");
        return;
      }
      /*Auto-login after registration*/
      const loginRes = await fetch(`${props.apiBase}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const loginData = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok) {
        setError(
          loginData.detail != null ? formatApiError(loginData.detail) : "Account created but login failed",
        );
        return;
      }
      props.onLoggedIn(loginData.access_token);
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    if (mode === "register") void submitRegister(); /*void means the function returns a promise but we dont use it*/
    else void submitLogin();
  }

  return (
    <div className="login">
      <div className="login__card">
        <h1 className="login__title">Notes</h1>
        <p className="login__subtitle">Sign in to continue</p>
        <form className="login__form" onSubmit={handleSubmit}>
          <label className="login__label">
            Username
            <input
              className="login__input"
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={busy}
            />
          </label>
          <label className="login__label">
            Password
            <input
              className="login__input"
              type="password"
              name="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </label>
          {error ? <p className="login__error">{error}</p> : null}
          <div className="login__actions">
            <button type="submit" className="login__btn login__btn--primary" disabled={busy}>
              {mode === "register" ? "Create account" : "Log in"}
            </button>
            <button
              type="button"
              className="login__btn login__btn--secondary"
              disabled={busy}
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
            >
              {mode === "login" ? "Create an account" : "Back to log in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
