import type { Extensions, JSONContent, NodeViewRenderer } from "@tiptap/core";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Highlight } from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

/**
 * One lowlight registry for the whole app. `common` ships the grammars we care
 * about — js/ts (which also cover jsx/tsx), java, python, json, bash, sql, css,
 * xml (html), go, rust — without pulling `highlight.js` in as a direct import,
 * which is only a transitive dependency here.
 */
export const lowlight = createLowlight(common);

/**
 * A code block with no language is still almost always JavaScript in this app,
 * so that is what an untagged block highlights as.
 */
export const DEFAULT_CODE_LANGUAGE = "javascript";

/**
 * The languages offered in the code block's language picker.
 *
 * highlight.js has no separate `jsx`/`tsx` grammars — its `javascript` and
 * `typescript` grammars already parse JSX/TSX — so those labels say so rather
 * than pretending to be distinct modes.
 */
export const CODE_LANGUAGES: ReadonlyArray<{ value: string; label: string }> = [
  { value: "javascript", label: "JavaScript / JSX" },
  { value: "typescript", label: "TypeScript / TSX" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "sql", label: "SQL" },
  { value: "css", label: "CSS" },
  { value: "xml", label: "HTML" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "markdown", label: "Markdown" },
  { value: "plaintext", label: "Plain text" },
];

/** An empty but schema-valid document, for new notes. */
export const EMPTY_NOTE_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export type NoteExtensionOptions = {
  /** Placeholder text for the empty document. Omitted → no placeholder plugin. */
  placeholder?: string;
  /**
   * Optional node view for the code block. Passed in by the editor so that this
   * module stays free of React imports and can be used from server code.
   */
  codeBlockNodeView?: NodeViewRenderer;
};

/**
 * Builds the note schema. `NOTE_EXTENSIONS` below is the canonical instance —
 * anything that renders saved JSON (`generateHTML(json, NOTE_EXTENSIONS)`) must
 * use it so the editor and the read-only viewer agree on the schema.
 */
export function buildNoteExtensions({
  placeholder,
  codeBlockNodeView,
}: NoteExtensionOptions = {}): Extensions {
  const CodeBlock = codeBlockNodeView
    ? CodeBlockLowlight.extend({
        addNodeView: () => codeBlockNodeView,
      })
    : CodeBlockLowlight;

  return [
    StarterKit.configure({
      // replaced by the lowlight code block below
      codeBlock: false,
      heading: { levels: [1, 2, 3] },
      // bundled by StarterKit in v3: bold, italic, strike, code, underline,
      // link, lists + listKeymap, blockquote, horizontalRule, hardBreak,
      // dropcursor, gapcursor, trailingNode and undoRedo.
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      },
    }),
    CodeBlock.configure({
      lowlight,
      defaultLanguage: DEFAULT_CODE_LANGUAGE,
      // Tab indents inside a code block instead of tabbing out of the editor
      enableTabIndentation: true,
      tabSize: 2,
    }),
    TextStyle,
    Highlight,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    TableKit.configure({
      table: {
        resizable: true,
        // emits the .tableWrapper div in static HTML too, which is what makes
        // wide tables scroll instead of stretching the page
        renderWrapper: true,
      },
    }),
    ...(placeholder
      ? [
          Placeholder.configure({
            placeholder,
            emptyEditorClass: "is-editor-empty",
            emptyNodeClass: "is-empty",
          }),
        ]
      : []),
  ];
}

/**
 * The shared schema. Use this — and nothing hand-rolled — when turning saved
 * note JSON into rendered HTML, so the editor and the viewer never disagree.
 *
 * Note that `generateHTML` serialises through `DOMSerializer` and therefore
 * needs a real `document`: calling it in a server component throws
 * "window is not defined" (verified against @tiptap/core 3.31). So the
 * read-only viewer has to be a client component, and has two options:
 *
 * ```tsx
 * // 1. after mount, from the shared schema
 * const html = useMemo(
 *   () => (mounted ? generateHTML(json as JSONContent, NOTE_EXTENSIONS) : ""),
 *   [json, mounted],
 * );
 * // render into <div className="note-prose" dangerouslySetInnerHTML={{ __html: html }} />
 *
 * // 2. preferred — a non-editable editor, which also gets the code block's
 * //    language label and copy button, and works with SSR:
 * const editor = useEditor({
 *   extensions: buildNoteExtensions({ codeBlockNodeView }),
 *   content: json as JSONContent,
 *   editable: false,
 *   immediatelyRender: false,
 *   editorProps: { attributes: { class: "note-prose" } },
 * });
 * ```
 */
export const NOTE_EXTENSIONS: Extensions = buildNoteExtensions();
