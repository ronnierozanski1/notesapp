import { useState } from "react";
import "./NoteInput.css";

/**
 * Bottom bar: user types here. Parent passes onSend(text).
 */
export function NoteInput(props) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (props.disabled) return;
    props.onSend(value);
    setValue("");
  }

  return (
    <footer className="note-input">
      <form className="note-input__form" onSubmit={handleSubmit}>
        {/* onSubmit runs when the form is submitted (e.g. Send click with type="submit") */}
        <input
          className="note-input__field"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={props.placeholder ?? "Type a message…"}
          disabled={props.disabled}
        />
        {/*value is value in the input field and its the value of the state variable value*/}
        <button type="submit" className="note-input__btn" disabled={props.disabled}>
          Send
        </button>
        {/* Submit button triggers form submit → handleSubmit */}
      </form>
    </footer>
  );
}
