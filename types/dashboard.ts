export type StatMetric = {
  label: string;
  value: string;
  hint: string;
  tone: "green" | "gold" | "purple" | "blue" | "red";
};

export type PipelineItem = {
  id: string;
  title: string;
  subtitle: string;
  amountLabel: string;
  status: string;
  href?: string;
};

export type DashboardSummary = {
  role: string;
  stats: StatMetric[];
  performanceTitle: string;
  performanceSeries: { label: string; value: number }[];
  itemsTitle: string;
  emptyMessage: string;
  items: PipelineItem[];
  kyc?: { pending: boolean; rejected: boolean; approved: boolean; remarks: string | null };
};
