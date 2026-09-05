export type PaymentStage = "preparing" | "connecting" | "confirming" | "analysing" | "finishing";

export const PAYMENT_STAGE_LABEL: Record<PaymentStage, string> = {
  preparing: "Preparing",
  connecting: "Connecting",
  confirming: "Confirming Payment",
  analysing: "Analysing",
  finishing: "Finishing",
};
