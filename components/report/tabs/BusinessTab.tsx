import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AnalysisReportData } from "@/lib/types";

function CheckRow({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-foreground/90">{label}</span>
      {ok ? (
        <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <X className="size-4 text-destructive" />
      )}
    </div>
  );
}

export function BusinessTab({ report }: { report: AnalysisReportData }) {
  const business = report.business;

  if (!business) {
    return <p className="text-sm text-muted-foreground">No business data available.</p>;
  }

  const signals = [
    business.hasPricing && "Pricing",
    business.hasFreeTrialSignal && "Free trial",
    business.hasEnterpriseSignal && "Enterprise",
    business.businessModel?.hasSaasSignals?.value && "SaaS",
    business.businessModel?.hasEcommerceSignals?.value && "E-commerce",
    business.businessModel?.hasMarketplaceSignals?.value && "Marketplace",
  ].filter(Boolean) as string[];

  const hasContactInfo =
    (business.email && business.email.length > 0) ||
    (business.phone && business.phone.length > 0) ||
    (business.socialLinks && business.socialLinks.length > 0);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{business.businessName?.value ?? business.pageTitle ?? "Business"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {business.description?.value && (
            <p className="text-sm text-foreground/90">{business.description.value}</p>
          )}
          {(business.primaryCta || business.ctaUrl) && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">CTA</span>
              <Badge variant="secondary">{business.primaryCta ?? business.ctaUrl}</Badge>
            </div>
          )}
          {signals.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {signals.map((signal) => (
                <Badge key={signal} className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {signal}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact & social</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <CheckRow label="Contact page" ok={business.hasContactPage} />
          <Separator />
          <CheckRow label="Support page" ok={business.hasSupportPage} />

          {business.email && business.email.length > 0 && (
            <div className="flex justify-between gap-3 pt-1">
              <span className="text-muted-foreground">Email</span>
              <span className="truncate">{business.email.join(", ")}</span>
            </div>
          )}
          {business.phone && business.phone.length > 0 && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Phone</span>
              <span className="truncate">{business.phone.join(", ")}</span>
            </div>
          )}
          {business.socialLinks && business.socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {business.socialLinks.map((link) => (
                <a
                  key={link}
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate rounded-full bg-muted px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {link.replace(/^https?:\/\//, "")}
                </a>
              ))}
            </div>
          )}
          {!hasContactInfo && (
            <p className="pt-1 text-muted-foreground">No contact or social data found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
