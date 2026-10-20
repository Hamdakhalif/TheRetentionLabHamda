import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export function Choice({ value, onChange, options, testId, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; testId: string; label: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger data-testid={testId} aria-label={label} className="h-10 rounded-xl border-line bg-white text-sm text-espresso focus:ring-sagedeep/30">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-line bg-ivory">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} data-testid={`${testId}-option-${o.value.replace(/\s+/g, "-").toLowerCase()}`}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function RangeField({ label, value, display, min, max, step, onChange, testId, hint }: { label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void; testId: string; hint?: string }) {
  return (
    <div className="py-3">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <label className="text-sm text-cocoa">{label}</label>
        <span data-testid={`${testId}-value`} className="font-mono text-sm font-medium text-espresso">{display}</span>
      </div>
      <Slider
        data-testid={testId}
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v: number[]) => onChange(v[0])}
        className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-espresso [&_[role=slider]]:bg-ivory [&>span:first-child]:h-1 [&>span:first-child]:bg-line [&>span:first-child>span]:bg-espresso"
      />
      {hint && <p className="mt-2 text-[11px] text-cocoa/70">{hint}</p>}
    </div>
  );
}
