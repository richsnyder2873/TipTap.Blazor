using System.Text.Json.Serialization;

namespace TipTap.Blazor.Models;

/// <summary>
/// Reflects which marks, nodes and commands are currently active in the editor.
/// Populated from the JS side on every selection change.
/// </summary>
public class EditorActiveState
{
    [JsonPropertyName("bold")]            public bool Bold { get; set; }
    [JsonPropertyName("italic")]          public bool Italic { get; set; }
    [JsonPropertyName("underline")]       public bool Underline { get; set; }
    [JsonPropertyName("strike")]          public bool Strike { get; set; }
    [JsonPropertyName("code")]            public bool Code { get; set; }
    [JsonPropertyName("subscript")]       public bool Subscript { get; set; }
    [JsonPropertyName("superscript")]     public bool Superscript { get; set; }
    [JsonPropertyName("highlight")]       public bool Highlight { get; set; }
    [JsonPropertyName("link")]            public bool Link { get; set; }
    [JsonPropertyName("bulletList")]      public bool BulletList { get; set; }
    [JsonPropertyName("orderedList")]     public bool OrderedList { get; set; }
    [JsonPropertyName("taskList")]        public bool TaskList { get; set; }
    [JsonPropertyName("blockquote")]      public bool Blockquote { get; set; }
    [JsonPropertyName("codeBlock")]       public bool CodeBlock { get; set; }
    [JsonPropertyName("paragraph")]       public bool Paragraph { get; set; }
    [JsonPropertyName("h1")]              public bool H1 { get; set; }
    [JsonPropertyName("h2")]             public bool H2 { get; set; }
    [JsonPropertyName("h3")]             public bool H3 { get; set; }
    [JsonPropertyName("h4")]             public bool H4 { get; set; }
    [JsonPropertyName("h5")]             public bool H5 { get; set; }
    [JsonPropertyName("h6")]             public bool H6 { get; set; }
    [JsonPropertyName("alignLeft")]       public bool AlignLeft { get; set; }
    [JsonPropertyName("alignCenter")]     public bool AlignCenter { get; set; }
    [JsonPropertyName("alignRight")]      public bool AlignRight { get; set; }
    [JsonPropertyName("alignJustify")]    public bool AlignJustify { get; set; }
    [JsonPropertyName("table")]           public bool Table { get; set; }
    [JsonPropertyName("canUndo")]         public bool CanUndo { get; set; }
    [JsonPropertyName("canRedo")]         public bool CanRedo { get; set; }
    [JsonPropertyName("currentColor")]    public string? CurrentColor { get; set; }
    [JsonPropertyName("currentFontFamily")] public string? CurrentFontFamily { get; set; }
}
