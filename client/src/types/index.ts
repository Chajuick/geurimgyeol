/* =========================================================
    🎨 Basic / Utility Types
========================================================= */

export type ColorHex = `#${string}`;

/** ✅ UUID처럼 쓰는 로컬 ID */
export type ID = string;

/** ✅ 이미지 리소스 */
export type ImageRef = string;

/** ✅ 공용 텍스트 블록(요약/설명) */
export type TextBlock = {
  summary: string;       // 짧은 한줄/두줄
  description: string;   // 상세 설명(플레이버/서술)
};

/** ✅ 공용 메타(정렬/표시) */
export type Meta = {
  /** 정렬용(작을수록 먼저) */
  order?: number;
  /** 즐겨찾기/상단 고정 */
  pinned?: boolean;
  /** 숨김(데이터 유지하고 UI에서만 숨길 때) */
  hidden?: boolean;
  /** 생성/수정 기록(선택) */
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
};


/* =========================================================
    🏷️ Rank System (User Customizable)
========================================================= */

/** ✅ 등급(티어) 1개 정의: 유저가 label/색/순서/추가삭제 가능 */
export type RankTier = {
  id: ID;            // 내부 참조용(절대 안 바뀌는 키)
  label: string;     // 화면 표시명(유저가 커스텀) 예: "S", "전설", "심연"
  short?: string;    // 아주 짧은 표기(선택) 예: "S"
  color?: ColorHex;  // 배지/프레임 색(선택)
  order: number;     // 정렬(작을수록 먼저)
  weight?: number;   // 희귀/강도(정렬/필터에 사용) (선택)
  meta?: Meta;
};

/** ✅ 등급 세트: 캐릭터/크리쳐가 서로 다른 세트 사용 가능 */
export type RankSet = {
  id: ID;
  name: string;          // 예: "Character Ranks", "Creature Threat"
  tiers: RankTier[];
  defaultTierId?: ID;    // 신규 생성 시 기본 등급
  meta?: Meta;
};


/* =========================================================
    🖼️ Frame Presets (Card Border Effects)
========================================================= */

/** ✅ 카드 보더/프레임 이펙트 프리셋 ID
 *  - 네가 만든 1~10번 + 옵션들을 고정 ID로 관리
 *  - 추후 더 추가하면 유니온에 계속 붙이면 됨
 */
export type FramePresetId =
  | "none"              // 1) 없음
  | "border"            // 2) 기본 보더
  | "glow-soft"         // 3) 약한 발광
  | "glow-strong"       // 4) 강한 발광
  | "targeting"         // 5) 조준 효과
  | "scan-sweep"        // 6) 테두리 빛이 훑는 효과
  | "glass-surface"     // 7) 전체 유리 질감
  | "steel-surface"     // 8) 전체 강철 질감

/** ✅ 여러 프레임 프리셋을 레이어처럼 합성 */
export type FrameStack = {
  /** 순서대로 렌더(뒤 → 앞). ex) ["corner-brackets","holo-border"] */
  presets: FramePresetId[];

  /** 공통 튜닝값(선택) */
  thickness?: number;     // px
  intensity?: number;     // 0~1 (전체 opacity 스케일)
};

/** ✅ 등급별 프레임 오버라이드 */
export type RankFrameOverride = {
  rankId: ID;                 // RankTier.id
  mode: "append" | "replace"; // 기본에 추가 / 기본을 교체
  stack: FrameStack;
};

/** ✅ 캐릭터/크리쳐 메뉴별 프레임 설정 */
export type EntityMenuFrameSettings = {
  /** 모든 카드 공통 기본 프레임 */
  base: FrameStack;

  /** 선택 상태(selected)에서만 추가로 얹고 싶은 프레임(선택) */
  selectedExtra?: FrameStack;

  /** 등급별 오버라이드(선택) */
  byRank?: RankFrameOverride[];
};


/* =========================================================
    🧩 Shared / Reusable Types
========================================================= */

/** ✅ 서브이미지 설명: 요약/설명 분리 */
export type SubImage = {
  image: ImageRef;
  summary: string;
  description: string;
};

export type SymbolColor = {
  id?: ID;
  name?: string;
  hex: ColorHex;
};

/** ✅ 캐릭터/크리쳐 공용 베이스 */
export type EntityBase = {
  id: ID;
  name: string;

  /** ✅ 등급은 ID 참조(유저 커스텀 안전) */
  rankId: ID;

  subCategories: string[];

  profileImage: ImageRef;
  mainImage: ImageRef;

  subImages: SubImage[];

  tags: string[];

  symbolColors: SymbolColor[];

  /** ✅ 기존 description 분리 */
  summary: string;       // 카드/리스트용 요약
  description: string;   // 상세 본문

  /** ✅ 선택: 정렬/표시 */
  meta?: Meta;
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
  profileImage: ImageRef;
  socialLinks: SocialLink[];
}


/* =========================================================
    📚 World Encyclopedia (Terms / Events)
========================================================= */

