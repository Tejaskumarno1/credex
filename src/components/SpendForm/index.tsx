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
import { getAllTools, type ToolData, type ToolId } from "@/lib/pricingData";
import type { ToolInput, UseCase } from "@/lib/auditEngine";

const STORAGE_KEY = "spendlens_form_state";

const USE_CASE_OPTIONS: { value: UseCase; label: string; icon: string }[] = [
  { value: "coding", label: "Coding", icon: "💻" },
  { value: "writing", label: "Writing", icon: "✍️" },
  { value: "data_analysis", label: "Data Analysis", icon: "📊" },
  { value: "research", label: "Research", icon: "🔬" },
  { value: "mixed", label: "Mixed", icon: "🔀" },
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold tracking-tight" id="spend-form-heading">
          What AI tools does your team use?
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Select your tools below — we&apos;ll analyze your spend and find savings.
          Your data stays in your browser.
        </p>
      </div>

      {/* Global Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Label htmlFor="team-size" className="text-sm font-medium">
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
            className="bg-background/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="use-case" className="text-sm font-medium">
            Primary Use Case
          </Label>
          <Select
            value={formState.useCase}
            onValueChange={(v) => {
              if (v) setFormState((prev) => ({ ...prev, useCase: v as UseCase }));
            }}
          >
            <SelectTrigger id="use-case" className="bg-background/50 border-border/50">
              <SelectValue>
                {USE_CASE_OPTIONS.find((o) => o.value === formState.useCase)?.icon}{" "}
                {USE_CASE_OPTIONS.find((o) => o.value === formState.useCase)?.label || "Select"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {USE_CASE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tool Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            isSelected={!!formState.selectedTools[tool.id]}
            toolInput={formState.toolInputs[tool.id]}
            onToggle={() => toggleTool(tool.id)}
            onPlanChange={(planId) => handlePlanChange(tool.id, planId)}
            onSeatsChange={(seats) => handleSeatsChange(tool.id, seats)}
            onSpendChange={(spend) => updateToolInput(tool.id, "monthlySpend", spend)}
          />
        ))}
      </div>

      {/* Honeypot field — hidden from real users */}
      <div className="absolute opacity-0 pointer-events-none" aria-hidden="true" tabIndex={-1}>
        <input type="text" name="company_website" autoComplete="off" tabIndex={-1} />
      </div>

      {/* Submit Area */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border/50 -mx-4 px-4 py-4 md:-mx-8 md:px-8 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{selectedCount}</span>{" "}
              tool{selectedCount !== 1 ? "s" : ""} selected
            </span>
            {totalMonthly > 0 && (
              <span>
                •{" "}
                <span className="font-semibold text-foreground">
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
            className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white font-semibold px-8 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Analyzing...
              </span>
            ) : (
              "Run Free Audit →"
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
  toolInput?: { planId: string; monthlySpend: number; seats: number };
  onToggle: () => void;
  onPlanChange: (planId: string) => void;
  onSeatsChange: (seats: number) => void;
  onSpendChange: (spend: number) => void;
}

function ToolCard({
  tool,
  isSelected,
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
      className={`transition-all duration-300 cursor-pointer group ${
        isSelected
          ? "border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10"
          : "border-border/50 hover:border-border hover:bg-accent/50"
      }`}
    >
      <CardHeader className="pb-3" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              id={`tool-${tool.id}`}
              checked={isSelected}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
              aria-label={`Select ${tool.name}`}
            />
            <div>
              <CardTitle className="text-base font-semibold">{tool.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{tool.vendor}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {tool.category.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-[10px] px-1.5 py-0">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      {isSelected && toolInput && (
        <CardContent className="pt-0 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Plan Selection */}
          <div className="space-y-1.5">
            <Label htmlFor={`plan-${tool.id}`} className="text-xs font-medium text-muted-foreground">
              Plan
            </Label>
            <Select value={toolInput.planId} onValueChange={(v) => { if (v) onPlanChange(v); }}>
              <SelectTrigger id={`plan-${tool.id}`} className="h-9 text-sm bg-background/50">
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

          {/* Seats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`seats-${tool.id}`} className="text-xs font-medium text-muted-foreground">
                Users / Seats
              </Label>
              <Input
                id={`seats-${tool.id}`}
                type="number"
                min={1}
                max={10000}
                value={toolInput.seats}
                onChange={(e) => onSeatsChange(parseInt(e.target.value) || 1)}
                className="h-9 text-sm bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`spend-${tool.id}`} className="text-xs font-medium text-muted-foreground">
                Monthly Spend ($)
              </Label>
              <Input
                id={`spend-${tool.id}`}
                type="number"
                min={0}
                step={1}
                value={toolInput.monthlySpend}
                onChange={(e) => onSpendChange(parseFloat(e.target.value) || 0)}
                className={`h-9 text-sm bg-background/50 ${showManualSpend ? "border-amber-500/50" : ""}`}
                placeholder={showManualSpend ? "Enter monthly spend" : undefined}
              />
            </div>
          </div>

          {showManualSpend && (
            <p className="text-xs text-amber-500/80">
              ⓘ Enter your actual monthly spend for this service
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
