"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Code2, PenTool, BarChart3, FlaskConical, Shuffle } from "lucide-react";
import { getAllTools, type ToolData, type ToolId } from "@/lib/pricingData";
import type { ToolInput, UseCase } from "@/lib/auditEngine";

const STORAGE_KEY = "spendlens_form_state";

const USE_CASE_OPTIONS: { value: UseCase; label: string; icon: React.ReactNode }[] = [
  { value: "coding", label: "Coding", icon: <Code2 className="w-4 h-4 mr-2" /> },
  { value: "writing", label: "Writing", icon: <PenTool className="w-4 h-4 mr-2" /> },
  { value: "data_analysis", label: "Data Analysis", icon: <BarChart3 className="w-4 h-4 mr-2" /> },
  { value: "research", label: "Research", icon: <FlaskConical className="w-4 h-4 mr-2" /> },
  { value: "mixed", label: "Mixed", icon: <Shuffle className="w-4 h-4 mr-2" /> },
];

interface FormState {
  selectedTools: Record<string, boolean>;
  toolInputs: Record<string, { planId: string; monthlySpend: number; seats: number }>;
  teamSize: number;
  useCase: UseCase;
}

interface SpendFormProps {
  onSubmit: (data: { tools: ToolInput[]; teamSize: number; useCase: UseCase }) => void;
  isLoading: boolean;
}

function getDefaultFormState(): FormState {
  return {
    selectedTools: {},
    toolInputs: {},
    teamSize: 1,
    useCase: "coding",
  };
}

function loadFormState(): FormState {
  if (typeof window === "undefined") return getDefaultFormState();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore parse errors
  }
  return getDefaultFormState();
}