/** ✅ 월드 내 “고유명사/용어/항목” 공용 베이스 */
export type WorldEntryBase = {
  id: ID;
  title: string;
  summary: string;
  description: string;

  image?: ImageRef;     // 대표 이미지(선택)
  icon?: ImageRef;      // 아이콘(선택)

  tags?: string[];
  meta?: Meta;

  /** ✅ 선택: 다른 엔티티와 연결(도감/위키 상호 링크) */
  links?: {
    worldIds?: ID[];
    characterIds?: ID[];
    creatureIds?: ID[];
    entryIds?: ID[]; // 다른 고유명사와 연결
    eventIds?: ID[]; // 사건과 연결
  };
};

/** ✅ 월드 내 “용어/항목” 분류(Kind) 정의: 유저가 추가/삭제/라벨 변경 가능 */
export type WorldProperNounKindDef = {
  id: ID;          // 내부 키 (절대 안 바꾸는 값) 예: "place", "org", "hollow"
  label: string;   // 화면 표시명 예: "장소", "조직", "공동"
  icon?: string;   // 선택: lucide 이름 같은 걸로 저장해도 됨
  color?: ColorHex;// 선택: 배지 컬러
  meta?: Meta;     // order/pinned/hidden 등
};

/** ✅ 고유명사(용어) 타입 */
export type WorldProperNounKindId = ID;

export type WorldProperNoun = WorldEntryBase & {
  kindId: WorldProperNounKindId;
};


/* =========================================================
    🗓️ World Time / Date System
========================================================= */

export type WorldEra = {
  id: ID;
  name: string;      // 예: "기원전", "기원후", "쥬라기"
  short?: string;    // 예: "BC", "AD", "JUR"
  mode: "signed-year" | "named-era";
  order?: number;
  meta?: Meta;
};

export type WorldYearSuffix = {
  id: ID;
  label: string;     // 예: "년", "AE", "Y.E."
  order?: number;
  meta?: Meta;
};

export type WorldDate = {
  eraId: ID;          // WorldEra.id
  year: number;       // 예: 120, 3, -50 (signed-year 체계면 음수도 가능)
  suffixId?: ID;      // WorldYearSuffix.id
  note?: string;      // 예: "봄", "3월", "대전 직전"
};

export type WorldDateRange =
  | { kind: "point"; at: WorldDate }
  | { kind: "range"; from: WorldDate; to?: WorldDate };

export type WorldChronology = {
  eras: WorldEra[];
  yearSuffixes: WorldYearSuffix[];

  defaultEraId?: ID;
  defaultSuffixId?: ID;

  displayFormat?: "prefix-first" | "year-first";
  meta?: Meta;
};


/* =========================================================
    ⚔️ World Events
========================================================= */

export type WorldEvent = WorldEntryBase & {
  kind: "event";

  /** ✅ 발생 날짜(필수) */
  date: WorldDateRange;

  /** ✅ 타임라인 표시 여부 */
  showOnTimeline: boolean;

  /** ✅ 선택: 타임라인 강조(중요 사건) */
  importance?: 1 | 2 | 3 | 4 | 5;
};


/* =========================================================
    🌍 World Domain
========================================================= */

export interface WorldCharacterRef {
  id: ID;
  characterId: ID;
}

export interface WorldCreatureRef {
  id: ID;
  creatureId: ID;
}

export interface WorldCreature {
  id: ID;
  name: string;
  image: ImageRef;
  summary: string;
  description: string;
  meta?: Meta;
}

export interface WorldCharacter {
  id: ID;
  name: string;
  image: ImageRef;
  summary: string;
  description: string;
  meta?: Meta;
}

export interface WorldData {
  id: ID;
  name: string;
  description: string;

  iconImage: ImageRef;
  mainImage: ImageRef;
  backgroundImage: ImageRef;

  characters?: WorldCharacter[];
  creatures?: WorldCreature[];

  worldCharacters: WorldCharacterRef[];
  worldCreatures: WorldCreatureRef[];

  chronology?: WorldChronology;

  properNouns?: WorldProperNoun[];

  properNounKinds?: WorldProperNounKindDef[];
  defaultProperNounKindId?: ID;

  events?: WorldEvent[];

  meta?: Meta;
}


/* =========================================================
    🧙 Character Domain
========================================================= */

export interface CharacterData extends EntityBase { }


/* =========================================================
    🐉 Creature Domain
========================================================= */

export interface CreatureData extends EntityBase { }


/* =========================================================
    🏷️ Settings Domain
========================================================= */

export interface CategoryItem {
  main: string;
  subs: string[];
}

export interface SettingsData {
  heroBackgroundImage: ImageRef;

  characterCategories: CategoryItem[];
  creatureCategories: CategoryItem[];

  editMode: boolean;

  /** ✅ 유저 커스텀 등급 세트 (캐릭터/크리쳐 분리) */
  rankSets: {
    characters: RankSet;
    creatures: RankSet;
  };

  /** ✅ 메뉴별 카드 프레임 설정 (⚙️에서 조절) */
  frameSettings: {
    characters: EntityMenuFrameSettings;
    creatures: EntityMenuFrameSettings;
  };
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

  selectedWorldId?: ID;
  selectedCharacterId?: ID;
  selectedCreatureId?: ID;
}