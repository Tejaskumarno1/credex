/**
 * Pricing data for all AI tools supported by SpendLens.
 * All prices are monthly per-user unless otherwise noted.
 * Sources cited in PRICING_DATA.md at repo root.
 */

export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type PlanType = {
  id: string;
  name: string;
  pricePerUser: number; // monthly, 0 for free, -1 for custom/manual
  isPerUser: boolean; // true if price scales with seats
  isCustom: boolean; // true for enterprise/custom pricing
  isApiDirect: boolean; // true for API direct (manual spend entry)
  minRecommendedUsers?: number;
  maxRecommendedUsers?: number;
};

export type ToolData = {
  id: ToolId;
  name: string;
  vendor: string;
  category: ("coding" | "writing" | "data_analysis" | "research" | "mixed")[];
  plans: PlanType[];
  url: string;
};

export const PRICING_DATA: Record<ToolId, ToolData> = {
  cursor: {
    id: "cursor",
    name: "Cursor",
    vendor: "Anysphere",
    category: ["coding"],
    url: "https://www.cursor.com/pricing",
    plans: [
      {
        id: "cursor_hobby",
        name: "Hobby",
        pricePerUser: 0,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
      },
      {
        id: "cursor_pro",
        name: "Pro",
        pricePerUser: 20,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        maxRecommendedUsers: 50,
      },
      {
        id: "cursor_business",
        name: "Business",
        pricePerUser: 40,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        minRecommendedUsers: 5,
      },
      {
        id: "cursor_enterprise",
        name: "Enterprise",
        pricePerUser: -1,
        isPerUser: true,
        isCustom: true,
        isApiDirect: false,
        minRecommendedUsers: 50,
      },
    ],
  },
  github_copilot: {
    id: "github_copilot",
    name: "GitHub Copilot",
    vendor: "GitHub/Microsoft",
    category: ["coding"],
    url: "https://github.com/features/copilot#pricing",
    plans: [
      {
        id: "copilot_individual",
        name: "Individual",
        pricePerUser: 10,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        maxRecommendedUsers: 1,
      },
      {
        id: "copilot_business",
        name: "Business",
        pricePerUser: 19,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        minRecommendedUsers: 1,
        maxRecommendedUsers: 100,
      },
      {
        id: "copilot_enterprise",
        name: "Enterprise",
        pricePerUser: 39,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        minRecommendedUsers: 10,
      },
    ],
  },
  claude: {
    id: "claude",
    name: "Claude (Anthropic)",
    vendor: "Anthropic",
    category: ["coding", "writing", "research", "data_analysis", "mixed"],
    url: "https://www.anthropic.com/pricing",
    plans: [
      {
        id: "claude_free",
        name: "Free",
        pricePerUser: 0,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
      },
      {
        id: "claude_pro",
        name: "Pro",
        pricePerUser: 20,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        maxRecommendedUsers: 1,
      },
      {
        id: "claude_max",
        name: "Max",
        pricePerUser: 100,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        maxRecommendedUsers: 1,
      },
      {
        id: "claude_team",
        name: "Team",
        pricePerUser: 25,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        minRecommendedUsers: 2,
      },
      {
        id: "claude_enterprise",
        name: "Enterprise",
        pricePerUser: -1,
        isPerUser: true,
        isCustom: true,
        isApiDirect: false,
        minRecommendedUsers: 20,
      },
      {
        id: "claude_api",
        name: "API Direct",
        pricePerUser: -1,
        isPerUser: false,
        isCustom: false,
        isApiDirect: true,
      },
    ],
  },
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT (OpenAI)",
    vendor: "OpenAI",
    category: ["coding", "writing", "research", "data_analysis", "mixed"],
    url: "https://openai.com/chatgpt/pricing/",
    plans: [
      {
        id: "chatgpt_plus",
        name: "Plus",
        pricePerUser: 20,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        maxRecommendedUsers: 1,
      },
      {
        id: "chatgpt_team",
        name: "Team",
        pricePerUser: 30,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        minRecommendedUsers: 2,
      },
      {
        id: "chatgpt_enterprise",
        name: "Enterprise",
        pricePerUser: -1,
        isPerUser: true,
        isCustom: true,
        isApiDirect: false,
        minRecommendedUsers: 50,
      },
      {
        id: "chatgpt_api",
        name: "API Direct",
        pricePerUser: -1,
        isPerUser: false,
        isCustom: false,
        isApiDirect: true,
      },
    ],
  },
  anthropic_api: {
    id: "anthropic_api",
    name: "Anthropic API Direct",
    vendor: "Anthropic",
    category: ["coding", "writing", "research", "data_analysis", "mixed"],
    url: "https://www.anthropic.com/pricing#702cb110-e17d-41ff-bc46-ea0c2e968850",
    plans: [
      {
        id: "anthropic_api_direct",
        name: "API Direct",
        pricePerUser: -1,
        isPerUser: false,
        isCustom: false,
        isApiDirect: true,
      },
    ],
  },
  openai_api: {
    id: "openai_api",
    name: "OpenAI API Direct",
    vendor: "OpenAI",
    category: ["coding", "writing", "research", "data_analysis", "mixed"],
    url: "https://openai.com/api/pricing/",
    plans: [
      {
        id: "openai_api_direct",
        name: "API Direct",
        pricePerUser: -1,
        isPerUser: false,
        isCustom: false,
        isApiDirect: true,
      },
    ],
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    vendor: "Google",
    category: ["coding", "writing", "research", "data_analysis", "mixed"],
    url: "https://ai.google.dev/pricing",
    plans: [
      {
        id: "gemini_pro",
        name: "Pro",
        pricePerUser: 19.99,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        maxRecommendedUsers: 1,
      },
      {
        id: "gemini_ultra",
        name: "Ultra",
        pricePerUser: 249.99,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
        maxRecommendedUsers: 1,
      },
      {
        id: "gemini_api",
        name: "API",
        pricePerUser: -1,
        isPerUser: false,
        isCustom: false,
        isApiDirect: true,
      },
    ],
  },
  windsurf: {
    id: "windsurf",
    name: "Windsurf",
    vendor: "Codeium",
    category: ["coding"],
    url: "https://windsurf.com/pricing",
    plans: [
      {
        id: "windsurf_free",
        name: "Free",
        pricePerUser: 0,
        isPerUser: false,
        isCustom: false,
        isApiDirect: false,
      },
      {
        id: "windsurf_pro",
        name: "Pro",
        pricePerUser: 15,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
      },
      {
        id: "windsurf_teams",
        name: "Teams",
        pricePerUser: 35,
        isPerUser: true,
        isCustom: false,
        isApiDirect: false,
        minRecommendedUsers: 2,
      },
    ],
  },
};

/** Get a flat list of all tools */
export function getAllTools(): ToolData[] {
  return Object.values(PRICING_DATA);
}

/** Get a tool by its ID */
export function getToolById(id: ToolId): ToolData | undefined {
  return PRICING_DATA[id];
}

/** Get a specific plan for a tool */
export function getPlan(toolId: ToolId, planId: string): PlanType | undefined {
  return PRICING_DATA[toolId]?.plans.find((p) => p.id === planId);
}
