import { useState, useCallback, useEffect } from "react";
import "./App.css";
import { Sidebar } from "./components/Sidebar";
import { NotesMainArea } from "./components/NotesMainArea";
import { Login } from "./components/Login";
import { authHeaders } from "./utils";
/**
 * In dev, use same origin + Vite proxy (see vite.config.js) so /api → FastAPI without CORS issues.
 * Override with VITE_API_BASE if the API is on another host (e.g. production).
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

const TOKEN_STORAGE_KEY = "auth_access_token";



/**
 * Root layout: sidebar (groups) + main column (notes for the selected group).
 */
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [selectedGroup, setSelectedGroup] = useState(null); /*{ id, name } or null*/
  const [groups, setGroups] = useState([]);
  const [groupsStatus, setGroupsStatus] = useState("idle");

  function handleLoggedIn(accessToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setToken(accessToken);
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setSelectedGroup(null);
    setGroups([]);
    setGroupsStatus("idle");
  }, []);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function load() {
      setGroupsStatus("loading");
      try {
        const res = await fetch(`${API_BASE}/api/groups`, { headers: authHeaders(token) });
        if (res.status === 401) {
          handleLogout();
          return;
        }
        if (!res.ok) throw new Error("Failed to load groups");
        const data = await res.json();
        if (!cancelled) {
          setGroups(data);
          setGroupsStatus("idle");
        }
      } catch {
        if (!cancelled) setGroupsStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [API_BASE, token, handleLogout]);

  const handleGroupCreated = useCallback((created) => {
    setGroups((prev) => [created, ...prev]);
    setSelectedGroup({ id: created.id, name: created.name });
  }, []);

  /** After a note is saved successfully, show that group first (most recently used). */
  const bumpGroupToTop = useCallback((groupId) => {
    if (groupId == null) return;
    const needle = Number(groupId);
    if (Number.isNaN(needle)) return;
    setGroups((prev) => {
      const i = prev.findIndex((g) => Number(g.id) === needle);
      if (i < 0) return prev;
      if (i === 0) return prev;
      const g = prev[i];
      return [g, ...prev.slice(0, i), ...prev.slice(i + 1)];
    });
  }, []);

  if (!token) {
    return <Login apiBase={API_BASE} onLoggedIn={handleLoggedIn} />;
  }

  return (
    <div className="app">
      <Sidebar
        apiBase={API_BASE}
        token={token}
        onLogout={handleLogout}
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
        groups={groups}
        groupsStatus={groupsStatus}
        onGroupCreated={handleGroupCreated}
      />
      <div className="app__main">
        <NotesMainArea
          selectedGroup={selectedGroup}
          apiBase={API_BASE}
          token={token}
          onLogout={handleLogout}
          onAddNoteToGroup={bumpGroupToTop}
        />
      </div>
    </div>
  );
}
