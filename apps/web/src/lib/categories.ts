export const CATEGORIES = [
  { value: "tech", label: "Technology & Software" },
  { value: "saas", label: "SaaS & Cloud" },
  { value: "dev-tools", label: "Developer Tools" },
  { value: "ai-ml", label: "AI & Machine Learning" },
  { value: "fintech", label: "FinTech" },
  { value: "crypto", label: "Crypto & Web3" },
  { value: "finance", label: "Finance & Investing" },
  { value: "business", label: "Business Tools" },
  { value: "gaming", label: "Gaming & Esports" },
  { value: "education", label: "Education & Learning" },
  { value: "lifestyle", label: "Lifestyle & Wellness" },
  { value: "marketing", label: "Marketing & Growth" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "health", label: "Health & Fitness" },
  { value: "other", label: "Other" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];
