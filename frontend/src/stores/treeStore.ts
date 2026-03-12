import { create } from "zustand";
import type { TalentTree, SkillNode } from "@/types";

interface TreeStore {
  activeTree: TalentTree | null;
  selectedNode: SkillNode | null;
  setActiveTree: (tree: TalentTree | null) => void;
  setSelectedNode: (node: SkillNode | null) => void;
  updateNodeState: (nodeId: string, state: SkillNode["state"]) => void;
}

export const useTreeStore = create<TreeStore>((set) => ({
  activeTree: null,
  selectedNode: null,

  setActiveTree: (tree) => set({ activeTree: tree }),

  setSelectedNode: (node) => set({ selectedNode: node }),

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
}));
