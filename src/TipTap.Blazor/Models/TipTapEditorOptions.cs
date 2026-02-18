namespace TipTap.Blazor.Models;

/// <summary>
/// Configuration options passed to the TipTap editor on initialization.
/// </summary>
public class TipTapEditorOptions
{
    /// <summary>Placeholder text shown when the editor is empty.</summary>
    public string Placeholder { get; set; } = "Start typing…";

    /// <summary>Focus the editor automatically after initialization.</summary>
    public bool Autofocus { get; set; } = false;

    /// <summary>Whether the editor content can be edited.</summary>
    public bool Editable { get; set; } = true;

    /// <summary>Initial HTML or JSON content to load into the editor.</summary>
    public string? InitialContent { get; set; }

    /// <summary>
    /// Content format for both initial content and change callbacks.
    /// Accepted values: "html" (default) or "json".
    /// </summary>
    public string ContentFormat { get; set; } = "html";
}
