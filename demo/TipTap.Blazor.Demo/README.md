# TipTap.Blazor.Demo

Interactive demo app for the [TipTap.Blazor](../../src/TipTap.Blazor/) Razor Class Library. Runs as a standard Blazor Web App (.NET 10) and exercises the full feature set of the editor component.

## Running the demo

From the repository root:

```bash
dotnet run --project demo/TipTap.Blazor.Demo
```

The first build compiles the Vite/TipTap JavaScript bundle automatically via an MSBuild target in the RCL project. Subsequent builds skip the npm install step and only re-bundle if source files changed.

## What the demo covers

| Route | Description |
|-------|-------------|
| `/` | Full editor — all toolbar groups, word count, get/set/clear content |
| `/readonly` | Toggle between editable and read-only mode at runtime |
| `/minimal` | Toolbar and footer both hidden for distraction-free writing |
| `/json` | `ContentFormat = "json"` — live pretty-printed JSON output |
| `/form` | `InputTipTap` inside `EditForm` with data-annotation validation |
| `/toolbar-customization` | `ToolbarItems` flags — toggle individual toolbar groups live |

## Project references

The demo references the RCL directly via a project reference — it does not use the NuGet package. See the [library README](../../src/TipTap.Blazor/README.md) for instructions on consuming the package in your own app.
