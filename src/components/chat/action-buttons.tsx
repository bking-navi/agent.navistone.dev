"use client";

import { Button } from "@/components/ui/button";
import { Users, Download, Calendar, Rocket, Settings } from "lucide-react";
import type { ActionButton } from "@/types";

interface ActionButtonsProps {
  actions: ActionButton[];
  onAction: (action: ActionButton) => void;
}

const iconMap = {
  users: Users,
  download: Download,
  calendar: Calendar,
  rocket: Rocket,
  settings: Settings,
};

export function ActionButtons({ actions, onAction }: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {actions.map((action) => {
        const Icon = iconMap[action.icon as keyof typeof iconMap] || Users;
        return (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => onAction(action)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
