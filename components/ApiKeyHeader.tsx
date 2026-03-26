"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Status = "idle" | "checking" | "ok" | "error";

const STORAGE_KEY = "groq_api_key";

interface ApiKeyHeaderProps {
  onKeyChange: (key: string | null) => void;
}

export default function ApiKeyHeader({ onKeyChange }: ApiKeyHeaderProps) {
  const [apiKey, setApiKey] = useState<string>("");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load persisted key on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSavedKey(stored);
      setApiKey(stored);
      setDraft(stored);
      onKeyChange(stored);
    }
  }, [onKeyChange]);

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const ping = useCallback(async (key: string) => {
    setStatus("checking");
    setErrorMsg("");
    try {
      const res = await fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("ok");
      } else {
        setStatus("error");
        setErrorMsg(data.error ?? "Key check failed");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Could not reach server");
    }
  }, []);

  // Auto-ping when a key is loaded from storage
  useEffect(() => {
    if (savedKey) ping(savedKey);
  }, [savedKey, ping]);

  function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setSavedKey(trimmed);
    setApiKey(trimmed);
    onKeyChange(trimmed);
    setOpen(false);
    ping(trimmed);
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);
    setSavedKey(null);
    setApiKey("");
    setDraft("");
    setStatus("idle");
    setErrorMsg("");
    onKeyChange(null);
    setOpen(false);
  }

  const maskedKey = savedKey
    ? savedKey.slice(0, 6) + "••••••••" + savedKey.slice(-4)
    : null;

  const StatusDot = () => {
    if (status === "checking") {
      return (
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse block" />
      );
    }
    if (status === "ok") {
      return <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block" />;
    }
    if (status === "error") {
      return <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />;
    }
    // idle
    return <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600 block" />;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        onClick={() => {
          setDraft(savedKey ?? "");
          setOpen((v) => !v);
        }}
        className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <StatusDot />
        <span>
          {savedKey ? (
            <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
              {maskedKey}
            </span>
          ) : (
            "Load API key"
          )}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-50 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Groq API Key
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Free at{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-violet-600"
              >
                console.groq.com
              </a>
              . Saved in your browser only.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="gsk_..."
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-mono text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              onClick={handleSave}
              disabled={!draft.trim()}
              className="rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 dark:disabled:bg-violet-900 text-white text-sm font-semibold px-3 py-1.5 transition-colors"
            >
              Save
            </button>
          </div>

          {/* Status feedback */}
          {status === "checking" && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Checking key…
            </p>
          )}
          {status === "ok" && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Connected — key is valid
            </p>
          )}
          {status === "error" && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
              <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
              <button
                onClick={() => savedKey && ping(savedKey)}
                className="text-xs text-red-500 underline mt-1 hover:text-red-700"
              >
                Retry ping
              </button>
            </div>
          )}

          {savedKey && (
            <button
              onClick={handleClear}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Remove saved key
            </button>
          )}
        </div>
      )}
    </div>
  );
}
