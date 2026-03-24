import { useState, useCallback } from "react";
import "./App.css";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { MessageInput } from "./components/MessageInput";
import { Login } from "./components/Login";

/**
 * In dev, use same origin + Vite proxy (see vite.config.js) so /api → FastAPI without CORS issues.
 * Override with VITE_API_BASE if the API is on another host (e.g. production).
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const TOKEN_STORAGE_KEY = "auth_access_token";


function authHeaders(token) { /*add token to the headers if it exists*/
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Root layout: sidebar (groups) + main column (chat + input).
 * We will add state and API calls in later steps.
 */
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  /** Each item: who sent it + text (for the list in ChatArea). */
  const [messages, setMessages] = useState([]);

  function handleLoggedIn(accessToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setToken(accessToken);
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setMessages([]);
  }, []);

  async function handleSend(text) {
    /* just a demo of how to send a message to the server - change later*/
    const trimmed = text.trim();
    if (!trimmed) return; /*if the user typed nothing meaningfully, do nothing*/

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: trimmed }]);

    try {
      const res = await fetch(`${API_BASE}/api/groups`, { headers: authHeaders(token) }); /*res is http response object from the browser*/
      if (res.status === 401) { /*401 Unauthorized - invalid or missing token*/
        handleLogout();
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "server", text: "Session expired. Please log in again." },
        ]);
        return;
      }
      if (!res.ok) throw new Error("Bad response"); /* res.ok true if http code is 200-299, throw new error so the catch block runs */
      const groups = await res.json(); /* reads the body from the httpresponse and converts json string to javascript object */
      const summary =
        groups.length === 0
          ? "No groups yet."
          : `Groups (${groups.length}): ${groups.map((g) => g.name).join(", ")}`;
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "server", text: summary }]);
    } catch {
    }

    try {
      const res = await fetch(`${API_BASE}/api/echo`, { /*res is response object from the browser*/
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) throw new Error("Bad response");
      const data = await res.json();
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "server", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "server", text: "Could not reach the server. Is the backend running?" },
      ]);
    }
  }

  if (!token) {
    return <Login apiBase={API_BASE} onLoggedIn={handleLoggedIn} />;
  }

  return (
    <div className="app">
      <Sidebar apiBase={API_BASE} token={token} onLogout={handleLogout} />
      <div className="app__main">
        <ChatArea messages={messages} />
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
