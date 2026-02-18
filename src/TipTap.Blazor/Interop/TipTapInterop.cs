using Microsoft.JSInterop;
using TipTap.Blazor.Models;

namespace TipTap.Blazor.Interop;

/// <summary>
/// Wraps all JavaScript interop calls for TipTap editor instances.
/// Registered as a scoped service via AddTipTapBlazor().
/// </summary>
public sealed class TipTapInterop : IAsyncDisposable
{
    private readonly IJSRuntime _js;
    private IJSObjectReference? _module;
    private readonly HashSet<string> _initializedEditors = new();
    private readonly object _initLock = new();

    public TipTapInterop(IJSRuntime js)
    {
        _js = js;
    }

    // Lazily load the bundle once per circuit
    private async ValueTask<IJSObjectReference> GetModuleAsync()
    {
        // The bundle exposes window.TipTapBlazor — we load it via a small shim
        // that just returns the global so we can cache the reference.
        _module ??= await _js.InvokeAsync<IJSObjectReference>(
            "import", "./_content/TipTap.Blazor/js/tiptap-bundle.js");
        return _module;
    }

    public async Task InitializeAsync<T>(
        string editorId,
        string contentElementId,
        TipTapEditorOptions options,
        DotNetObjectReference<T> dotNetRef) where T : class
    {
        // TipTap's Editor constructor is synchronous — the editor is fully created
        // before InvokeVoidAsync returns, so we mark it initialized immediately after.
        await _js.InvokeVoidAsync(
            "TipTapBlazor.initialize",
            editorId,
            contentElementId,
            new
            {
                placeholder    = options.Placeholder,
                autofocus      = options.Autofocus,
                editable       = options.Editable,
                initialContent = options.InitialContent ?? string.Empty,
                contentFormat  = options.ContentFormat,
            },
            dotNetRef);

        lock (_initLock)
        {
            _initializedEditors.Add(editorId);
        }
    }

    /// <summary>
    /// Called by JavaScript onCreate — kept for symmetry but no longer blocks initialization.
    /// </summary>
    public void NotifyInitializationComplete(string editorId) { }

    /// <summary>
    /// Called by JavaScript if editor creation throws — logs the error.
    /// </summary>
    public void NotifyInitializationFailed(string editorId, string error)
    {
        lock (_initLock) { _initializedEditors.Remove(editorId); }
        Console.Error.WriteLine($"TipTapBlazor: editor '{editorId}' failed to initialize: {error}");
    }

    public async Task DestroyAsync(string editorId)
    {
        await _js.InvokeVoidAsync("TipTapBlazor.destroy", editorId);
        lock (_initLock)
        {
            _initializedEditors.Remove(editorId);
        }
    }

    public async Task<string> GetContentAsync(string editorId)
        => await _js.InvokeAsync<string>("TipTapBlazor.getContent", editorId);

    public async Task SetContentAsync(string editorId, string content)
        => await _js.InvokeVoidAsync("TipTapBlazor.setContent", editorId, content);

    public async Task ClearContentAsync(string editorId)
        => await _js.InvokeVoidAsync("TipTapBlazor.clearContent", editorId);

    public async Task FocusAsync(string editorId)
        => await _js.InvokeVoidAsync("TipTapBlazor.focus", editorId);

    public async Task SetEditableAsync(string editorId, bool editable)
        => await _js.InvokeVoidAsync("TipTapBlazor.setEditable", editorId, editable);

    public async Task<int> GetCharacterCountAsync(string editorId)
    {
        if (!IsEditorInitialized(editorId)) return 0;
        return await _js.InvokeAsync<int>("TipTapBlazor.getCharacterCount", editorId);
    }

    public async Task<int> GetWordCountAsync(string editorId)
    {
        if (!IsEditorInitialized(editorId)) return 0;
        return await _js.InvokeAsync<int>("TipTapBlazor.getWordCount", editorId);
    }

    public async Task<EditorActiveState?> ExecuteCommandAsync(
        string editorId,
        string command,
        object? args = null)
    {
        if (!IsEditorInitialized(editorId)) return null;

        var argsJson = args is not null
            ? System.Text.Json.JsonSerializer.Serialize(args)
            : null;

        return await _js.InvokeAsync<EditorActiveState?>(
            "TipTapBlazor.executeCommand", editorId, command, argsJson);
    }

    public async Task<EditorActiveState?> GetActiveStateAsync(string editorId)
    {
        if (!IsEditorInitialized(editorId)) return null;
        return await _js.InvokeAsync<EditorActiveState?>("TipTapBlazor.getActiveState", editorId);
    }

    /// <summary>
    /// Checks if an editor has been initialized.
    /// </summary>
    public bool IsEditorInitialized(string editorId)
    {
        lock (_initLock)
        {
            return _initializedEditors.Contains(editorId);
        }
    }

    public async ValueTask DisposeAsync()
    {
        lock (_initLock)
        {
            _initializedEditors.Clear();
        }

        if (_module is not null)
        {
            await _module.DisposeAsync();
            _module = null;
        }
    }
}
