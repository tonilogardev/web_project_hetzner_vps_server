# Start development application

Use the `run_app_linux.sh` script whenever you need the stack running locally (Linux or WSL). It loads `.env.development`, wipes previous containers/volumes, rebuilds, and launches `docker compose up` while streaming logs in your terminal.

```bash
chmod +x run_app_linux.sh    # run once to make it executable
./run_app_linux.sh           # cleans, builds, and starts the stack
```

Stop the application with `Ctrl+C` when you are done.

Next step:
- [007_github_actions](./007_github_actions.md)
