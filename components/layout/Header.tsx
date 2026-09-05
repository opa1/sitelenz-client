"use client";

import { useState } from "react";
import {
  BookOpen,
  Check,
  EllipsisVertical,
  GitFork,
  LogOut,
  Moon,
  PanelLeft,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useWallet } from "@txnlab/use-wallet-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NetworkDropdown, NETWORKS } from "@/components/layout/NetworkDropdown";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useSwitchNetwork } from "@/hooks/useSwitchNetwork";
import { DEFAULT_NETWORK, DOCS_URL, GITHUB_URL } from "@/lib/env";

interface HeaderProps {
  connected?: boolean;
  onToggleSidebar?: () => void;
}

export function Header({ connected = true, onToggleSidebar }: HeaderProps) {
  const { activeWallet } = useWallet();
  const { network, switchNetwork } = useSwitchNetwork();
  const { resolvedTheme, setTheme } = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const showNetworkToggle = DEFAULT_NETWORK !== "mainnet";

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-2">
        {connected && onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
            className="mr-1"
          >
            <PanelLeft />
          </Button>
        )}
        {!connected && DOCS_URL && (
          <Button
            variant="ghost"
            nativeButton={false}
            render={<a href={DOCS_URL} target="_blank" rel="noreferrer" />}
          >
            <BookOpen />
            Docs
          </Button>
        )}
        {!connected && GITHUB_URL && (
          <Button
            variant="ghost"
            nativeButton={false}
            render={<a href={GITHUB_URL} target="_blank" rel="noreferrer" />}
          >
            <GitFork />
            Github
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Desktop: theme, network, and disconnect as separate controls */}
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {showNetworkToggle && <NetworkDropdown />}
          {connected && (
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              <LogOut />
              Disconnect
            </Button>
          )}
        </div>

        {/* Mobile: theme, network, and disconnect combined into one menu */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-lg" aria-label="Network and account" />}
            >
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56 p-2">
              <DropdownMenuItem
                className="gap-2.5 py-3 text-base"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              >
                {resolvedTheme === "dark" ? <Sun /> : <Moon />}
                {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
              </DropdownMenuItem>
              {showNetworkToggle && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Network</DropdownMenuLabel>
                    {NETWORKS.map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => void switchNetwork(option.id)}
                        className="gap-2.5 py-3 text-base"
                      >
                        <span className={`size-2.5 rounded-full ${option.dotClassName}`} />
                        {option.label}
                        {option.id === network && <Check className="ml-auto size-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
              {connected && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    className="py-3 text-base"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <LogOut />
                    Disconnect
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect wallet?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll need to reconnect {activeWallet?.metadata.name ?? "your wallet"} to
              submit or view analyses again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void activeWallet?.disconnect();
              }}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
