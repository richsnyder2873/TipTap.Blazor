# TipTap.Blazor

A Blazor Razor Class Library that wraps the [TipTap](https://tiptap.dev) rich text editor. Ships a self-contained JavaScript bundle — no CDN links or npm setup required in the consuming app.

## Features

- Full formatting toolbar (headings, fonts, bold/italic/underline, color, alignment, lists, tables, code blocks, links, images, YouTube)
- Word / character count footer
- HTML and JSON content formats
- Read-only mode toggle
- No external JS dependencies at runtime

---

## Using from a local NuGet package

### 1. Pack the library

From the repository root:

```bash
dotnet pack src/TipTap.Blazor/TipTap.Blazor.csproj --configuration Release --output ./nupkgs
```

This rebuilds the Vite bundle and produces `nupkgs/TipTap.Blazor.1.0.0.nupkg`.

To stamp a specific version without editing the `.csproj`, pass `-p:Version`:

```bash
dotnet pack src/TipTap.Blazor/TipTap.Blazor.csproj --configuration Release --output ./nupkgs -p:Version=1.2.3
```

### 2. Add a local NuGet source

In the **root of your consuming solution**, create or update `nuget.config`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <add key="local-tiptap" value="C:\path\to\tiptap\nupkgs" />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
  </packageSources>
</configuration>
```

Replace the path with the absolute path to the folder containing the `.nupkg` file.

### 3. Add the package reference

```bash
dotnet add YourApp/YourApp.csproj package TipTap.Blazor --version 1.0.0
```

---

## Configuring the app

### Program.cs

Register the required scoped service:

```csharp
builder.Services.AddTipTapBlazor();
```

### App.razor

Add the stylesheet to `<head>` and the script bundle before `</body>`:

```html
<head>
    ...
    <link rel="stylesheet" href="_content/TipTap.Blazor/css/tiptap-editor.css" />
</head>
<body>
    ...
    <script src="_content/TipTap.Blazor/js/tiptap-bundle.js"></script>
</body>
```

### _Imports.razor

Add the component namespace so you don't need `@using` on every page:

```razor
@using TipTap.Blazor.Components
@using TipTap.Blazor.Models
```

---

## Basic usage

```razor
@page "/editor"

<TipTapEditor @ref="_editor"
              Options="_options"
              OnContentChanged="@(html => _content = html)" />

<p>@_content</p>

@code {
    private TipTapEditor _editor = default!;
    private string _content = string.Empty;

    private TipTapEditorOptions _options = new()
    {
        Placeholder = "Start typing…",
        Autofocus = true,
        InitialContent = "<p>Hello world</p>",
        ContentFormat = "html",
    };
}
```

### Programmatic control

```csharp
string html  = await _editor.GetContentAsync();
await _editor.SetContentAsync("<p>New content</p>");
await _editor.ClearContentAsync();
await _editor.FocusAsync();
await _editor.SetEditableAsync(false);   // read-only mode
```

---

## Component parameters

### `TipTapEditor`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `Options` | `TipTapEditorOptions` | `new()` | Editor configuration |
| `OnContentChanged` | `EventCallback<string>` | — | Fires on every content change |
| `ShowToolbar` | `bool` | `true` | Show the formatting toolbar |
| `ShowWordCount` | `bool` | `true` | Show the word/character count footer |
| `CssClass` | `string?` | `null` | Extra CSS class(es) on the outer wrapper |
| `ToolbarCssClass` | `string?` | `null` | Extra CSS class(es) on the toolbar |

### `TipTapEditorOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Placeholder` | `string` | `"Start typing…"` | Placeholder shown when empty |
| `Autofocus` | `bool` | `false` | Focus editor on mount |
| `Editable` | `bool` | `true` | Whether content is editable |
| `InitialContent` | `string?` | `null` | HTML or JSON to load on init |
| `ContentFormat` | `string` | `"html"` | `"html"` or `"json"` |

---

## License

MIT
