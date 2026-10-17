"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ParsedItem } from "@/lib/parser";

interface TaskCardProps {
  item: ParsedItem;
  checked: boolean;
  onToggle: () => void;
  sourceText: string;
}

export default function TaskCard({ item, checked, onToggle, sourceText }: TaskCardProps) {
  const [showSource, setShowSource] = useState(false);

  const before = sourceText.slice(0, item.sourceStart);
  const highlight = sourceText.slice(item.sourceStart, item.sourceEnd);
  const after = sourceText.slice(item.sourceEnd);

  return (
    <div className={`rounded-lg border p-3 transition-colors ${checked ? "bg-slate-100 border-slate-200" : "bg-white border-slate-200 shadow-sm"}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={`task-${item.sourceStart}`}
          checked={checked}
          onChange={onToggle}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          aria-label={item.plainText}
        />
        <label
          htmlFor={`task-${item.sourceStart}`}
          className={`text-sm leading-relaxed cursor-pointer flex-1 ${checked ? "line-through text-slate-400" : "text-slate-800"}`}
        >
          {item.plainText}
        </label>
        <button
          type="button"
          onClick={() => setShowSource((v) => !v)}
          aria-expanded={showSource}
          aria-label="Show original source text"
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          {showSource ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Source
        </button>
      </div>

      {showSource && (
        <div className="mt-2 ml-7 text-xs bg-slate-50 rounded p-2 font-mono border border-slate-200 leading-relaxed whitespace-pre-wrap">
          <span className="text-slate-400">{before.slice(-80)}</span>
          <span className="bg-yellow-200 text-yellow-900 rounded px-0.5">{highlight}</span>
          <span className="text-slate-400">{after.slice(0, 80)}</span>
        </div>
      )}
    </div>
  );
}
