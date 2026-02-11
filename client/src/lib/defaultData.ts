import { PortfolioData } from '@/types';

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  profile: {
    name: 'Arin Moon',
    bio: '판타지 세계관과 캐릭터 원화를 작업하는 일러스트레이터입니다.',
    profileImage: 'https://picsum.photos/300/300?random=1',
    socialLinks: [
      { platform: 'Twitter', url: 'https://twitter.com', icon: '𝕏' },
      { platform: 'Instagram', url: 'https://instagram.com', icon: '📷' },
      { platform: 'ArtStation', url: 'https://artstation.com', icon: '🎨' },
    ],
  },

  worlds: [
    {
      id: 'world-1',
      name: '아르카디아',
      description: '고대 마법과 공중도시가 공존하는 신비로운 세계',
      iconImage: 'https://picsum.photos/64/64?random=2',
      mainImage: 'https://picsum.photos/1200/800?random=3',
      backgroundImage: 'https://picsum.photos/1920/1080?random=4',

      creatures: [],
      relatedCharacters: [],
      relatedCreatures: [],
      worldCharacters: [],
      worldCreatures: [],
    },
  ],

  characters: [
    {
      id: 'char-1',
      name: '리아나',
      mainCategory: '공격 타입',
      subCategory: '마법',
      mainImage: 'https://picsum.photos/900/600?random=5',
      subImages: [
        { image: 'https://picsum.photos/200/200?random=6', description: '기본 포즈' },
        { image: 'https://picsum.photos/200/200?random=7', description: '전투 자세' },
        { image: 'https://picsum.photos/200/200?random=8', description: '클로즈업' },
      ],
      profileImage: 'https://picsum.photos/200/200?random=9',
      tags: ['마법사', '주인공'],
      description: '고대 룬 마법을 사용하는 젊은 마도사.',
    },
  ],

  creatures: [
    {
      id: 'crea-1',
      name: '스카이 드레이크',
      mainCategory: '포식자',
      subCategory: '육식',
      mainImage: 'https://picsum.photos/900/600?random=10',
      subImages: [
        { image: 'https://picsum.photos/200/200?random=11', description: '비행 모습' },
        { image: 'https://picsum.photos/200/200?random=12', description: '날개 디테일' },
      ],
      profileImage: 'https://picsum.photos/200/200?random=13',
      tags: ['드래곤', '공중'],
      description: '하늘을 지배하는 고대 종의 후손.',
    },
  ],

  settings: {
    heroBackgroundImage: 'https://picsum.photos/1920/1080?random=14',

    characterCategories: [
      { main: '공격 타입', subs: ['근거리', '원거리', '마법'] },
      { main: '역할', subs: ['주인공', '조연', '악역'] },
    ],

    creatureCategories: [
      { main: '포식자', subs: ['육식', '잡식'] },
      { main: '초식동물', subs: ['초식', '잡식'] },
    ],

    editMode: true,
  },
};