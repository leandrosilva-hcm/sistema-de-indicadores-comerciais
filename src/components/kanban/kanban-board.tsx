"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  KANBAN_STAGES,
  KanbanProject,
  FilterUser,
  FilterSegment,
} from "@/types/kanban";
import { KanbanColumn } from "./kanban-column";
import { KanbanFilters } from "./kanban-filters";
import { updateProjectStage } from "@/app/actions/projects";

interface KanbanBoardProps {
  initialProjects: KanbanProject[];
  users: FilterUser[];
  segments: FilterSegment[];
}

export function KanbanBoard({
  initialProjects,
  users,
  segments,
}: KanbanBoardProps) {
  const [projects, setProjects] = useState<KanbanProject[]>(initialProjects);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Prevent SSR hydration mismatch for drag-and-drop
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync when initialProjects updates
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // Filter projects based on user controls
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (selectedUser && project.owner.id !== selectedUser) {
        return false;
      }
      if (selectedSegment && project.segment?.id !== selectedSegment) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = project.projectName.toLowerCase().includes(query);
        const matchesCompany = project.companyName.toLowerCase().includes(query);
        const matchesOwner = project.owner.name.toLowerCase().includes(query);
        if (!matchesName && !matchesCompany && !matchesOwner) {
          return false;
        }
      }
      return true;
    });
  }, [projects, selectedUser, selectedSegment, searchQuery]);

  // Total pipeline value of all active projects
  const totalPipelineValue = useMemo(() => {
    return filteredProjects.reduce(
      (acc, p) => acc + (p.estimatedValue || 0),
      0
    );
  }, [filteredProjects]);

  // Group filtered projects by stage
  const projectsByStage = useMemo(() => {
    const map: Record<string, KanbanProject[]> = {};
    for (const stage of KANBAN_STAGES) {
      map[stage.id] = [];
    }
    for (const project of filteredProjects) {
      if (map[project.stage]) {
        map[project.stage].push(project);
      } else {
        // Fallback for unknown stages
        map[KANBAN_STAGES[0].id].push(project);
      }
    }
    return map;
  }, [filteredProjects]);

  // Handle Drag & Drop
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;

    // Previous state for rollback
    const previousProjects = [...projects];

    // Optimistically update projects state
    setProjects((prev) => {
      const updated = prev.map((proj) => {
        if (proj.id === draggableId) {
          return {
            ...proj,
            stage: destStage,
            updatedAt: new Date(),
          };
        }
        return proj;
      });
      return updated;
    });

    // If stage actually changed, persist in database via Server Action
    if (sourceStage !== destStage) {
      startTransition(async () => {
        const res = await updateProjectStage(draggableId, destStage);
        if (!res.success) {
          console.error("Erro ao salvar nova etapa:", res.error);
          // Rollback on failure
          setProjects(previousProjects);
          alert("Não foi possível atualizar a etapa no servidor. Revertendo...");
        }
      });
    }
  };

  const handleResetFilters = () => {
    setSelectedUser("");
    setSelectedSegment("");
    setSearchQuery("");
  };

  if (!isMounted) {
    return (
      <div className="space-y-4">
        {/* Skeleton Filters */}
        <div className="h-16 w-full rounded-xl bg-card border border-border animate-pulse" />
        {/* Skeleton Columns */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((s) => (
            <div
              key={s.id}
              className="h-[550px] w-80 shrink-0 rounded-xl bg-muted/30 border border-border animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Top Controls & Filters */}
      <KanbanFilters
        users={users}
        segments={segments}
        selectedUser={selectedUser}
        selectedSegment={selectedSegment}
        searchQuery={searchQuery}
        onUserChange={setSelectedUser}
        onSegmentChange={setSelectedSegment}
        onSearchChange={setSearchQuery}
        onReset={handleResetFilters}
        totalProjects={projects.length}
        filteredCount={filteredProjects.length}
        totalPipelineValue={totalPipelineValue}
      />

      {/* Drag & Drop Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto pb-6 pt-1 select-none">
          {KANBAN_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              projects={projectsByStage[stage.id] || []}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

