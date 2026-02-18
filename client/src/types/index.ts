/* =========================================================
   🎨 Basic / Utility Types
========================================================= */

type ColorHex = `#${string}`;

/** ✅ 캐릭터/크리쳐 등급 */
export type EntityRank = "S" | "A" | "B" | "C" | "D";


/* =========================================================
   🧩 Shared / Reusable Types
========================================================= */

/** ✅ 서브이미지 설명: 요약/설명 분리 */
export type SubImage = {
  image: string;
  summary: string;       // 짧은 한줄/두줄
  description: string;   // 상세 설명(플레이버/서술)
};

export type SymbolColor = {
  name?: string;
  hex: ColorHex;
};

/** ✅ 캐릭터/크리쳐 공용 베이스 */
export type EntityBase = {
  id: string;
  name: string;

  /** ✅ 등급 추가 */
  rank: EntityRank;

  subCategories: string[];

  profileImage: string;
  mainImage: string;
  // ❌ mainImageDesc 제거

  subImages: SubImage[];

  tags: string[];

  /** ✅ 기존 description 분리 */
  summary: string;       // 카드/리스트용 요약
  description: string;   // 상세 본문
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

  /** (선택) 월드 내부 크리쳐도 동일하게 나누고 싶다면 아래처럼 */
  summary: string;
  description: string;
}

export interface WorldCharacter {
  id: string;
  name: string;
  image: string;

  /** (선택) 월드 내부 크리쳐도 동일하게 나누고 싶다면 아래처럼 */
  summary: string;
  description: string;
}

export interface WorldData {
  id: string;
  name: string;
  description: string;

  iconImage: string;
  mainImage: string;
  backgroundImage: string;

  characters: WorldCharacter[];
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
  currentPage: "home" | "worlds" | "characters" | "creatures" | "profile";
  editMode: boolean;

  selectedWorldId?: string;
  selectedCharacterId?: string;
  selectedCreatureId?: string;
}