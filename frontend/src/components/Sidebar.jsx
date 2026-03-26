import "./Sidebar.css";
import { AddGroupBtn } from "./AddGroupBtn";

/** Left column: list of groups (chats). List + load state come from App (shared with note panel for MRU ordering). */
export function Sidebar(props) {
  const { groups, groupsStatus: status } = props;

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <span className="sidebar__title">Groups</span>
        <div className="sidebar__header-actions">
          <AddGroupBtn
            apiBase={props.apiBase}
            token={props.token}
            onLogout={props.onLogout}
            disabled={status === "loading"}
            onCreated={props.onGroupCreated}
          />
          {props.onLogout ? (
            <button type="button" className="sidebar__logout" onClick={props.onLogout}>
              Log out
            </button>
          ) : null}
        </div>
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
                <button
                  type="button"
                  className={
                    "sidebar__item-btn" +
                    (props.selectedGroup?.id === g.id ? " sidebar__item-btn--selected" : "")
                  }
                  onClick={() =>
                    props.onSelectGroup?.({ id: g.id, name: g.name })
                  }
                >
                  {g.name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </aside>
  );
}
