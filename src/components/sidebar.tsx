"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Kanban,
  Clock,
  CalendarDays,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  {
    label: "Kanban",
    href: "/kanban",
    icon: Kanban,
    description: "Quadro de oportunidades",
  },
  {
    label: "Linha do Tempo",
    href: "/timeline",
    icon: Clock,
    description: "Histórico de interações",
  },
  {
    label: "Agenda Semanal",
    href: "/agenda",
    icon: CalendarDays,
    description: "Planejado vs. Executado",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Indicadores gerenciais",
  },
  {
    label: "Segmentos",
    href: "/segmentos",
    icon: Layers,
    description: "Parametrização de mercado",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-zinc-850 bg-black text-white transition-all duration-300 shrink-0 select-none z-30",
        collapsed ? "w-18" : "w-64"
      )}
    >
      {/* Header com Logotipo Oficial da HCM Engenharia */}
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800/80 px-4 bg-black">
        <div className="relative size-10 shrink-0 flex items-center justify-center rounded-lg bg-zinc-900/60 p-1 border border-zinc-800">
          <Image
            src="/HCM-Engenharia-Branca.png"
            alt="HCM Engenharia"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
        </div>

        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-extrabold tracking-wider text-white">
              HCM ENGENHARIA
            </span>
            <span className="truncate text-[10px] font-bold uppercase tracking-widest text-[#dc911b]">
              Painel Comercial
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                isActive
                  ? "bg-[#dc911b] text-black font-semibold shadow-xs"
                  : "text-zinc-400 hover:bg-zinc-900/90 hover:text-white",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "size-5 shrink-0 transition-colors",
                  isActive
                    ? "text-black"
                    : "text-zinc-400 group-hover:text-[#dc911b]"
                )}
              />
              {!collapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate leading-tight">{item.label}</span>
                  <span
                    className={cn(
                      "truncate text-[11px] font-normal transition-colors",
                      isActive
                        ? "text-black/80 font-medium"
                        : "text-zinc-500 group-hover:text-zinc-400"
                    )}
                  >
                    {item.description}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer com Toggle de Recolhimento */}
      <div className="border-t border-zinc-800/80 p-3 bg-black">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer",
            collapsed ? "justify-center px-0" : "justify-between px-3"
          )}
          title={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          {!collapsed && (
            <span className="text-xs text-zinc-400 font-medium">
              Recolher menu
            </span>
          )}
          {collapsed ? (
            <ChevronRight className="size-4 text-[#dc911b]" />
          ) : (
            <ChevronLeft className="size-4 text-zinc-400" />
          )}
        </Button>
      </div>
    </aside>
  );
}
