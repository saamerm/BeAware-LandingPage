Using **ES6 Modules** (`type="module"`) is the modern standard for splitting JavaScript. It makes the code much cleaner and easier to maintain.

Since we are using Modules, **variables are no longer global by default**. This means we have to explicitly attach the functions used in your HTML buttons (like `downloadVcf` and `editProfile`) to the `window` object so the HTML can "see" them.

### Folder Structure

```text
/project-folder
  ├── index.html
  ├── style.css
  └── js/
       ├── config.js    (Constants & Settings)
       ├── state.js     (Mutable data: polling timers, current user ID)
       ├── utils.js     (Helpers: UUID, formatting, toast)
       ├── api.js       (Fetch & Post logic)
       ├── ui.js        (Rendering HTML, switching views)
       └── app.js       (Main entry point: Event Listeners & Logic)
```