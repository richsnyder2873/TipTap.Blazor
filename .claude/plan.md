# TipTap Blazor RCL — Implementation Plan

## Goal
Build a Razor Class Library (RCL) that wraps TipTap into a fully-featured Blazor component,
distributable as a NuGet package. A companion Blazor Server demo app exercises all features.

---

## Repository Layout

```
D:\repo\tiptap\
├── TipTap.Blazor.sln
├── src/
│   └── TipTap.Blazor/              ← RCL (NuGet package)
│       ├── TipTap.Blazor.csproj
│       ├── Components/
│       │   ├── TipTapEditor.razor
│       │   └── TipTapToolbar.razor
│       ├── Interop/
│       │   └── TipTapInterop.cs    ← JS interop service
│       ├── Models/
│       │   └── EditorOptions.cs
│       ├── wwwroot/
│       │   └── js/
│       │       └── tiptap-bundle.js ← output of Vite build
│       └── js-src/                  ← Vite source (excluded from package content)
│           ├── package.json
│           ├── vite.config.js
│           └── tiptap-editor.js     ← main JS entry point
└── demo/
    └── TipTap.Blazor.Demo/         ← Blazor Server demo app
        ├── TipTap.Blazor.Demo.csproj
        └── Pages/
            └── Index.razor
```

---

## JavaScript Bundle (Vite)

**Location:** `src/TipTap.Blazor/js-src/`

**TipTap packages included:**
- `@tiptap/core`
- `@tiptap/pm` (ProseMirror)
- `@tiptap/starter-kit` (Bold, Italic, Strike, Code, History, Paragraph, Heading, BulletList, OrderedList, Blockquote, HardBreak, HorizontalRule)
- `@tiptap/extension-table`, `@tiptap/extension-table-row`, `@tiptap/extension-table-header`, `@tiptap/extension-table-cell`
- `@tiptap/extension-text-align`
- `@tiptap/extension-underline`
- `@tiptap/extension-link`
- `@tiptap/extension-image`
- `@tiptap/extension-color`
- `@tiptap/extension-text-style`
- `@tiptap/extension-font-family`
- `@tiptap/extension-subscript`
- `@tiptap/extension-superscript`
- `@tiptap/extension-highlight`
- `@tiptap/extension-code-block-lowlight` + `lowlight`
- `@tiptap/extension-task-list` + `@tiptap/extension-task-item`
- `@tiptap/extension-character-count`
- `@tiptap/extension-placeholder`
- `@tiptap/extension-mention`
- `@tiptap/extension-youtube`

**Vite build output:** `src/TipTap.Blazor/wwwroot/js/tiptap-bundle.js`
(iife format, global name `TipTapBlazor`, minified for release)

**MSBuild integration:** The `.csproj` runs `npm install && npm run build` as a `BeforeBuild` target
so the bundle is always fresh before the .NET build.

---

## RCL Project (`TipTap.Blazor.csproj`)

- `<TargetFramework>net10.0</TargetFramework>`
- `<IsPackable>true</IsPackable>` with NuGet metadata
- Static web assets via `<StaticWebAsset>` — the `wwwroot/` folder is served automatically
- Exports `TipTapEditor` and `TipTapToolbar` Blazor components

### Key C# APIs

```csharp
// EditorOptions.cs
public class TipTapEditorOptions
{
    public string? Placeholder { get; set; }
    public bool Autofocus { get; set; }
    public bool Editable { get; set; } = true;
    public string? InitialContent { get; set; }   // HTML or JSON string
    public string ContentFormat { get; set; } = "html"; // "html" | "json"
}

// TipTapEditor.razor parameters
[Parameter] public TipTapEditorOptions Options { get; set; }
[Parameter] public EventCallback<string> OnContentChanged { get; set; }
[Parameter] public bool ShowToolbar { get; set; } = true;
[Parameter] public string? CssClass { get; set; }
[Parameter] public string? ToolbarCssClass { get; set; }
```

### JS Interop

`TipTapInterop.cs` wraps `IJSRuntime` and exposes:

