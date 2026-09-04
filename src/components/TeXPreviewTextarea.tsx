"use client";

import {
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEventHandler,
  type KeyboardEvent as ReactKeyboardEvent,
  type KeyboardEventHandler,
  type Ref,
} from "react";
import { renderTexToHtml } from "@/lib/tex-render";

export function TeXPreviewTextarea({
  id,
  value,
  onChange,
  className,
  label,
  rows = 3,
  heightClass = "min-h-[72px]",
  monospace = false,
  textareaRef,
  placeholder,
  autoFocus,
  onBlur,
  onKeyDown,
}: {
  id: string;
  value: string;
  onChange: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
  className: string;
  label: string;
  rows?: number;
  heightClass?: string;
  monospace?: boolean;
  textareaRef?: Ref<HTMLTextAreaElement>;
  placeholder?: string;
  autoFocus?: boolean;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
}) {
  const [activeTab, setActiveTab] = useState<"text" | "preview">("text");
  const textTabRef = useRef<HTMLButtonElement>(null);
  const previewTabRef = useRef<HTMLButtonElement>(null);
  const deferredValue = useDeferredValue(value);
  const [rendered, setRendered] = useState({ source: "", html: "", error: "" });

  useEffect(() => {
    let cancelled = false;

    if (activeTab !== "preview" || !deferredValue) return;

    void import("katex")
      .then(({ default: katex }) => {
        if (cancelled) return;
        const next = renderTexToHtml(
          deferredValue,
          (tex, display) =>
            katex.renderToString(tex, {
              displayMode: display,
              throwOnError: false,
              trust: false,
            }),
          { linkify: true },
        );
        setRendered({ source: deferredValue, html: next, error: "" });
      })
      .catch(() => {
        if (!cancelled) {
          setRendered({
            source: deferredValue,
            html: "",
            error: "The preview could not be rendered.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, deferredValue]);

  const current = deferredValue !== "" && rendered.source === deferredValue;
  const html = current ? rendered.html : "";
  const error = current ? rendered.error : "";
  const loading = deferredValue !== "" && !current;

  function moveTab(event: ReactKeyboardEvent<HTMLButtonElement>) {
    let next: "text" | "preview" | null = null;
    if (event.key === "ArrowLeft" || event.key === "Home") next = "text";
    if (event.key === "ArrowRight" || event.key === "End") next = "preview";
    if (!next) return;

    event.preventDefault();
    setActiveTab(next);
    const target = next === "text" ? textTabRef : previewTabRef;
    requestAnimationFrame(() => target.current?.focus());
  }

  return (
    <div className="mt-1">
      <div className="mb-1 flex gap-1" role="tablist" aria-label={`${label} view`}>
        <button
          ref={textTabRef}
          type="button"
          role="tab"
          id={`${id}-text-tab`}
          aria-controls={`${id}-text-panel`}
          aria-selected={activeTab === "text"}
          tabIndex={activeTab === "text" ? 0 : -1}
          onClick={() => setActiveTab("text")}
          onKeyDown={moveTab}
          className={`rounded px-2.5 py-1 text-xs transition-colors ${
            activeTab === "text"
              ? "bg-[var(--ink)] text-[var(--paper)]"
              : "text-[var(--ink-muted)] hover:bg-[var(--paper-raised)] hover:text-[var(--ink)]"
          }`}
        >
          Text
        </button>
        <button
          ref={previewTabRef}
          type="button"
          role="tab"
          id={`${id}-preview-tab`}
          aria-controls={`${id}-preview-panel`}
          aria-selected={activeTab === "preview"}
          tabIndex={activeTab === "preview" ? 0 : -1}
          onClick={() => setActiveTab("preview")}
          onKeyDown={moveTab}
          className={`rounded px-2.5 py-1 text-xs transition-colors ${
            activeTab === "preview"
              ? "bg-[var(--ink)] text-[var(--paper)]"
              : "text-[var(--ink-muted)] hover:bg-[var(--paper-raised)] hover:text-[var(--ink)]"
          }`}
        >
          LaTeX preview
        </button>
      </div>

      <div
        role="tabpanel"
        id={`${id}-text-panel`}
        aria-labelledby={`${id}-text-tab`}
        hidden={activeTab !== "text"}
      >
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          rows={rows}
          onChange={(event) => onChange(event.target.value, event)}
          className={`${className} ${heightClass} resize-y ${monospace ? "font-mono" : ""}`}
          aria-describedby={`${id}-preview-help`}
          aria-label={label}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
      </div>

      <div
        role="tabpanel"
        id={`${id}-preview-panel`}
        aria-labelledby={`${id}-preview-tab`}
        hidden={activeTab !== "preview"}
        className={`math-prose ${heightClass} rounded border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-2 text-sm leading-relaxed text-[var(--ink-secondary)]`}
        aria-busy={loading}
      >
        {error ? (
          <p className="text-[var(--status-critical)]" role="status">
            {error}
          </p>
        ) : html ? (
          <span dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="text-[var(--ink-muted)]">
            Nothing to preview yet. Plain text is fine; use $...$ for inline
            math and $$...$$ for display math.
          </p>
        )}
      </div>

      <p id={`${id}-preview-help`} className="sr-only">
        Select the LaTeX preview tab to see a read-only rendering.
      </p>
    </div>
  );
}
