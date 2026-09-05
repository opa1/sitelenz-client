"use client";

import { Drawer, DrawerHeader, DrawerPanel, DrawerPopup, DrawerTitle } from "@/components/ui/drawer";
import { SidebarContent } from "@/components/layout/SidebarContent";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isDesktop: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ isDesktop, open, onOpenChange }: SidebarProps) {
  if (isDesktop) {
    return (
      <aside
        className={cn(
          "shrink-0 overflow-hidden border-r border-border transition-[width] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]",
          open ? "w-80" : "w-0",
        )}
      >
        <div className="h-full w-80 p-4">
          <SidebarContent />
        </div>
      </aside>
    );
  }

  return (
    <Drawer position="left" open={open} onOpenChange={onOpenChange}>
      <DrawerPopup variant="inset" showCloseButton>
        <DrawerHeader>
          <DrawerTitle className="text-2xl">History</DrawerTitle>
        </DrawerHeader>
        <DrawerPanel scrollable={false} className="flex min-h-0 flex-1 flex-col">
          <SidebarContent onNavigate={() => onOpenChange(false)} />
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  );
}
