# RackGuard

Static frontend prototype for the Scania rack inspection workflow.

## Run the application

### Simplest option

Open `index.html` in a modern browser.

### Recommended option

From inside the `RackGuard` folder, run:

```powershell
python -m http.server 4174
```

Then open:

```text
http://127.0.0.1:4174/
```

VS Code's Live Server extension can also be used.

## Login credentials

| Role | Username | Password |
| --- | --- | --- |
| Inspector | `inspector1` | `inspector1` |
| Manager | `manager1` | `manager1` |
| Safety Representative | `safetyrep1` | `safetyrep1` |
| Maintenance Organizer | `maintenance1` | `maintenance1` |

## Important

- No backend or database is required.
- Workflow data is stored temporarily in browser memory.
- Refreshing or closing the page resets submitted reports and workflow progress.
- Allow browser popups when testing report buttons that open content in new tabs.
