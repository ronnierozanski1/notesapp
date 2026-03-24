import { useEffect, useState } from "react";
import "./Sidebar.css";

function authHeaders(token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Left column: list of groups (chats). */
export function Sidebar({ apiBase, token, onLogout }) {
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(`${apiBase}/api/groups`, { headers: authHeaders(token) });
        if (res.status === 401) {
          onLogout?.();
          return;
        }
        if (!res.ok) throw new Error("Failed to load groups");
        const data = await res.json();
        if (!cancelled) {
          setGroups(data);
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [apiBase, token, onLogout]);

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <span className="sidebar__title">Groups</span>
        {onLogout ? (
          <button type="button" className="sidebar__logout" onClick={onLogout}>
            Log out
          </button>
        ) : null}
      </header>
      <div className="sidebar__body">
        {status === "loading" ? <p className="sidebar__hint">Loading…</p> : null}
        {status === "error" ? (
          <p className="sidebar__hint sidebar__hint--error">Could not load groups.</p>
        ) : null}
        {status === "idle" && groups.length === 0 ? (
          <p className="sidebar__hint">No groups yet.</p>
        ) : null}
        {groups.length > 0 ? (
          <ul className="sidebar__list">
            {groups.map((g) => (
              <li key={g.id} className="sidebar__item">
                {g.name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </aside>
  );
}
