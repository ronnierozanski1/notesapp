# Notes frontend (React + Vite)

## Run

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** (matches backend CORS).

## Folder structure (what each part is for)

| Path | Role |
|------|------|
| `index.html` | Single HTML page Vite loads. Contains `<div id="root">` where React mounts. |
| `package.json` | Lists dependencies (`react`, `react-dom`, `vite`) and scripts (`npm run dev`). |
| `vite.config.js` | Vite settings: React plugin, dev server port **3000**. |
| `src/main.jsx` | **Entry point**: finds `#root` and renders `<App />` inside React `StrictMode`. |
| `src/App.jsx` | **Root component**: builds the layout (sidebar + main column). |
| `src/App.css` | Layout CSS for the whole shell (flex rows/columns). |
| `src/index.css` | **Global** CSS (reset, body font). |
| `src/components/Sidebar.jsx` | Left column: your **groups list** (WhatsApp-style). |
| `src/components/Sidebar.css` | Styles for the sidebar only. |
| `src/components/ChatArea.jsx` | **Messages** for the selected group. |
| `src/components/ChatArea.css` | Styles for the chat area. |
| `src/components/MessageInput.jsx` | **Input** at the bottom to send a new note. |
| `src/components/MessageInput.css` | Styles for the input bar. |

Next steps (later): fetch groups into `Sidebar`, pick a group, fetch notes into `ChatArea`, POST new notes from `MessageInput`.