- `InitializeAsync(elementId, options, dotNetRef)` → creates TipTap editor instance
- `DestroyAsync(elementId)`
- `GetContentAsync(elementId)` → returns HTML or JSON
- `SetContentAsync(elementId, content)`
- `ExecuteCommandAsync(elementId, command, args)` → runs toolbar commands
- `FocusAsync(elementId)`

### JS-side (`tiptap-editor.js`)

```js
window.TipTapBlazor = {
  instances: {},
  initialize(elementId, options, dotNetRef) { ... },
  destroy(elementId) { ... },
  getContent(elementId) { ... },
  setContent(elementId, content) { ... },
  executeCommand(elementId, command, args) { ... },
}
```

DotNet callbacks used:
- `dotNetRef.invokeMethodAsync('OnContentChanged', htmlContent)` — fired on every editor `update`

---

## TipTapEditor Component

**Template structure:**
```html
<div class="tiptap-editor-wrapper @CssClass" id="@_editorId">
  @if (ShowToolbar)
  {
    <TipTapToolbar EditorId="@_editorId" Interop="@_interop" CssClass="@ToolbarCssClass" />
  }
  <div class="tiptap-editor-content" id="@(_editorId + "-content")"></div>
</div>
```

Lifecycle: `OnAfterRenderAsync(firstRender)` → call `InitializeAsync`.
`IAsyncDisposable.DisposeAsync` → call `DestroyAsync`.

---

## TipTapToolbar Component

A Blazor component that renders toolbar buttons grouped by category:
- **Text style:** Bold, Italic, Underline, Strikethrough, Code, Subscript, Superscript
- **Headings:** H1–H6, Paragraph
- **Alignment:** Left, Center, Right, Justify
- **Lists:** Bullet list, Ordered list, Task list
- **Blocks:** Blockquote, Code block, Horizontal rule
- **Table:** Insert table, add/remove rows & columns, merge cells
- **Insert:** Link, Image, YouTube
- **Highlight / Color:** Text color picker, highlight color picker
- **History:** Undo, Redo

Each button calls `Interop.ExecuteCommandAsync(EditorId, "commandName", args)`.

---

## Demo App (`TipTap.Blazor.Demo`)

- `<TargetFramework>net10.0</TargetFramework>`, Blazor Server
- Project reference to `../src/TipTap.Blazor/TipTap.Blazor.csproj`
- `Pages/Index.razor` — full demo with all toolbar features visible
- `Pages/ReadOnly.razor` — shows the editor in read-only mode with set content
- `Shared/MainLayout.razor` / `NavMenu.razor` for navigation

Demo registers services in `Program.cs`:
```csharp
builder.Services.AddTipTapBlazor();
```

---

## Build Flow

1. `dotnet build` triggers MSBuild `BeforeBuild` target:
   - `cd src/TipTap.Blazor/js-src && npm ci && npm run build`
   - Output: `wwwroot/js/tiptap-bundle.js`
2. RCL compiled; static web assets picked up automatically
3. Demo app references RCL; Blazor serves `_content/TipTap.Blazor/js/tiptap-bundle.js`
4. `_Imports.razor` in RCL adds: `@using TipTap.Blazor.Components`

---

## Styling

- Minimal base CSS shipped in `wwwroot/css/tiptap-editor.css`
- CSS variables for customization (colors, borders, padding)
- Consumer can override via their own stylesheet
- Toolbar uses CSS Grid / Flexbox, no external CSS framework dependency

---

## NuGet Packaging

```xml
<PropertyGroup>
  <PackageId>TipTap.Blazor</PackageId>
  <Version>1.0.0</Version>
  <Authors>YourName</Authors>
  <Description>A fully-featured TipTap rich text editor component for Blazor with a bundled JavaScript build.</Description>
  <PackageTags>blazor;tiptap;richeditor;wysiwyg;rcl</PackageTags>
  <GeneratePackageOnBuild>false</GeneratePackageOnBuild>
</PropertyGroup>
```

Run `dotnet pack -c Release` to produce the `.nupkg`.
