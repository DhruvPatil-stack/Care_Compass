"use client";
import { useEffect, useReducer, useCallback } from "react";
import { Sun, Clock, Moon, HelpCircle, AlertCircle } from "lucide-react";
import type { ParseResult, ParsedItem, UnparsedLine } from "@/lib/parser";
import TaskCard from "./TaskCard";
import ProgressBar from "./ProgressBar";

const STORAGE_KEY = "carecompass_checklist_v1";

interface ChecklistState {
  checked: Record<string, boolean>;
}

type ChecklistAction = { type: "TOGGLE"; id: string } | { type: "LOAD"; state: ChecklistState };

function reducer(state: ChecklistState, action: ChecklistAction): ChecklistState {
  if (action.type === "TOGGLE") {
    return { checked: { ...state.checked, [action.id]: !state.checked[action.id] } };
  }
  if (action.type === "LOAD") return action.state;
  return state;
}

function itemId(item: ParsedItem): string {
  return `${item.type}-${item.sourceStart}`;
}

interface ChecklistViewProps {
  parseResult: ParseResult;
  sourceText: string;
}

export default function ChecklistView({ parseResult, sourceText }: ChecklistViewProps) {
  const [state, dispatch] = useReducer(reducer, { checked: {} });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: "LOAD", state: JSON.parse(saved) as ChecklistState });
    } catch {
      /* ignore stale or missing storage */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage quota exceeded or private browsing */
    }
  }, [state]);

  const toggle = useCallback((id: string) => dispatch({ type: "TOGGLE", id }), []);

  const allItems: ParsedItem[] = [
    ...parseResult.medications,
    ...parseResult.followUps,
    ...parseResult.restrictions,
  ];

  const morningItems = allItems.filter(
    (i) => i.type === "medication" && i.timesOfDay.morning,
  );
  const afternoonItems = allItems.filter(
    (i) => i.type === "medication" && i.timesOfDay.afternoon,
  );
  const eveningItems = allItems.filter(
    (i) => i.type === "medication" && i.timesOfDay.evening,
  );
  const asNeededItems = allItems.filter(
    (i) => i.type === "medication" && i.timesOfDay.asNeeded,
  );
  const otherItems = allItems.filter((i) => i.type !== "medication");

  const totalItems = allItems.length;
  const completedCount = allItems.filter((i) => state.checked[itemId(i)]).length;

  return (
    <div className="space-y-6">
      <ProgressBar completed={completedCount} total={totalItems} />

      <TimeSection
        icon={<Sun size={18} className="text-amber-500" aria-hidden="true" />}
        title="Morning"
        items={morningItems}
        checked={state.checked}
        onToggle={toggle}
        sourceText={sourceText}
      />
      <TimeSection
        icon={<Clock size={18} className="text-blue-500" aria-hidden="true" />}
        title="Afternoon"
        items={afternoonItems}
        checked={state.checked}
        onToggle={toggle}
        sourceText={sourceText}
      />
      <TimeSection
        icon={<Moon size={18} className="text-indigo-500" aria-hidden="true" />}
        title="Evening"
        items={eveningItems}
        checked={state.checked}
        onToggle={toggle}
        sourceText={sourceText}
      />
      <TimeSection
        icon={<HelpCircle size={18} className="text-slate-500" aria-hidden="true" />}
        title="As Needed"
        items={asNeededItems}
        checked={state.checked}
        onToggle={toggle}
        sourceText={sourceText}
      />
      <TimeSection
        icon={<Clock size={18} className="text-green-500" aria-hidden="true" />}
        title="Appointments and Restrictions"
        items={otherItems}
        checked={state.checked}
        onToggle={toggle}
        sourceText={sourceText}
      />

      <UnparsedPanel unparsed={parseResult.unparsed} />
    </div>
  );
}

function TimeSection({
  icon,
  title,
  items,
  checked,
  onToggle,
  sourceText,
}: {
  icon: React.ReactNode;
  title: string;
  items: ParsedItem[];
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  sourceText: string;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={`section-${title}`}>
      <h2 id={`section-${title}`} className="flex items-center gap-2 text-base font-semibold text-slate-700 mb-2">
        {icon}
        {title}
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <TaskCard
            key={itemId(item)}
            item={item}
            checked={!!checked[itemId(item)]}
            onToggle={() => onToggle(itemId(item))}
            sourceText={sourceText}
          />
        ))}
      </div>
    </section>
  );
}

function UnparsedPanel({ unparsed }: { unparsed: UnparsedLine[] }) {
  if (unparsed.length === 0) return null;
  return (
    <section aria-labelledby="unparsed-heading">
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <h2 id="unparsed-heading" className="flex items-center gap-2 text-base font-semibold text-amber-800 mb-3">
          <AlertCircle size={18} aria-hidden="true" />
          Questions for Your Nurse
        </h2>
        <p className="text-sm text-amber-700 mb-3">
          We could not read the lines below. Ask your nurse or care team about each one.
        </p>
        <ul className="space-y-2">
          {unparsed.map((line) => (
            <li key={line.sourceStart} className="text-sm bg-white rounded border border-amber-200 px-3 py-2 text-slate-700 font-mono">
              {line.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
