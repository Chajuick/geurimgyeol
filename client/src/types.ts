// 프로젝트 작업 단계
export type WorkStage = 
  | 'rough' 
  | 'lineart' 
  | 'basecolor' 
  | 'shading' 
  | 'detail' 
  | 'correction' 
  | 'final';

export const STAGE_LABELS: Record<WorkStage, string> = {
  rough: '러프',
  lineart: '선화',
  basecolor: '밑색',
  shading: '명암',
  detail: '묘사',
  correction: '보정',
  final: '작품'
};

// 단계별 이미지 데이터
export interface StageImage {
  stage: WorkStage;
  imageUrl: string | null;
  description: string;
  enabled: boolean;
}

// 프로젝트 데이터
export interface Project {
  id: string;
  title: string;
  comment: string;
  learnings: string;
  memo: string;
  startDate: string;
  endDate: string;
  publishDate: string;
  tools: string[];
  subject: string;
  tags: string[];
  stages: StageImage[];
  createdAt: string;
  updatedAt: string;
}

// 갤러리 액자 스타일
export interface FrameStyle {
  id: string;
  name: string;
  borderWidth: number;
  borderColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge';
  backgroundColor: string;
  padding: number;
  shadowSize: number;
  shadowColor: string;
  isCustom: boolean;
  isTransparent?: boolean;
}

// 갤러리 배경
export interface GalleryBackground {
  id: string;
  name: string;
  imageUrl: string;
  isCustom: boolean;
}

// 갤러리 아이템 (배치된 작품)
export interface GalleryItem {
  id: string;
  projectId: string;
  frameId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
}

// 개별 갤러리 데이터
export interface GalleryData {
  id: string;
  name: string;
  backgroundId: string;
  items: GalleryItem[];
  height: number;
}

// 갤러리 설정
export interface GallerySettings {
  backgroundId: string;
  items: GalleryItem[];
  height: number;
  name: string;
}

// 프로필 정보
export interface Profile {
  name: string;
  bio: string;
  avatarUrl: string | null;
  website: string;
  social: {
    instagram?: string;
    twitter?: string;
    behance?: string;
    artstation?: string;
  };
}

// 앱 전역 상태
export interface AppState {
  projects: Project[];
  frames: FrameStyle[];
  backgrounds: GalleryBackground[];
  galleryDataMap: Record<string, GalleryData>;
  galleries: { id: string; name: string }[];
  currentGalleryId: string;
  profile: Profile;
}
