export type Role = "admin" | "client";

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  country: string | null;
  website: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  company_id: string | null;
  role: Role;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Diagnostic {
  id: string;
  company_id: string;
  status: "in_progress" | "completed";
  form_data: Record<string, unknown>;
  ai_analysis: DiagnosticAnalysis | null;
  created_at: string;
  updated_at: string;
}

export interface DiagnosticAnalysis {
  executive_summary: string;
  foda: {
    fortalezas: string[];
    oportunidades: string[];
    debilidades: string[];
    amenazas: string[];
  };
  key_findings: { title: string; impact: string; description: string }[];
  opportunities: { title: string; description: string; actionable: string }[];
  market_analysis: string;
  scores: {
    comercial: { score: number; justification: string };
    marketing: { score: number; justification: string };
    operaciones: { score: number; justification: string };
    marca: { score: number; justification: string };
    digital: { score: number; justification: string };
  };
}

export interface StrategicPlan {
  id: string;
  company_id: string;
  diagnostic_id: string | null;
  content: StrategicPlanContent;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StrategicPlanContent {
  positioning: string;
  segmentation: string;
  value_proposition: string;
  strategies: {
    comercial: string;
    marketing: string;
    content: string;
    brand: string;
    operations: string;
  };
  competitive_analysis: string;
  roadmap: {
    phase_1: { period: string; focus: string; actions: string[] };
    phase_2: { period: string; focus: string; actions: string[] };
    phase_3: { period: string; focus: string; actions: string[] };
  };
  kpis: { name: string; target: string; rationale: string }[];
}

export interface SmartObjective {
  id: string;
  company_id: string;
  plan_id: string | null;
  title: string;
  specific: string | null;
  measurable: string | null;
  achievable: string | null;
  relevant: string | null;
  time_bound: string | null;
  kpi: string | null;
  target_value: string | null;
  current_value: string | null;
  status: "pending" | "in_progress" | "completed" | "at_risk";
  owner: string | null;
}

export interface Action {
  id: string;
  company_id: string;
  objective_id: string | null;
  title: string;
  description: string | null;
  owner: string | null;
  due_date: string | null;
  status: "todo" | "in_progress" | "review" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientContext {
  company: Company;
  diagnostic?: Diagnostic;
  strategicPlan?: StrategicPlan;
  openActions?: Action[];
}
