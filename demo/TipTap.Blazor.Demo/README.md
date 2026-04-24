# TipTap.Blazor.Demo

Interactive demo app for the [TipTap.Blazor](../../src/TipTap.Blazor/) Razor Class Library. Runs as a standard Blazor Web App (.NET 10) and exercises the full feature set of the editor component.

## Running the demo

From the repository root:

```bash
dotnet run --project demo/TipTap.Blazor.Demo
```

The first build compiles the Vite/TipTap JavaScript bundle automatically via an MSBuild target in the RCL project. Subsequent builds skip the npm install step and only re-bundle if source files changed.

## What the demo covers

- Basic editor usage with toolbar and word count
- Reading editor content as HTML
- Setting and clearing content programmatically
- Toggling read-only mode
- `TipTapEditorOptions` (placeholder, autofocus, initial content, content format)

## Project references

The demo references the RCL directly via a project reference — it does not use the NuGet package. See the [library README](../../src/TipTap.Blazor/README.md) for instructions on consuming the package in your own app.
