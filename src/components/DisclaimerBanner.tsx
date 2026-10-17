import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="bg-amber-50 border-b-2 border-amber-400 px-4 py-2 flex items-center gap-2 text-amber-900 text-sm font-medium no-print"
    >
      <AlertTriangle size={16} aria-hidden="true" />
      <span>
        Practice tool only. Do not enter real patient data. This is not medical advice.
      </span>
    </div>
  );
}
