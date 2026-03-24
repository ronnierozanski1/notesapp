import "./ChatArea.css";

/**
 * Shows the conversation. Parent (App) owns the list; we only render props.
 * @param {{ messages: { id: string, role: 'user' | 'server', text: string }[] }} props
 */
export function ChatArea({ messages }) {
  return (
    <main className="chat-area">
      <header className="chat-area__header">Chat</header>
      <div className="chat-area__messages">
        {messages.length === 0 ? (
          <p className="chat-area__placeholder">Type a message below and send — the server will echo it back.</p>
        ) : (
          <ul className="chat-area__list">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`chat-bubble chat-bubble--${m.role}`}
              >
                {m.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
