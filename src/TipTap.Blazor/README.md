# TipTap.Blazor

A Blazor Razor Class Library that wraps the [TipTap](https://tiptap.dev) rich text editor. Ships a self-contained JavaScript bundle — no CDN links or npm setup required in the consuming app.

## Features

- Full formatting toolbar (headings, fonts, bold/italic/underline, color, alignment, lists, tables, code blocks, links, images, YouTube)
- Customizable toolbar — choose which groups to display via a `ToolbarItems` flags enum
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

Add the component namespaces so you don't need `@using` on every page:

```razor
@using TipTap.Blazor.Components
@using TipTap.Blazor.Models
@using Microsoft.AspNetCore.Components.Forms
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

## EditForm integration

Use `InputTipTap` instead of `TipTapEditor` when you need full `EditForm` / validation pipeline integration. It inherits `InputBase<string>`, so `@bind-Value`, `<ValidationMessage>`, and `EditContext.NotifyFieldChanged` all work automatically.

```razor
<EditForm Model="_model" OnValidSubmit="HandleSubmit">
    <DataAnnotationsValidator />

    <InputTipTap @bind-Value="_model.Content"
                 Options="_options" />
    <ValidationMessage For="@(() => _model.Content)" />

    <button type="submit">Submit</button>
</EditForm>

@code {
    private MyModel _model = new();

    private TipTapEditorOptions _options = new()
    {
        Placeholder = "Start typing…",
    };

    private async Task HandleSubmit()
    {
        // _model.Content contains the current HTML
    }
}
```

If the bound value changes programmatically after the editor has mounted (e.g. loading a different record without unmounting), `InputTipTap` detects the change and pushes the new content into the live editor automatically.

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
| `ToolbarItems` | `ToolbarItems` | `ToolbarItems.All` | Which toolbar groups to display |

### `InputTipTap`

Inherits `InputBase<string>` — use inside `EditForm` with `@bind-Value`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `Options` | `TipTapEditorOptions` | `new()` | Editor configuration (`InitialContent` is ignored — the bound value is used) |
| `ShowToolbar` | `bool` | `true` | Show the formatting toolbar |
| `ShowWordCount` | `bool` | `true` | Show the word/character count footer |
| `EditorCssClass` | `string?` | `null` | Extra CSS class(es) on the editor wrapper |
| `ToolbarCssClass` | `string?` | `null` | Extra CSS class(es) on the toolbar |
| `ToolbarItems` | `ToolbarItems` | `ToolbarItems.All` | Which toolbar groups to display |

### `TipTapEditorOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Placeholder` | `string` | `"Start typing…"` | Placeholder shown when empty |
| `Autofocus` | `bool` | `false` | Focus editor on mount |
| `Editable` | `bool` | `true` | Whether content is editable |
| `InitialContent` | `string?` | `null` | HTML or JSON to load on init |
| `ContentFormat` | `string` | `"html"` | `"html"` or `"json"` |

---

## Toolbar customization

Pass a `ToolbarItems` [flags enum](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/enum#enumeration-types-as-bit-flags) to control which groups appear. The default is `ToolbarItems.All`.

| Value | Toolbar group |
|-------|--------------|
| `ToolbarItems.History` | Undo / Redo |
| `ToolbarItems.BlockType` | Paragraph / Heading selector |
| `ToolbarItems.FontFamily` | Font family selector |
| `ToolbarItems.InlineMarks` | Bold, Italic, Underline, Strikethrough, Code, Sub/Superscript |
| `ToolbarItems.TextColor` | Text color, Highlight |
| `ToolbarItems.TextAlignment` | Left, Center, Right, Justify |
| `ToolbarItems.Lists` | Bullet list, Ordered list, Task list |
| `ToolbarItems.Blocks` | Blockquote, Code block, Horizontal rule, Clear formatting |
| `ToolbarItems.Link` | Insert / edit / remove link |
| `ToolbarItems.Image` | Insert image |
| `ToolbarItems.YouTube` | Embed YouTube video |
| `ToolbarItems.Table` | Insert and edit tables |

### Show only specific groups

```razor
<TipTapEditor ToolbarItems="ToolbarItems.InlineMarks | ToolbarItems.Lists | ToolbarItems.Link" />
```

### Show all except certain groups

```razor
<TipTapEditor ToolbarItems="ToolbarItems.All & ~ToolbarItems.YouTube & ~ToolbarItems.Image" />
```

### Same API for `InputTipTap`

```razor
<InputTipTap @bind-Value="_model.Body"
             ToolbarItems="ToolbarItems.InlineMarks | ToolbarItems.Lists | ToolbarItems.Link" />
```

Dividers between groups are shown automatically only when there is visible content on both sides, so the toolbar always looks clean regardless of which combination you choose.

---

## License

MIT
