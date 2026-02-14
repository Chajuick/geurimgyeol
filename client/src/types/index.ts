/* =========================================================
   🎨 Basic / Utility Types
========================================================= */

type ColorHex = `#${string}`;


/* =========================================================
   🧩 Shared / Reusable Types
========================================================= */

export type SubImage = {
  image: string;
  description: string;
};

export type SymbolColor = {
  name?: string;
  hex: ColorHex;
};

/** 캐릭터/크리쳐 공용 베이스 */
export type EntityBase = {
  id: string;
  name: string;

  subCategories: string[];

  profileImage: string;
  mainImage: string;
  mainImageDesc?: string;

  subImages: SubImage[];

  tags: string[];
  description: string;

  symbolColors?: SymbolColor[];
};


/* =========================================================
   👤 Profile Domain
========================================================= */

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface ProfileData {
  name: string;
  bio: string;
  profileImage: string;
  socialLinks: SocialLink[];
}


/* =========================================================
   🌍 World Domain
========================================================= */

export interface WorldCharacterRef {
  id: string;
  characterId: string;
}

export interface WorldCreatureRef {
  id: string;
  creatureId: string;
}

export interface WorldCreature {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface WorldData {
  id: string;
  name: string;
  description: string;

  iconImage: string;
  mainImage: string;
  backgroundImage: string;

  creatures: WorldCreature[];

  relatedCharacters: string[];
  relatedCreatures: string[];

  worldCharacters: WorldCharacterRef[];
  worldCreatures: WorldCreatureRef[];
}


/* =========================================================
   🧙 Character Domain
========================================================= */

export interface CharacterData extends EntityBase {}


/* =========================================================
   🐉 Creature Domain
========================================================= */

export interface CreatureData extends EntityBase {}


/* =========================================================
   🏷️ Settings Domain
========================================================= */

export interface CategoryItem {
  main: string;
  subs: string[];
}

export interface SettingsData {
  heroBackgroundImage: string;

  characterCategories: CategoryItem[];
  creatureCategories: CategoryItem[];

  editMode: boolean;
}


/* =========================================================
   📦 Root Portfolio Data
========================================================= */

export interface PortfolioData {
  profile: ProfileData;
  worlds: WorldData[];
  characters: CharacterData[];
  creatures: CreatureData[];
  settings: SettingsData;
}


/* =========================================================
   🖥️ UI State (Client Only)
========================================================= */

export interface UIState {
  currentPage:
    | "home"
    | "worlds"
    | "characters"
    | "creatures"
    | "profile";

  editMode: boolean;

  selectedWorldId?: string;
  selectedCharacterId?: string;
  selectedCreatureId?: string;
}