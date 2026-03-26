import { useState, useEffect, useRef, useCallback } from "react";
import "./AddGroupBtn.css";
import { authHeaders } from "../utils";

/**
 * Small "Add group" control in the header; opens a modal to name and create a group.
 * Parent updates the list via onCreated.
 */
export function AddGroupBtn(props) {
  const [open, setOpen] = useState(false); /*add group window open or closed*/
  const [newGroupName, setNewGroupName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const inputRef = useRef(null); /*for focus on the input when the window is opened - puts the cursor in the input*/

  function closeWindow() {
    setOpen(false);
    setAddError(null);
    setNewGroupName("");
  }

  useEffect(() => { 
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  async function handleSubmit(event) {
    event.preventDefault();
    const name = newGroupName.trim();
    if (!name) return;

    setIsAdding(true);
    setAddError(null);
    try {
      const res = await fetch(`${props.apiBase}/api/groups`, {
        method: "POST",
        headers: authHeaders(props.token),
        body: JSON.stringify({ name }),
      });
      if (res.status === 401) { /*401 Unauthorized - invalid or missing token*/
        closeWindow();
        props.onLogout?.();
        return;
      }
      if (!res.ok) {
        setAddError("Could not create group. Try a different name or check the server.");
        return;
      }
      const created = await res.json();
      props.onCreated?.(created);
      closeWindow();
    } catch {
      setAddError("Network error. Is the backend running?");
    } finally {
      setIsAdding(false);
    }
  }

  const formDisabled = props.disabled || isAdding; /*props.disable - true id status == loading - we dont want buttun to be pressed while loading*/

  return (
    <>
      <button
        type="button"
        className="add-group__trigger"
        disabled={props.disabled}
        onClick={() => setOpen(true)}
      >
        Add group
      </button>

      {open ? (
        <div
          className="add-group-modal__backdrop"
          onClick={closeWindow}
        >
          <div
            className="add-group-modal"
            aria-modal="true"
            aria-labelledby="add-group-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="add-group-modal__head">
              <h2 id="add-group-modal-title" className="add-group-modal__title">
                New group
              </h2>
              <button
                type="button"
                className="add-group-modal__icon-close"
                onClick={closeWindow}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="add-group-modal__form" onSubmit={handleSubmit}>
              <label className="add-group-modal__label" htmlFor="add-group-name-input">
                Name
              </label>
              <input
                ref={inputRef}
                id="add-group-name-input"
                className="add-group-modal__input"
                type="text"
                placeholder="Group name…"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                disabled={formDisabled}
                autoComplete="off"
              />
              {addError ? (
                <p className="add-group-modal__error" role="alert">
                  {addError}
                </p>
              ) : null}
              <div className="add-group-modal__actions">
                <button
                  type="submit"
                  className="add-group-modal__btn add-group-modal__btn--primary"
                  disabled={formDisabled}
                >
                  {isAdding ? "Adding…" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
