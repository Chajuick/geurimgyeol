import type { PortfolioData, WorldProperNounKindDef } from "@/types";

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  /* =========================================================
      👤 Profile
  ========================================================= */
  profile: {
    name: "",
    bio: "",
    profileImage: "",
    socialLinks: [],
  },

  /* =========================================================
      🌍 Worlds
  ========================================================= */
  worlds: [],

  /* =========================================================
      🧙 Characters
  ========================================================= */
  characters: [],

  /* =========================================================
      🐉 Creatures
  ========================================================= */
  creatures: [],

  /* =========================================================
      🏷️ Settings
  ========================================================= */
  settings: {
    heroBackgroundImage: "",

    characterCategories: [],
    creatureCategories: [],

    editMode: false,

    /* =========================
        🏷️ Rank Sets (기본값)
    ========================= */
    rankSets: {
      characters: {
        id: "rankset_characters",
        name: "Character Ranks",
        defaultTierId: "rank_c",
        tiers: [
          { id: "rank_s", label: "S", order: 0 },
          { id: "rank_a", label: "A", order: 1 },
          { id: "rank_b", label: "B", order: 2 },
          { id: "rank_c", label: "C", order: 3 },
          { id: "rank_d", label: "D", order: 4 },
        ],
      },

      creatures: {
        id: "rankset_creatures",
        name: "Creature Threat",
        defaultTierId: "threat_1",
        tiers: [
          { id: "threat_1", label: "I", order: 0 },
          { id: "threat_2", label: "II", order: 1 },
          { id: "threat_3", label: "III", order: 2 },
          { id: "threat_4", label: "IV", order: 3 },
          { id: "threat_5", label: "V", order: 4 },
        ],
      },
    },

    /* =========================
        🖼️ Frame Settings (기본)
    ========================= */
    frameSettings: {
      characters: {
        base: {
          presets: ["glow-soft"],
        },
      },

      creatures: {
        base: {
          presets: ["glow-soft"],
        },
      },
    },
  },
};


export const DEFAULT_WORLD_PROPER_NOUN_KINDS: WorldProperNounKindDef[] = [
  { id: "place",        label: "장소", meta: { order: 10 } },
  { id: "organization", label: "조직", meta: { order: 20 } },
  { id: "equipment",    label: "장비", meta: { order: 30 } },
  { id: "technology",   label: "기술", meta: { order: 40 } },
  { id: "concept",      label: "개념", meta: { order: 50 } },
  { id: "event",        label: "사건", meta: { order: 60 } },
  { id: "species",      label: "종족", meta: { order: 70 } },
  { id: "other",        label: "기타", meta: { order: 99 } },
];