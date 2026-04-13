import { create } from "zustand";
import type { TalentTree, SkillNode } from "@/types";

interface TreeStore {
  activeTree: TalentTree | null;
  selectedNode: SkillNode | null;
  /** True while any node-completion API call is in-flight. Blocks concurrent completions. */
  completionPending: boolean;
  /** Whether the quest log panel is expanded (true) or collapsed to a rail (false). */
  questLogExpanded: boolean;
  setActiveTree: (tree: TalentTree | null) => void;
  setSelectedNode: (node: SkillNode | null) => void;
  setCompletionPending: (pending: boolean) => void;
  setQuestLogExpanded: (expanded: boolean) => void;
  updateNodeState: (nodeId: string, state: SkillNode["state"]) => void;
  /** Optimistically increment completed_nodes and earned_xp on the active tree. */
  incrementCompleted: (xpReward: number) => void;
  /** Revert an optimistic increment — called when the API call fails. */
  decrementCompleted: (xpReward: number) => void;
}

export const useTreeStore = create<TreeStore>((set) => ({
  activeTree: null,
  selectedNode: null,
  completionPending: false,
  questLogExpanded: false,

  setActiveTree: (tree) => set({ activeTree: tree }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setCompletionPending: (pending) => set({ completionPending: pending }),
  setQuestLogExpanded: (expanded) => set({ questLogExpanded: expanded }),

  updateNodeState: (nodeId, state) =>
    set((store) => {
      if (!store.activeTree) return store;
      return {
        activeTree: {
          ...store.activeTree,
          nodes: store.activeTree.nodes.map((n) =>
            n.id === nodeId ? { ...n, state } : n
          ),
        },
      };
    }),

  incrementCompleted: (xpReward) =>
    set((store) => {
      if (!store.activeTree) return store;
      return {
        activeTree: {
          ...store.activeTree,
          completed_nodes: store.activeTree.completed_nodes + 1,
          earned_xp: store.activeTree.earned_xp + xpReward,
        },
      };
    }),

  decrementCompleted: (xpReward) =>
    set((store) => {
      if (!store.activeTree) return store;
      return {
        activeTree: {
          ...store.activeTree,
          completed_nodes: Math.max(0, store.activeTree.completed_nodes - 1),
          earned_xp: Math.max(0, store.activeTree.earned_xp - xpReward),
        },
      };
    }),
}));
