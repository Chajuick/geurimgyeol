import { AppState, Project, FrameStyle, GalleryBackground, GallerySettings, Profile } from '@/types';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'illustrator-portfolio-data';

// 기본 액자 스타일
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

// 기본 갤러리 배경
const DEFAULT_BACKGROUNDS: GalleryBackground[] = [
  {
    id: 'bg-1',
    name: '갤러리 월',
    imageUrl: 'https://private-us-east-1.manuscdn.com/sessionFile/V1f5tyyxqY2Izs5W4gKdwN/sandbox/rsyIFu0fe6tjiDw7Wzjexf-img-2_1770294204000_na1fn_Z2FsbGVyeS1iYWNrZ3JvdW5kLTE.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVjFmNXR5eXhxWTJJenM1VzRnS2R3Ti9zYW5kYm94L3JzeUlGdTBmZTZ0amlEdzdXempleGYtaW1nLTJfMTc3MDI5NDIwNDAwMF9uYTFmbl9aMkZzYkdWeWVTMWlZV05yWjNKdmRXNWtMVEUucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=MxvZwzAjFMY348nfM1ywWycG-qg~IRN7gpCSgXc1AJkzLvSyTUxF8KT9QgMEkvDIDZy~igC2Dcclfde7h8hAfls~sZ9hHhqG4ByuVJmGXww-BD6LMAuhPmkqz47GzERbYY8vg6~jXkg2EL0m-zzJvp9uhVslOfeuwNx7hCsUUIuN~cVU6aDr8QxqkfdaQRGnWuBCD6STfRcQh6pQlzMPI1S1A1178F-kFEWPjqDWAdAdkh2NWatQbLbkgVE3X8mmf08wH8vRxFnJQ4LUh8EZ9d0gYA6bF8C17w4Xmc2Cdeioz01Z2jqxSl7ue7~YKKKXRP4bQaMbFuxyCa-tNefiUA__',
    isCustom: false
  },
  {
    id: 'bg-2',
    name: '수채화 그라데이션',
    imageUrl: 'https://private-us-east-1.manuscdn.com/sessionFile/V1f5tyyxqY2Izs5W4gKdwN/sandbox/rsyIFu0fe6tjiDw7Wzjexf-img-3_1770294202000_na1fn_Z2FsbGVyeS1iYWNrZ3JvdW5kLTI.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVjFmNXR5eXhxWTJJenM1VzRnS2R3Ti9zYW5kYm94L3JzeUlGdTBmZTZ0amlEdzdXempleGYtaW1nLTNfMTc3MDI5NDIwMjAwMF9uYTFmbl9aMkZzYkdWeWVTMWlZV05yWjNKdmRXNWtMVEkucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Ut3v0y-hGKuiQoPZqpJX4AcB5WTRdvq81xJg--S4HbUKSuDXHCu0ultadTVniKWmYIqbJWqf-SmMBeVukeIf4r1tKzwjmplds5a2tvOzoLBfl926ICf9oojmj95FKR-fKCnT-DvqOT4iAZPVOjGXJTwJO6aeXLJ4WaVOP7FLVqwbxQTmooR2rUtEqZf4CIECWt~mVn2zjTFtdyeYORNYLmUEwvQMq6JxypBadsCio6dTQg37dpmUxpnZn3d82guGCqxPkkB6urISCSU0JByAKkYGH7hsJwcN0CaNFRHl5ckDDTUBxtzXq6s1y3qovwVE7dboQK~ccUGWTr3ldUCSPA__',
    isCustom: false
  }
];

// 기본 프로필
const DEFAULT_PROFILE: Profile = {
  name: '일러스트레이터',
  bio: '나의 작품 세계를 기록하고 전시합니다.',
  avatarUrl: null,
  website: '',
  social: {}
};

// 초기 상태
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

// 로컬 스토리지에서 데이터 로드
export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_STATE;
    
    const parsed = JSON.parse(stored);
    return {
      ...INITIAL_STATE,
      ...parsed,
      // 기본 프레임과 배경은 항상 유지
      frames: [...DEFAULT_FRAMES, ...(parsed.frames?.filter((f: FrameStyle) => f.isCustom) || [])],
      backgrounds: [...DEFAULT_BACKGROUNDS, ...(parsed.backgrounds?.filter((b: GalleryBackground) => b.isCustom) || [])]
    };
  } catch (error) {
    console.error('Failed to load state:', error);
    return INITIAL_STATE;
  }
}

// 로컬 스토리지에 데이터 저장
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

// 프로젝트 생성
export function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
  const now = new Date().toISOString();
  return {
    ...data,
    id: nanoid(),
    createdAt: now,
    updatedAt: now
  };
}

// 프로젝트 업데이트
export function updateProject(project: Project): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString()
  };
}

// 이미지를 Base64로 변환
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 데이터 내보내기 (JSON)
export function exportData(state: AppState): void {
  const dataStr = JSON.stringify(state, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// 데이터 가져오기 (JSON)
export function importData(file: File): Promise<AppState> {
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
