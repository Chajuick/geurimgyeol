// Portfolio Data Types
export interface PortfolioData {
  profile: ProfileData;
  worlds: WorldData[];
  characters: CharacterData[];
  creatures: CreatureData[];
  settings: SettingsData;
}

export interface ProfileData {
  name: string;
  bio: string;
  profileImage: string;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
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

export interface CharacterData {
  id: string;
  name: string;

  // ✅ 서브만 멀티
  subCategories: string[];

  profileImage: string;
  mainImage: string;
  mainImageDesc?: string;
  subImages: { image: string; description: string }[];
  tags: string[];
  description: string;
}

export interface CharacterImage {
  image: string;
  description: string;
}

export type CreatureData = {
  id: string;
  name: string;

  // ✅ 서브만 멀티
  subCategories: string[];

  profileImage: string;
  mainImage: string;
  mainImageDesc?: string;
  subImages: { image: string; description: string }[];
  tags: string[];
  description: string;
};

export interface CreatureImage {
  image: string;
  description: string;
}

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

export interface UIState {
  currentPage: 'home' | 'worlds' | 'characters' | 'creatures' | 'profile';
  editMode: boolean;
  selectedWorldId?: string;
  selectedCharacterId?: string;
  selectedCreatureId?: string;
}
