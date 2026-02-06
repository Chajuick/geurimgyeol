import { create } from 'zustand';
import { AppState, Project, FrameStyle, GalleryBackground, GalleryItem, Profile, GalleryData } from '@/types';
import { createProject, updateProject } from './storage';
import { loadPortfolioFromFile, exportPortfolioToFile, importPortfolioFromFile, loadStateFromLocalStorage, saveStateToLocalStorage } from './fileStorage';

interface StoreActions {
  // 프로젝트 관리
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  
  // 액자 관리
  addFrame: (frame: Omit<FrameStyle, 'id' | 'isCustom'>) => void;
  updateFrame: (id: string, updates: Partial<FrameStyle>) => void;
  deleteFrame: (id: string) => void;
  
  // 배경 관리
  addBackground: (background: Omit<GalleryBackground, 'id' | 'isCustom'>) => void;
  deleteBackground: (id: string) => void;
  
  // 갤러리 관리
  setGalleryBackground: (backgroundId: string) => void;
  setGalleryHeight: (height: number) => void;
  setGalleryName: (name: string) => void;
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  updateGalleryItem: (id: string, updates: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  clearGallery: () => void;
  
  // 다중 갤러리 관리
  createGallery: (name: string) => void;
  deleteGallery: (id: string) => void;
  switchGallery: (id: string) => void;
  renameGallery: (id: string, name: string) => void;
  
  // 프로필 관리
  updateProfile: (updates: Partial<Profile>) => void;
  
  // 데이터 관리
  loadData: () => Promise<void>;
  resetData: () => void;
  importData: (data: AppState) => void;
  exportData: () => void;
  importDataFromFile: (file: File) => Promise<void>;
}

type Store = AppState & StoreActions;

export const useStore = create<Store>((set, get) => {
  const saveAndSet = (updater: (state: AppState) => Partial<AppState>) => {
    set((state) => {
      const updates = updater(state);
      const newState = { ...state, ...updates };
      saveStateToLocalStorage(newState);
      return updates;
    });
  };

  return {
    // 초기 상태
    projects: [],
    frames: [],
    backgrounds: [],
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
    profile: { name: 'Illustrator', bio: '', avatarUrl: null, website: '', social: {} },

    // 프로젝트 관리
    addProject: (project) => {
      const newProject: Project = {
        ...project,
        id: `project-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveAndSet((state) => ({
        projects: [...state.projects, newProject]
      }));
    },

    updateProject: (id, updates) => {
      saveAndSet((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        )
      }));
    },

    deleteProject: (id) => {
      saveAndSet((state) => ({
        projects: state.projects.filter((p) => p.id !== id)
      }));
    },

    getProject: (id) => {
      const state = get();
      return state.projects.find((p) => p.id === id);
    },

    // 액자 관리
    addFrame: (frame) => {
      const newFrame: FrameStyle = {
        ...frame,
        id: `frame-${Date.now()}`,
        isCustom: true
      };
      saveAndSet((state) => ({
        frames: [...state.frames, newFrame]
      }));
    },

    updateFrame: (id, updates) => {
      saveAndSet((state) => ({
        frames: state.frames.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        )
      }));
    },

    deleteFrame: (id) => {
      saveAndSet((state) => ({
        frames: state.frames.filter((f) => f.id !== id)
      }));
    },

    // 배경 관리
    addBackground: (background) => {
      const newBackground: GalleryBackground = {
        ...background,
        id: `bg-${Date.now()}`,
        isCustom: true
      };
      saveAndSet((state) => ({
        backgrounds: [...state.backgrounds, newBackground]
      }));
    },

    deleteBackground: (id) => {
      saveAndSet((state) => ({
        backgrounds: state.backgrounds.filter((b) => b.id !== id)
      }));
    },

    // 갤러리 관리 - 갤러리별 독립적 데이터
    setGalleryBackground: (backgroundId) => {
      saveAndSet((state) => {
        const currentGallery = state.galleryDataMap[state.currentGalleryId];
        if (!currentGallery) return {};
        return {
          galleryDataMap: {
            ...state.galleryDataMap,
            [state.currentGalleryId]: {
              ...currentGallery,
              backgroundId
            }
          }
        };
      });
    },

    setGalleryHeight: (height) => {
      saveAndSet((state) => {
        const currentGallery = state.galleryDataMap[state.currentGalleryId];
        if (!currentGallery) return {};
        return {
          galleryDataMap: {
            ...state.galleryDataMap,
            [state.currentGalleryId]: {
              ...currentGallery,
              height
            }
          }
        };
      });
    },

    setGalleryName: (name) => {
      saveAndSet((state) => {
        const currentGallery = state.galleryDataMap[state.currentGalleryId];
        if (!currentGallery) return {};
        return {
          galleryDataMap: {
            ...state.galleryDataMap,
            [state.currentGalleryId]: {
              ...currentGallery,
              name
            }
          },
          galleries: state.galleries.map(g =>
            g.id === state.currentGalleryId ? { ...g, name } : g
          )
        };
      });
    },

    addGalleryItem: (itemData) => {
      const item: GalleryItem = {
        ...itemData,
        id: `item-${Date.now()}`
      };
      saveAndSet((state) => {
        const currentGallery = state.galleryDataMap[state.currentGalleryId];
        if (!currentGallery) return {};
        return {
          galleryDataMap: {
            ...state.galleryDataMap,
            [state.currentGalleryId]: {
              ...currentGallery,
              items: [...currentGallery.items, item]
            }
          }
        };
      });
    },

    updateGalleryItem: (id, updates) => {
      saveAndSet((state) => {
        const currentGallery = state.galleryDataMap[state.currentGalleryId];
        if (!currentGallery) return {};
        return {
          galleryDataMap: {
            ...state.galleryDataMap,
            [state.currentGalleryId]: {
              ...currentGallery,
              items: currentGallery.items.map((item) =>
                item.id === id ? { ...item, ...updates } : item
              )
            }
          }
        };
      });
    },

    deleteGalleryItem: (id) => {
      saveAndSet((state) => {
        const currentGallery = state.galleryDataMap[state.currentGalleryId];
        if (!currentGallery) return {};
        return {
          galleryDataMap: {
            ...state.galleryDataMap,
            [state.currentGalleryId]: {
              ...currentGallery,
              items: currentGallery.items.filter((item) => item.id !== id)
            }
          }
        };
      });
    },

    clearGallery: () => {
      saveAndSet((state) => {
        const currentGallery = state.galleryDataMap[state.currentGalleryId];
        if (!currentGallery) return {};
        return {
          galleryDataMap: {
            ...state.galleryDataMap,
            [state.currentGalleryId]: {
              ...currentGallery,
              items: []
            }
          }
        };
      });
    },

    // 다중 갤러리 관리
    createGallery: (name) => {
      const newGalleryId = `gallery-${Date.now()}`;
      saveAndSet((state) => ({
        galleryDataMap: {
          ...state.galleryDataMap,
          [newGalleryId]: {
            id: newGalleryId,
            name,
            backgroundId: 'bg-1',
            items: [],
            height: 600
          }
        },
        galleries: [...state.galleries, { id: newGalleryId, name }],
        currentGalleryId: newGalleryId
      }));
    },

    deleteGallery: (id) => {
      saveAndSet((state) => {
        const newGalleries = state.galleries.filter(g => g.id !== id);
        const newGalleryDataMap = { ...state.galleryDataMap };
        delete newGalleryDataMap[id];
        const newCurrentId = state.currentGalleryId === id 
          ? (newGalleries[0]?.id || 'gallery-1')
          : state.currentGalleryId;
        return {
          galleryDataMap: newGalleryDataMap,
          galleries: newGalleries,
          currentGalleryId: newCurrentId
        };
      });
    },

    switchGallery: (id) => {
      saveAndSet(() => ({
        currentGalleryId: id
      }));
    },

    renameGallery: (id, name) => {
      saveAndSet((state) => {
        const currentGallery = state.galleryDataMap[id];
        const updates: Partial<AppState> = {
          galleries: state.galleries.map(g =>
            g.id === id ? { ...g, name } : g
          )
        };
        if (currentGallery) {
          updates.galleryDataMap = {
            ...state.galleryDataMap,
            [id]: {
              ...currentGallery,
              name
            }
          };
        }
        return updates;
      });
    },

    // 프로필 관리
    updateProfile: (updates) => {
      saveAndSet((state) => ({
        profile: {
          ...state.profile,
          ...updates
        }
      }));
    },

    // 데이터 관리
    loadData: async () => {
      try {
        const data = await loadPortfolioFromFile();
        if (data) {
          set(data);
          saveStateToLocalStorage(data);
        }
      } catch (error) {
        console.error('Failed to load portfolio data:', error);
      }
    },

    resetData: () => {
      const resetState: AppState = {
        projects: [],
        frames: [],
        backgrounds: [],
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
        profile: { name: 'Illustrator', bio: '', avatarUrl: null, website: '', social: {} }
      };
      set(resetState);
      saveStateToLocalStorage(resetState);
    },

    importData: (data) => {
      set(data);
      saveStateToLocalStorage(data);
    },

    exportData: () => {
      const state = get();
      const appState: AppState = {
        projects: state.projects,
        frames: state.frames,
        backgrounds: state.backgrounds,
        galleryDataMap: state.galleryDataMap,
        galleries: state.galleries,
        currentGalleryId: state.currentGalleryId,
        profile: state.profile
      };
      exportPortfolioToFile(appState);
    },

    importDataFromFile: async (file) => {
      try {
        const data = await importPortfolioFromFile(file);
        if (data) {
          set(data);
          saveStateToLocalStorage(data);
        }
      } catch (error) {
        console.error('Failed to import data:', error);
      }
    }
  };
});
