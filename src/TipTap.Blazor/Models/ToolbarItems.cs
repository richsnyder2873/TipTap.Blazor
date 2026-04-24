namespace TipTap.Blazor.Models;

/// <summary>Controls which groups of buttons are rendered in the toolbar.</summary>
[Flags]
public enum ToolbarItems
{
    None          = 0,
    History       = 1 << 0,
    BlockType     = 1 << 1,
    FontFamily    = 1 << 2,
    InlineMarks   = 1 << 3,
    TextColor     = 1 << 4,
    TextAlignment = 1 << 5,
    Lists         = 1 << 6,
    Blocks        = 1 << 7,
    Link          = 1 << 8,
    Image         = 1 << 9,
    YouTube       = 1 << 10,
    Table         = 1 << 11,
    All           = (1 << 12) - 1,
}
