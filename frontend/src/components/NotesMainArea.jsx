import { Fragment, useEffect, useLayoutEffect, useState, useRef } from "react";
import "./NotesMainArea.css";
import { NoteInput } from "./NoteInput";
import { authHeaders, formatNoteTime, isSameDay, formatDateSeparator } from "../utils";



export function NotesMainArea(props) {
  const theSelectedGroup = props.selectedGroup; /*{ id, name } or null*/
  const [notes, setNotes] = useState([]);
  const [loadStatus, setLoadStatus] = useState("idle");
  const [isSaving, setIsSaving] = useState(false);
  const scrollBodyRef = useRef(null);

  useEffect(() => {
    if (!theSelectedGroup || !props.token) {
      setNotes([]);
      setLoadStatus("idle");
      return;
    }

    let cancelled = false;
    const groupId = theSelectedGroup.id;

    setNotes([]);
    async function loadNotes() {
      setLoadStatus("loading");
      try {
        const res = await fetch(
          `${props.apiBase}/api/groups/${groupId}/notes`,
          { headers: authHeaders(props.token) }
        );
        if (res.status === 401) {
          props.onLogout?.();
          return;
        }
        if (!res.ok) throw new Error("Failed to load notes");
        const data = await res.json();
        if (!cancelled) {
          /* API returns newest-first; WhatsApp shows oldest at top. */
          setNotes([...data].reverse());
          setLoadStatus("idle");
        }
      } catch {
        if (!cancelled) setLoadStatus("error");
      }
    }

    loadNotes();
    return () => {
      cancelled = true;
    };
  }, [theSelectedGroup?.id, props.apiBase, props.token, props.onLogout]);

  /* Pin scroll to bottom when notes load or a new note is appended (WhatsApp-style). */
  useLayoutEffect(() => {
    const el = scrollBodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [notes, loadStatus, theSelectedGroup?.id]);

  async function handleAddNote(text) {
    const content = text.trim();
    if (!content || !theSelectedGroup || !props.token) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${props.apiBase}/api/groups/${theSelectedGroup.id}/notes`, {
        method: "POST",
        headers: authHeaders(props.token),
        body: JSON.stringify({ content }),
      });
      if (res.status === 401) {
        props.onLogout?.();
        return;
      }
      if (!res.ok) throw new Error("Failed to save note");
      const created = await res.json();
      setNotes((prev) => [...prev, created]);
      props.onAddNoteToGroup?.(created.group_id ?? theSelectedGroup.id);
    } catch {
      /* Keep UI simple: failed save is silent here; could add toast later. */
    } finally {
      setIsSaving(false);
    }
  }

  if (!theSelectedGroup) {
    return (
      <main className="group-notes">
        <header className="group-notes__header">Notes</header>
        <div className="group-notes__body group-notes__body--static">
          <p className="group-notes__hint">Select a group in the sidebar to open it here.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="group-notes">
      <header className="group-notes__header">{theSelectedGroup.name}</header>
      <div className="group-notes__body" ref={scrollBodyRef}>
        {loadStatus === "loading" ? (
          <p className="group-notes__hint">Loading notes…</p>
        ) : null}
        {loadStatus === "error" ? (
          <p className="group-notes__hint group-notes__hint--error">
            Could not load notes. Try another group or refresh.
          </p>
        ) : null}
        {loadStatus === "idle" && notes.length === 0 ? (
          <p className="group-notes__hint">No notes yet. Add one below.</p>
        ) : null}
        {notes.length > 0 ? (
          <ul className="group-notes__list">
            {notes.map((n, i) => {
              const showDateSep =
                i === 0 || !isSameDay(notes[i - 1].created_at, n.created_at);
              return (
                <Fragment key={n.id}>
                  {showDateSep ? (
                    <li className="group-notes__date-row">
                      <span className="group-notes__date-label">
                        {formatDateSeparator(n.created_at)}
                      </span>
                    </li>
                  ) : null}
                  <li className="group-notes__row">
                    <div className="group-notes__bubble">
                      <p className="group-notes__text">{n.content}</p>
                      <time className="group-notes__time" dateTime={n.created_at}>
                        {formatNoteTime(n.created_at)}
                      </time>
                    </div>
                  </li>
                </Fragment>
              );
            })}
          </ul>
        ) : null}
      </div>
      <NoteInput
        onSend={handleAddNote}
        placeholder="Write a note…"
        disabled={isSaving}
      />
    </main>
  );
}
