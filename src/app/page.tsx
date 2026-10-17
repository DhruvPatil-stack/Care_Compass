"use client";
import { useState, useTransition, useRef } from "react";
import { ClipboardList, Loader2 } from "lucide-react";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import MaskPreview from "@/components/MaskPreview";
import ChecklistView from "@/components/ChecklistView";
import type { MaskResult, ParseResult } from "@/lib/parser";

const SAMPLE_SUMMARY = `Discharge Summary - Synthetic Example Only

Patient: Jane Sample
MRN: 000-000-000
Date of Birth: 01/01/1970

Discharge Diagnosis: Pneumonia, community-acquired

Medications:
- Azithromycin 500 mg PO daily for 5 days
- Prednisone 40 mg PO daily for 5 days
- Guaifenesin 400 mg PO BID PRN cough
- Acetaminophen 650 mg PO q6h PRN fever or pain
- Albuterol inhaler 2 puffs inhaled q4h PRN shortness of breath

Follow-up:
- See your primary care doctor within 7 days
- Pulmonology appointment in 4 weeks

Activity:
- No strenuous exercise for 2 weeks
- Ambulate as tolerated; rest when short of breath

Diet:
- Regular diet; drink plenty of fluids (8 glasses of water daily)

Wound Care:
- No wounds; IV site may be bruised -- normal

Return Precautions:
- Return to ER if fever over 101.5 F, severe shortness of breath, chest pain, or confusion`;

type Step = "input" | "mask" | "result";

export default function HomePage() {
  const [text, setText] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [maskResult, setMaskResult] = useState<MaskResult | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [maskedText, setMaskedText] = useState("");
  const [isPending, startTransition] = useTransition();
  const startTime = useRef(0);

  async function handleGenerate() {
    if (!text.trim()) return;
    startTime.current = Date.now();
    startTransition(async () => {
      const { normalize, maskPHI, parseDischarge } = await import("@/lib/parser");
      const normalized = normalize(text);
      const mr = maskPHI(normalized);
      setMaskResult(mr);
      setMaskedText(mr.maskedText);
      setStep("mask");
    });
  }

  function handleContinue() {
    if (!maskResult) return;
    startTransition(() => {
      // Dynamic import already done above; re-use maskedText
      import("@/lib/parser").then(({ parseDischarge }) => {
        const pr = parseDischarge(maskResult.maskedText);
        setParseResult(pr);
        setStep("result");
      });
    });
  }

  function handleReset() {
    setStep("input");
    setMaskResult(null);
    setParseResult(null);
    setMaskedText("");
  }

  const showSpinner = isPending && Date.now() - startTime.current > 300;

  return (
    <>
      <DisclaimerBanner />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8" id="main-content">
        <header className="mb-8 text-center">
          <div className="flex justify-center mb-3">
            <ClipboardList size={40} className="text-blue-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">CareCompass</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Paste your discharge summary and get a plain-language daily checklist.
          </p>
        </header>

        {step === "input" && (
          <InputStep
            text={text}
            onTextChange={setText}
            onLoadSample={() => setText(SAMPLE_SUMMARY)}
            onGenerate={handleGenerate}
            loading={showSpinner}
          />
        )}

        {step === "mask" && maskResult && (
          <div>
            <MaskPreview maskResult={maskResult} onContinue={handleContinue} />
            {showSpinner && (
              <div className="flex justify-center mt-4" aria-live="polite">
                <Loader2 size={24} className="animate-spin text-blue-600" aria-label="Loading" />
              </div>
            )}
          </div>
        )}

        {step === "result" && parseResult && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Your Daily Checklist</h2>
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded no-print"
              >
                Start over
              </button>
            </div>
            <ChecklistView parseResult={parseResult} sourceText={maskedText} />
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-4 no-print">
        CareCompass -- Practice tool. Not medical advice. &copy; 2026 Dhruv Patil
      </footer>
    </>
  );
}

function InputStep({
  text,
  onTextChange,
  onLoadSample,
  onGenerate,
  loading,
}: {
  text: string;
  onTextChange: (v: string) => void;
  onLoadSample: () => void;
  onGenerate: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="discharge-input" className="block text-sm font-medium text-slate-700 mb-1">
          Paste your discharge summary below
        </label>
        <textarea
          id="discharge-input"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste the text from your hospital discharge paperwork here..."
          rows={14}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          aria-describedby="input-hint"
          maxLength={60000}
        />
        <p id="input-hint" className="text-xs text-slate-400 mt-1">
          Use the sample button to try with example data. Never paste real patient data.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onLoadSample}
          className="flex-1 border border-slate-300 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
        >
          Load sample
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!text.trim() || loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Processing...
            </>
          ) : (
            "Generate roadmap"
          )}
        </button>
      </div>
    </div>
  );
}