export default function SpendForm({ onSubmit, isLoading }: SpendFormProps) {
  const [formState, setFormState] = useState<FormState>(getDefaultFormState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setFormState(loadFormState());
    setMounted(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
    } catch {
      // Ignore storage errors
    }
  }, [formState, mounted]);

  const allTools = getAllTools();

  const toggleTool = useCallback((toolId: string) => {
    setFormState((prev) => {
      const isSelected = !prev.selectedTools[toolId];
      const tool = allTools.find((t) => t.id === toolId);
      const firstPlan = tool?.plans[0];

      return {
        ...prev,
        selectedTools: { ...prev.selectedTools, [toolId]: isSelected },
        toolInputs: isSelected
          ? {
              ...prev.toolInputs,
              [toolId]: prev.toolInputs[toolId] || {
                planId: firstPlan?.id || "",
                monthlySpend: firstPlan?.pricePerUser || 0,
                seats: 1,
              },
            }
          : prev.toolInputs,
      };
    });
  }, [allTools]);

  const updateToolInput = useCallback(
    (toolId: string, field: string, value: string | number) => {
      setFormState((prev) => ({
        ...prev,
        toolInputs: {
          ...prev.toolInputs,
          [toolId]: { ...prev.toolInputs[toolId], [field]: value },
        },
      }));
    },
    []
  );

  const handlePlanChange = useCallback(
    (toolId: string, planId: string) => {
      const tool = allTools.find((t) => t.id === toolId);
      const plan = tool?.plans.find((p) => p.id === planId);

      setFormState((prev) => {
        const currentSeats = prev.toolInputs[toolId]?.seats || 1;
        const pricePerUser = plan?.pricePerUser || 0;
        const autoSpend =
          plan?.isApiDirect || plan?.isCustom
            ? prev.toolInputs[toolId]?.monthlySpend || 0
            : plan?.isPerUser
              ? pricePerUser * currentSeats
              : pricePerUser;

        return {
          ...prev,
          toolInputs: {
            ...prev.toolInputs,
            [toolId]: {
              ...prev.toolInputs[toolId],
              planId,
              monthlySpend: autoSpend,
            },
          },
        };
      });
    },
    [allTools]
  );

  const handleSeatsChange = useCallback(
    (toolId: string, seats: number) => {
      const tool = allTools.find((t) => t.id === toolId);

      setFormState((prev) => {
        const planId = prev.toolInputs[toolId]?.planId;
        const plan = tool?.plans.find((p) => p.id === planId);
        const pricePerUser = plan?.pricePerUser || 0;
        const autoSpend =
          plan?.isApiDirect || plan?.isCustom
            ? prev.toolInputs[toolId]?.monthlySpend || 0
            : plan?.isPerUser
              ? pricePerUser * seats
              : pricePerUser;

        return {
          ...prev,
          toolInputs: {
            ...prev.toolInputs,
            [toolId]: {
              ...prev.toolInputs[toolId],
              seats,
              monthlySpend: autoSpend,
            },
          },
        };
      });
    },
    [allTools]
  );

  const handleSubmit = () => {
    const tools: ToolInput[] = Object.entries(formState.selectedTools)
      .filter(([, selected]) => selected)
      .map(([toolId]) => ({
        toolId: toolId as ToolId,
        planId: formState.toolInputs[toolId]?.planId || "",
        monthlySpend: formState.toolInputs[toolId]?.monthlySpend || 0,
        seats: formState.toolInputs[toolId]?.seats || 1,
      }))
      .filter((t) => t.planId);

    if (tools.length === 0) return;

    onSubmit({
      tools,
      teamSize: formState.teamSize,
      useCase: formState.useCase,
    });
  };

  const selectedCount = Object.values(formState.selectedTools).filter(Boolean).length;
  const totalMonthly = Object.entries(formState.selectedTools)
    .filter(([, selected]) => selected)
    .reduce((sum, [toolId]) => sum + (formState.toolInputs[toolId]?.monthlySpend || 0), 0);

  return (
    <div className="space-y-10 pb-32">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0FF395]/10 border border-[#0FF395]/20 text-[#086841] text-xs font-bold uppercase tracking-widest">
          Step 1 of 2
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A1A1A]" id="spend-form-heading">
          What AI tools does your team use?
        </h2>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium">
          Select your tools below — we&apos;ll analyze your spend and find savings.
          Your data stays in your browser.
        </p>
      </div>

      {/* Global Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Label htmlFor="team-size" className="text-sm font-semibold text-[#1A1A1A]">
            Team Size (total devs/users)
          </Label>
          <Input
            id="team-size"
            type="number"
            min={1}
            max={10000}
            value={formState.teamSize}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                teamSize: parseInt(e.target.value) || 1,
              }))
            }
            className="bg-white border-zinc-200 shadow-sm focus-visible:ring-[#0FF395] focus-visible:border-[#0FF395] rounded-xl h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="use-case" className="text-sm font-semibold text-[#1A1A1A]">
            Primary Use Case
          </Label>
          <Select
            value={formState.useCase}
            onValueChange={(v) => {
              if (v) setFormState((prev) => ({ ...prev, useCase: v as UseCase }));
            }}
          >
            <SelectTrigger id="use-case" className="bg-white border-zinc-200 shadow-sm focus:ring-[#0FF395] rounded-xl h-11">
              <SelectValue>
                <div className="flex items-center">
                  {USE_CASE_OPTIONS.find((o) => o.value === formState.useCase)?.icon}
                  {USE_CASE_OPTIONS.find((o) => o.value === formState.useCase)?.label || "Select"}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {USE_CASE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center">
                    {opt.icon} {opt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tool Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 credex-stagger">
        {allTools.map((tool, index) => {
          const isSelected = !!formState.selectedTools[tool.id];
          const partnerIndex = index % 2 === 0 ? index + 1 : index - 1;
          const partner = allTools[partnerIndex];
          const partnerSelected = partner ? !!formState.selectedTools[partner.id] : false;

          return (
            <ToolCard
              key={tool.id}
              tool={tool}
              isSelected={isSelected}
              partnerSelected={partnerSelected}
              toolInput={
                formState.toolInputs[tool.id] || {
                  planId: tool.plans[0]?.id || "",
                  monthlySpend: tool.plans[0]?.pricePerUser || 0,
                  seats: 1,
                }
              }
              onToggle={() => toggleTool(tool.id)}
              onPlanChange={(planId) => handlePlanChange(tool.id, planId)}
              onSeatsChange={(seats) => handleSeatsChange(tool.id, seats)}
              onSpendChange={(spend) => updateToolInput(tool.id, "monthlySpend", spend)}
            />
          );
        })}
      </div>

      {/* Honeypot field — hidden from real users */}
      <div className="absolute opacity-0 pointer-events-none" aria-hidden="true" tabIndex={-1}>
        <input type="text" name="company_website" autoComplete="off" tabIndex={-1} />
      </div>

      {/* Submit Area — Floating Glassmorphic Bar */}
      <div className="sticky bottom-6 z-20 max-w-4xl mx-auto mt-12 px-2 sm:px-0 pointer-events-none">
        <div className="credex-glass rounded-2xl p-4 shadow-[0_8px_40px_rgba(0,37,26,0.12)] flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto border border-white/40">
          <div className="flex items-center gap-5 text-sm font-semibold">
            <span className="text-zinc-500">
              <span className="text-[#1A1A1A] font-bold text-base">{selectedCount}</span>{" "}
              tool{selectedCount !== 1 ? "s" : ""} selected
            </span>
            {totalMonthly > 0 && (
              <span className="text-zinc-500 flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-zinc-300" />
                <span className="text-[#1A1A1A] font-bold text-base">
                  ${totalMonthly.toLocaleString()}
                </span>
                /mo total
              </span>
            )}
          </div>
          <Button
            id="run-audit-button"
            size="lg"
            onClick={handleSubmit}
            disabled={selectedCount === 0 || isLoading}
            className="w-full sm:w-auto bg-[#0FF395] hover:bg-[#0FF395]/90 text-[#00251A] font-bold px-8 rounded-xl shadow-md shadow-[#0FF395]/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-lg hover:shadow-[#0FF395]/30 h-12 text-base"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-[#00251A]/20 border-t-[#00251A] rounded-full" />
                Analyzing...
              </span>
            ) : (
              <>
                Run Free Audit
                <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Tool Card Component ─────────────────────────────────────────────────────

interface ToolCardProps {
  tool: ToolData;
  isSelected: boolean;
  partnerSelected: boolean;
  toolInput?: { planId: string; monthlySpend: number; seats: number };
  onToggle: () => void;
  onPlanChange: (planId: string) => void;
  onSeatsChange: (seats: number) => void;
  onSpendChange: (spend: number) => void;
}

function ToolCard({
  tool,
  isSelected,
  partnerSelected,
  toolInput,
  onToggle,
  onPlanChange,
  onSeatsChange,
  onSpendChange,
}: ToolCardProps) {
  const selectedPlan = tool.plans.find((p) => p.id === toolInput?.planId);
  const showManualSpend = selectedPlan?.isApiDirect || selectedPlan?.isCustom;

  return (
    <Card
      className={`transition-all duration-300 cursor-pointer group bg-white credex-card-hover ${
        isSelected
          ? "border-[#0FF395] shadow-[0_0_0_1px_#0FF395,0_4px_20px_rgba(15,243,149,0.12)] bg-[#0FF395]/[0.03]"
          : "border-zinc-200/80 hover:border-zinc-300 hover:shadow-md"
      }`}
    >
      <CardHeader className="pb-3" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              id={`tool-${tool.id}`}
              checked={isSelected}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-[#00251A] data-[state=checked]:border-[#00251A] border-zinc-300 rounded-md h-5 w-5"
              aria-label={`Select ${tool.name}`}
            />
            <div>
              <CardTitle className="text-base font-bold text-[#1A1A1A]">{tool.name}</CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">{tool.vendor}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {tool.category.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-[10px] px-2.5 py-0.5 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 border-none font-semibold rounded-md">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      {toolInput && (
        <CardContent 
          className={`pt-0 space-y-4 transition-all duration-300 
            ${!isSelected && !partnerSelected ? "hidden" : ""} 
            ${!isSelected && partnerSelected ? "hidden md:block opacity-50 grayscale-[20%]" : ""}
          `}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-[#0FF395]/20 to-transparent mb-2" />

          {/* Plan Selection */}
          <div className="space-y-2">
            <Label htmlFor={`plan-${tool.id}`} className="text-xs font-semibold text-zinc-600">
              Plan
            </Label>
            <Select value={toolInput.planId} onValueChange={(v) => { if (v) onPlanChange(v); }}>
              <SelectTrigger id={`plan-${tool.id}`} className="h-10 text-sm bg-[#F4F4F4] border-zinc-200 shadow-sm focus:ring-[#0FF395] rounded-lg">
                <SelectValue placeholder="Select plan">
                  {(() => {
                    const plan = tool.plans.find((p) => p.id === toolInput.planId);
                    if (!plan) return "Select plan";
                    let label = plan.name;
                    if (plan.pricePerUser > 0 && !plan.isCustom) {
                      label += ` — $${plan.pricePerUser}${plan.isPerUser ? "/user" : ""}/mo`;
                    } else if (plan.pricePerUser === 0) {
                      label += " — Free";
                    } else if (plan.isCustom) {
                      label += " — Custom";
                    } else if (plan.isApiDirect) {
                      label += " — Usage-based";
                    }
                    return label;
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {tool.plans.map((plan) => {
                  let label = plan.name;
                  if (plan.pricePerUser > 0 && !plan.isCustom) {
                    label += ` — $${plan.pricePerUser}${plan.isPerUser ? "/user" : ""}/mo`;
                  } else if (plan.pricePerUser === 0) {
                    label += " — Free";
                  } else if (plan.isCustom) {
                    label += " — Custom";
                  } else if (plan.isApiDirect) {
                    label += " — Usage-based";
                  }
                  return (
                    <SelectItem key={plan.id} value={plan.id}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Configuration Section */}
          <div className="bg-[#F4F4F4]/50 rounded-lg p-3.5 border border-zinc-200/60 flex items-center justify-between gap-4">
            {showManualSpend ? (
              <div className="flex-1 space-y-2">
                <Label htmlFor={`spend-${tool.id}`} className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-2">
                  Monthly Spend ($)
                  <span className="text-[#FF6B4A] text-[9px] bg-[#FF6B4A]/10 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Estimate</span>
                </Label>
                <Input
                  id={`spend-${tool.id}`}
                  type="number"
                  min={0}
                  step={1}
                  value={toolInput.monthlySpend || ""}
                  onChange={(e) => onSpendChange(parseFloat(e.target.value) || 0)}
                  className="h-10 text-sm bg-white shadow-sm focus-visible:ring-[#0FF395] rounded-lg border-[#FF6B4A]/40 focus-visible:border-[#0FF395]"
                  placeholder="e.g. 500"
                />
              </div>
            ) : (
              <>
                {selectedPlan?.isPerUser ? (
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`seats-${tool.id}`} className="text-xs font-semibold text-[#1A1A1A]">
                      Users / Seats
                    </Label>
                    <Input
                      id={`seats-${tool.id}`}
                      type="number"
                      min={1}
                      max={10000}
                      value={toolInput.seats}
                      onChange={(e) => onSeatsChange(parseInt(e.target.value) || 1)}
                      className="h-10 text-sm bg-white border-zinc-200 shadow-sm focus-visible:ring-[#0FF395] rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-zinc-500 font-medium py-2">
                    Fixed price plan
                  </div>
                )}
                
                <div className="text-right pl-5 border-l border-zinc-200/80 min-w-[100px]">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Cost</p>
                  <p className="text-xl font-bold text-[#1A1A1A] leading-none">
                    ${toolInput.monthlySpend.toLocaleString()}
                    <span className="text-xs text-zinc-400 font-medium ml-0.5">/mo</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
