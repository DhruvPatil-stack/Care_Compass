import type { MaskResult } from "@/lib/parser";
import { Shield } from "lucide-react";

interface MaskPreviewProps {
  maskResult: MaskResult;
  onContinue: () => void;
}

export default function MaskPreview({ maskResult, onContinue }: MaskPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-blue-800 mb-2">
          <Shield size={18} aria-hidden="true" />
          Privacy Check
        </h2>
        <p className="text-sm text-blue-700 mb-3">
          Personal information was replaced with safe labels before processing.
        </p>
        {maskResult.masks.length > 0 ? (
          <ul className="space-y-1 mb-4">
            {maskResult.masks.map((mask, i) => (
              <li key={i} className="text-xs font-mono bg-white rounded border border-blue-200 px-2 py-1 text-slate-600">
                <span className="text-red-500 line-through">{mask.original}</span>
                {" => "}
                <span className="text-blue-700 font-semibold">{mask.replacement}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-blue-600 mb-3">No personal information detected.</p>
        )}
        <div className="text-xs font-mono bg-white border border-slate-200 rounded p-3 max-h-40 overflow-y-auto whitespace-pre-wrap text-slate-700">
          {maskResult.maskedText.slice(0, 800)}
          {maskResult.maskedText.length > 800 && "..."}
        </div>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Generate My Checklist
      </button>
    </div>
  );
}
