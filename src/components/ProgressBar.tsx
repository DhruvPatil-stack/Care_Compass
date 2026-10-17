interface ProgressBarProps {
  completed: number;
  total: number;
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="w-full" aria-label={`${pct}% of tasks completed`}>
      <div className="flex justify-between text-sm text-slate-600 mb-1">
        <span>{completed} of {total} tasks done</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
