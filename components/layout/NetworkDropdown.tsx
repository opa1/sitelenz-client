"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSwitchNetwork } from "@/hooks/useSwitchNetwork";
import type { Network } from "@/lib/types";

export const NETWORKS: { id: Network; label: string; dotClassName: string }[] = [
  { id: "testnet", label: "Testnet", dotClassName: "bg-amber-500" },
  { id: "mainnet", label: "Mainnet", dotClassName: "bg-emerald-500" },
];

export function NetworkDropdown() {
  const { network, switchNetwork } = useSwitchNetwork();
  const current = NETWORKS.find((n) => n.id === network) ?? NETWORKS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="gap-2.5">
            <span className={`size-2.5 rounded-full ${current.dotClassName}`} />
            {current.label}
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="min-w-56 p-2">
        {NETWORKS.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => void switchNetwork(option.id)}
            className="gap-2.5 py-3 text-base"
          >
            <span className={`size-2.5 rounded-full ${option.dotClassName}`} />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
