/**
 * TipTap Blazor Interop Wrapper
 * 
 * This module wraps the TipTapBlazor global to add initialization completion callbacks.
 * It ensures that C# is notified when JavaScript editor initialization is complete.
 */

// Store the original initialize and executeCommand functions
const originalInitialize = window.TipTapBlazor?.initialize;
const originalExecuteCommand = window.TipTapBlazor?.executeCommand;

// Keep track of which editors are fully initialized
const initializedEditors = new Set();
let dotNetHelper = null;

/**
 * Wraps the TipTapBlazor.initialize function to add completion notification
 */
function wrappedInitialize(editorId, contentElementId, options, dotNetRef) {
  if (!originalInitialize) {
    console.error('TipTapBlazor.initialize is not available');
    if (dotNetRef && dotNetRef.invokeMethodAsync) {
      dotNetRef.invokeMethodAsync('NotifyInitializationFailed', editorId, 'TipTapBlazor.initialize not available');
    }
    return;
  }

  // Store the dotNetRef for later use
  if (dotNetRef && !dotNetHelper) {
    dotNetHelper = dotNetRef;
  }

  try {
    // Call the original initialize function
    originalInitialize(editorId, contentElementId, options, dotNetRef);

    // Mark as initialized and notify C#
    initializedEditors.add(editorId);
    if (dotNetRef && typeof dotNetRef.invokeMethodAsync === 'function') {
      dotNetRef.invokeMethodAsync('NotifyInitializationComplete', editorId)
        .catch(err => {
          console.error(`Failed to notify C# of initialization completion for ${editorId}:`, err);
        });
    }
  } catch (error) {
    console.error(`Failed to initialize editor ${editorId}:`, error);
    if (dotNetRef && typeof dotNetRef.invokeMethodAsync === 'function') {
      dotNetRef.invokeMethodAsync('NotifyInitializationFailed', editorId, error.message)
        .catch(err => {
          console.error(`Failed to notify C# of initialization failure for ${editorId}:`, err);
        });
    }
  }
}

/**
 * Wraps the TipTapBlazor.executeCommand function to provide better error handling
 */
function wrappedExecuteCommand(editorId, command, args) {
  if (!originalExecuteCommand) {
    throw new Error('TipTapBlazor.executeCommand is not available');
  }

  // Check if editor is initialized
  if (!initializedEditors.has(editorId)) {
    throw new Error(`TipTapBlazor: no editor found for id="${editorId}" (initialization may still be in progress)`);
  }

  return originalExecuteCommand(editorId, command, args);
}

/**
 * Initialize the wrapper when the TipTapBlazor bundle is loaded
 */
export function setupInteropWrapper() {
  if (!window.TipTapBlazor) {
    console.error('TipTapBlazor is not available. Make sure tiptap-bundle.js is loaded.');
    return;
  }

  // Replace the initialize function with our wrapped version
  if (originalInitialize) {
    window.TipTapBlazor.initialize = wrappedInitialize;
  }

  // Replace the executeCommand function with our wrapped version
  if (originalExecuteCommand) {
    window.TipTapBlazor.executeCommand = wrappedExecuteCommand;
  }

  console.log('TipTap Blazor interop wrapper initialized');
}

/**
 * Check if an editor has been initialized (for diagnostics)
 */
export function isEditorInitialized(editorId) {
  return initializedEditors.has(editorId);
}

/**
 * Get count of initialized editors (for diagnostics)
 */
export function getInitializedEditorCount() {
  return initializedEditors.size;
}

// Auto-setup when module is imported
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupInteropWrapper);
} else {
  // DOM is already loaded
  setTimeout(setupInteropWrapper, 0);
}
