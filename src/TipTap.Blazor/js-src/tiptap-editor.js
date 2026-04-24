import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { createLowlight, common } from 'lowlight';

const lowlight = createLowlight(common);

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Moves header-only rows from <tbody> into a <thead> so output is semantic HTML.
// Keeps remaining rows in one <tbody>, preserving Bootstrap stripe selectors.
function fixTableHtml(html) {
  const el = document.createElement('div');
  el.innerHTML = html;
  el.querySelectorAll('table > tbody').forEach(tbody => {
    const headerRows = [];
    for (const row of tbody.querySelectorAll(':scope > tr')) {
      if (row.children.length > 0 && [...row.children].every(c => c.tagName === 'TH'))
        headerRows.push(row);
    }
    if (headerRows.length === 0) return;
    const thead = document.createElement('thead');
    headerRows.forEach(row => thead.appendChild(row)); // moves node, auto-removed from tbody
    tbody.parentElement.insertBefore(thead, tbody);
  });
  return el.innerHTML;
}

// ─── Instance registry ────────────────────────────────────────────────────────
const instances = {};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInstance(editorId) {
  const inst = instances[editorId];
  if (!inst) throw new Error(`TipTapBlazor: no editor found for id="${editorId}"`);
  return inst;
}

// ─── Public API ───────────────────────────────────────────────────────────────
const TipTapBlazor = {

  /**
   * Create a new TipTap editor attached to `contentElementId`.
   * @param {string} editorId        - unique id for this instance
   * @param {string} contentElementId - id of the div that becomes the editor
   * @param {object} options          - EditorOptions from Blazor
   * @param {object} dotNetRef       - DotNetObjectReference for callbacks
   */
  initialize(editorId, contentElementId, options, dotNetRef) {
    if (instances[editorId]) {
      instances[editorId].editor.destroy();
    }

    const el = document.getElementById(contentElementId);
    if (!el) {
      console.error(`TipTapBlazor: element #${contentElementId} not found`);
      return;
    }

    const extensions = [
      StarterKit.configure({
        codeBlock: false, // replaced by CodeBlockLowlight
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TextStyle,
      Color,
      FontFamily,
      Subscript,
      Superscript,
      Highlight.configure({ multicolor: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'table table-striped table-border' } }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      Placeholder.configure({
        placeholder: options.placeholder || 'Start typing…',
      }),
      Youtube.configure({ controls: true }),
    ];

    const editor = new Editor({
      element: el,
      extensions,
      content: options.initialContent || '',
      autofocus: options.autofocus || false,
      editable: options.editable !== false,
      onCreate({ editor }) {
        // Notify Blazor that the editor is fully initialized
        dotNetRef.invokeMethodAsync('NotifyInitializationComplete', editorId).catch(console.error);
      },
      onUpdate({ editor }) {
        const content = options.contentFormat === 'json'
          ? JSON.stringify(editor.getJSON())
          : fixTableHtml(editor.getHTML());
        dotNetRef.invokeMethodAsync('OnContentChanged', content).catch(console.error);
      },
      onSelectionUpdate({ editor }) {
        const state = TipTapBlazor._getActiveState(editor);
        dotNetRef.invokeMethodAsync('OnSelectionChanged', state).catch(console.error);
      },
    });

    instances[editorId] = { editor, dotNetRef, options };
  },

  destroy(editorId) {
    if (instances[editorId]) {
      instances[editorId].editor.destroy();
      delete instances[editorId];
    }
  },

  getContent(editorId) {
    const { editor, options } = getInstance(editorId);
    return options.contentFormat === 'json'
      ? JSON.stringify(editor.getJSON())
      : fixTableHtml(editor.getHTML());
  },

  setContent(editorId, content) {
    const { editor } = getInstance(editorId);
    editor.commands.setContent(content, false);
  },

  clearContent(editorId) {
    const { editor } = getInstance(editorId);
    editor.commands.clearContent(true);
  },

  focus(editorId) {
    const { editor } = getInstance(editorId);
    editor.commands.focus();
  },

  setEditable(editorId, editable) {
    const { editor } = getInstance(editorId);
    editor.setEditable(editable);
  },

  getCharacterCount(editorId) {
    const { editor } = getInstance(editorId);
    return editor.storage.characterCount.characters();
  },

  getWordCount(editorId) {
    const { editor } = getInstance(editorId);
    return editor.storage.characterCount.words();
  },

  /**
   * Execute a TipTap command by name with optional JSON-encoded args.
   * Commands map 1-to-1 with TipTap chain commands.
   */
  executeCommand(editorId, command, argsJson) {
    const { editor } = getInstance(editorId);
    const args = argsJson ? JSON.parse(argsJson) : null;

    const chain = editor.chain().focus();

    switch (command) {
      // ── Text marks ──────────────────────────────────────────────────────────
      case 'toggleBold':            chain.toggleBold().run(); break;
      case 'toggleItalic':          chain.toggleItalic().run(); break;
      case 'toggleUnderline':       chain.toggleUnderline().run(); break;
      case 'toggleStrike':          chain.toggleStrike().run(); break;
      case 'toggleCode':            chain.toggleCode().run(); break;
      case 'toggleSubscript':       chain.toggleSubscript().run(); break;
      case 'toggleSuperscript':     chain.toggleSuperscript().run(); break;
      case 'toggleHighlight':
        if (args?.color) chain.toggleHighlight({ color: args.color }).run();
        else chain.toggleHighlight().run();
        break;
      case 'unsetAllMarks':         chain.unsetAllMarks().run(); break;

      // ── Text color / style ──────────────────────────────────────────────────
      case 'setColor':              chain.setColor(args.color).run(); break;
      case 'unsetColor':            chain.unsetColor().run(); break;
      case 'setFontFamily':         chain.setFontFamily(args.fontFamily).run(); break;
      case 'unsetFontFamily':       chain.unsetFontFamily().run(); break;

      // ── Blocks ───────────────────────────────────────────────────────────────
      case 'setParagraph':          chain.setParagraph().run(); break;
      case 'setHeading':            chain.setHeading({ level: args.level }).run(); break;
      case 'toggleBulletList':      chain.toggleBulletList().run(); break;
      case 'toggleOrderedList':     chain.toggleOrderedList().run(); break;
      case 'toggleTaskList':        chain.toggleTaskList().run(); break;
      case 'toggleBlockquote':      chain.toggleBlockquote().run(); break;
      case 'toggleCodeBlock':       chain.toggleCodeBlock().run(); break;
      case 'setHorizontalRule':     chain.setHorizontalRule().run(); break;
      case 'setHardBreak':          chain.setHardBreak().run(); break;
      case 'clearNodes':            chain.clearNodes().run(); break;

      // ── Text alignment ───────────────────────────────────────────────────────
      case 'setTextAlign':          chain.setTextAlign(args.alignment).run(); break;

      // ── Link ─────────────────────────────────────────────────────────────────
      case 'setLink':
        chain.setLink({ href: args.href, target: args.target || null }).run();
        break;
      case 'unsetLink':             chain.unsetLink().run(); break;

      // ── Image ────────────────────────────────────────────────────────────────
      case 'setImage':
        chain.setImage({ src: args.src, alt: args.alt || '', title: args.title || '' }).run();
        break;

      // ── YouTube ──────────────────────────────────────────────────────────────
      case 'setYoutubeVideo':
        chain.setYoutubeVideo({ src: args.src, width: args.width || 640, height: args.height || 480 }).run();
        break;

      // ── Table ────────────────────────────────────────────────────────────────
      case 'insertTable':
        chain.insertTable({ rows: args.rows || 3, cols: args.cols || 3, withHeaderRow: args.withHeaderRow !== false }).run();
        break;
      case 'addColumnBefore':       chain.addColumnBefore().run(); break;
      case 'addColumnAfter':        chain.addColumnAfter().run(); break;
      case 'deleteColumn':          chain.deleteColumn().run(); break;
      case 'addRowBefore':          chain.addRowBefore().run(); break;
      case 'addRowAfter':           chain.addRowAfter().run(); break;
      case 'deleteRow':             chain.deleteRow().run(); break;
      case 'deleteTable':           chain.deleteTable().run(); break;
      case 'mergeCells':            chain.mergeCells().run(); break;
      case 'splitCell':             chain.splitCell().run(); break;
      case 'toggleHeaderColumn':    chain.toggleHeaderColumn().run(); break;
      case 'toggleHeaderRow':       chain.toggleHeaderRow().run(); break;
      case 'toggleHeaderCell':      chain.toggleHeaderCell().run(); break;
      case 'mergeOrSplit':          chain.mergeOrSplit().run(); break;
      case 'setCellAttribute':
        chain.setCellAttribute(args.name, args.value).run();
        break;
      case 'fixTables':             chain.fixTables().run(); break;
      case 'goToNextCell':          chain.goToNextCell().run(); break;
      case 'goToPreviousCell':      chain.goToPreviousCell().run(); break;

      // ── History ──────────────────────────────────────────────────────────────
      case 'undo':                  chain.undo().run(); break;
      case 'redo':                  chain.redo().run(); break;

      // ── Selection ────────────────────────────────────────────────────────────
      case 'selectAll':             chain.selectAll().run(); break;

      default:
        console.warn(`TipTapBlazor: unknown command "${command}"`);
    }

    // Return updated active state after command
    return TipTapBlazor._getActiveState(editor);
  },

  /**
   * Returns a plain object describing which marks/nodes are currently active.
   * Blazor uses this to update toolbar button states.
   */
  getActiveState(editorId) {
    const { editor } = getInstance(editorId);
    return TipTapBlazor._getActiveState(editor);
  },

  _getActiveState(editor) {
    return {
      bold:            editor.isActive('bold'),
      italic:          editor.isActive('italic'),
      underline:       editor.isActive('underline'),
      strike:          editor.isActive('strike'),
      code:            editor.isActive('code'),
      subscript:       editor.isActive('subscript'),
      superscript:     editor.isActive('superscript'),
      highlight:       editor.isActive('highlight'),
      link:            editor.isActive('link'),
      bulletList:      editor.isActive('bulletList'),
      orderedList:     editor.isActive('orderedList'),
      taskList:        editor.isActive('taskList'),
      blockquote:      editor.isActive('blockquote'),
      codeBlock:       editor.isActive('codeBlock'),
      paragraph:       editor.isActive('paragraph'),
      h1:              editor.isActive('heading', { level: 1 }),
      h2:              editor.isActive('heading', { level: 2 }),
      h3:              editor.isActive('heading', { level: 3 }),
      h4:              editor.isActive('heading', { level: 4 }),
      h5:              editor.isActive('heading', { level: 5 }),
      h6:              editor.isActive('heading', { level: 6 }),
      alignLeft:       editor.isActive({ textAlign: 'left' }),
      alignCenter:     editor.isActive({ textAlign: 'center' }),
      alignRight:      editor.isActive({ textAlign: 'right' }),
      alignJustify:    editor.isActive({ textAlign: 'justify' }),
      table:           editor.isActive('table'),
      canUndo:         editor.can().undo(),
      canRedo:         editor.can().redo(),
      currentColor:    editor.getAttributes('textStyle').color || null,
      currentFontFamily: editor.getAttributes('textStyle').fontFamily || null,
    };
  },
};

// Expose on window so Blazor JS interop can call it
window.TipTapBlazor = TipTapBlazor;
