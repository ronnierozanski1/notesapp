import { useState } from "react";
import "./MessageInput.css";

/**
 * Bottom bar: user types here. Parent passes onSend(text).
 */
export function MessageInput(props) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    props.onSend(value);
    setValue("");
  }

  return (
    <footer className="message-input">
      <form className="message-input__form" onSubmit={handleSubmit}>
        {/* onSubmit runs when the form is submitted (e.g. Send click with type="submit") */}
        <input
          className="message-input__field"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type a message…"
          aria-label="Message"
        />
        {/* Submit button triggers form submit → handleSubmit */}
        <button type="submit" className="message-input__btn">
          Send
        </button>
      </form>
    </footer>
  );
}
