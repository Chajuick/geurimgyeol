import { AppState, Project, FrameStyle, GalleryBackground, GallerySettings, Profile } from '@/types';

/**
 * 파일 기반 데이터 관리 (public/data/portfolio.json에서 로드)
 * 로컬 스토리지 대신 프로젝트 내 JSON 파일을 사용
 */

const PORTFOLIO_DATA_URL = '/data/portfolio.json';

// 기본 상태 (파일 로드 실패 시)
const DEFAULT_FRAMES: FrameStyle[] = [
  {
    id: 'frame-1',
    name: '클래식 우드',
    borderWidth: 12,
    borderColor: '#8B7355',
    borderStyle: 'solid',
    backgroundColor: '#F5F1E8',
    padding: 8,
    shadowSize: 8,
    shadowColor: 'rgba(0,0,0,0.15)',
    isCustom: false
  },
  {
    id: 'frame-2',
    name: '미니멀 화이트',
    borderWidth: 6,
    borderColor: '#FFFFFF',
    borderStyle: 'solid',
    backgroundColor: '#FFFFFF',
    padding: 12,
    shadowSize: 4,
    shadowColor: 'rgba(0,0,0,0.1)',
    isCustom: false
  },
  {
    id: 'frame-3',
    name: '모던 블랙',
    borderWidth: 4,
    borderColor: '#2C2C2C',
    borderStyle: 'solid',
    backgroundColor: '#2C2C2C',
    padding: 6,
    shadowSize: 6,
    shadowColor: 'rgba(0,0,0,0.25)',
    isCustom: false
  },
  {
    id: 'frame-4',
    name: '엔티크 골드',
    borderWidth: 10,
    borderColor: '#D4AF37',
    borderStyle: 'ridge',
    backgroundColor: '#F5F1E8',
    padding: 10,
    shadowSize: 10,
    shadowColor: 'rgba(212,175,55,0.2)',
    isCustom: false
  },
  {
    id: 'frame-5',
    name: '내추럴 틸',
    borderWidth: 8,
    borderColor: '#7A9D96',
    borderStyle: 'solid',
    backgroundColor: '#E8E5DD',
    padding: 8,
    shadowSize: 6,
    shadowColor: 'rgba(122,157,150,0.15)',
    isCustom: false
  }
];

const DEFAULT_BACKGROUNDS: GalleryBackground[] = [
  {
    id: 'bg-1',
    name: '갤러리 월',
    imageUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663336206210/zJkKdAelSLBUdHLp.png',
    isCustom: false
  },
  {
    id: 'bg-2',
    name: '수채화 그라데이션',
    imageUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663336206210/YDNINrfhbEVodSUL.png',
    isCustom: false
  }
];

const DEFAULT_PROFILE: Profile = {
  name: '일러스트레이터',
  bio: '나의 작품 세계를 기록하고 전시합니다.',
  avatarUrl: null,
  website: '',
  social: {}
};

const INITIAL_STATE: AppState = {
  projects: [],
  frames: DEFAULT_FRAMES,
  backgrounds: DEFAULT_BACKGROUNDS,
  galleryDataMap: {
    'gallery-1': {
      id: 'gallery-1',
      name: 'Gallery 1',
      backgroundId: 'bg-1',
      items: [],
      height: 600
    }
  },
  galleries: [{ id: 'gallery-1', name: 'Gallery 1' }],
  currentGalleryId: 'gallery-1',
  profile: DEFAULT_PROFILE
};

/**
 * public/data/portfolio.json에서 데이터 로드
 */
export async function loadPortfolioFromFile(): Promise<AppState> {
  try {
    const response = await fetch(PORTFOLIO_DATA_URL);
    if (!response.ok) {
      console.warn(`Failed to load portfolio.json: ${response.status}`);
      return INITIAL_STATE;
    }

    const data = await response.json();
    
    // 데이터 검증 및 병합 (기본값과 합치기)
    return {
      projects: data.projects || [],
      frames: [...DEFAULT_FRAMES, ...(data.frames?.filter((f: FrameStyle) => f.isCustom) || [])],
      backgrounds: [...DEFAULT_BACKGROUNDS, ...(data.backgrounds?.filter((b: GalleryBackground) => b.isCustom) || [])],
      galleryDataMap: data.galleryDataMap || { 'gallery-1': { id: 'gallery-1', name: 'Gallery 1', backgroundId: 'bg-1', items: [], height: 600 } },
      galleries: data.galleries || [{ id: 'gallery-1', name: 'Gallery 1' }],
      currentGalleryId: data.currentGalleryId || 'gallery-1',
      profile: { ...DEFAULT_PROFILE, ...data.profile }
    };
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    return INITIAL_STATE;
  }
}

/**
 * 데이터를 JSON 파일로 내보내기 (다운로드)
 */
export function exportPortfolioToFile(state: AppState): void {
  const dataStr = JSON.stringify(state, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * JSON 파일에서 데이터 가져오기 (업로드)
 */
export function importPortfolioFromFile(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * 파일을 Base64로 변환
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 파일을 public/images에 저장하기 위한 경로 생성
 * (실제 저장은 백엔드에서 처리되어야 함)
 */
export function generateImagePath(projectId: string, stage: string, filename: string): string {
  return `/images/projects/${projectId}-${stage}-${filename}`;
}

/**
 * 로컬 스토리지에서 임시 데이터 로드 (하이브리드 모드)
 * 파일 로드 실패 시 로컬 스토리지 사용
 */
export function loadStateFromLocalStorage(): AppState | null {
  try {
    const stored = localStorage.getItem('illustrator-portfolio-data');
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * 로컬 스토리지에 데이터 저장 (임시 캐시용)
 */
export function saveStateToLocalStorage(state: AppState): void {
  try {
    localStorage.setItem('illustrator-portfolio-data', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}
