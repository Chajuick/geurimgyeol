import { PortfolioData } from '@/types';

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  profile: {
    name: '일러스트레이터 이름',
    bio: '안녕하세요. 저는 판타지 일러스트와 원화를 그리는 일러스트레이터입니다.',
    profileImage: '',
    socialLinks: [
      { platform: 'Twitter', url: 'https://twitter.com', icon: '𝕏' },
      { platform: 'Instagram', url: 'https://instagram.com', icon: '📷' },
      { platform: 'ArtStation', url: 'https://artstation.com', icon: '🎨' },
    ],
  },
  worlds: [
    {
      id: 'world-1',
      name: '판타지 세계관',
      description: '마법과 모험이 가득한 세계',
      icon: '🌍',
      mainImage: '',
      backgroundImage: '',
      creatures: [
        {
          id: 'creature-world-1',
          name: '드래곤',
          image: '',
          description: '하늘을 지배하는 강력한 생물',
        },
      ],
      relatedCharacters: [],
      relatedCreatures: [],
      worldCharacters: [],
      worldCreatures: []
    },
  ],
  characters: [
    {
      id: 'char-1',
      name: '캐릭터 1',
      mainCategory: '공격 타입',
      subCategory: '근거리',
      mainImage: '',
      subImages: [
        {
          image: '',
          description: '기본 포즈',
        },
      ],
      profileImage: '',
      tags: ['전사', '검'],
      description: '용감한 전사',
    },
  ],
  creatures: [
    {
      id: 'crea-1',
      name: '크리쳐 1',
      mainCategory: '포식자',
      subCategory: '육식',
      mainImage: '',
      subImages: [
        {
          image: '',
          description: '기본 모습',
        },
      ],
      profileImage: '',
      tags: ['위험', '야생'],
      description: '위험한 생물',
    },
  ],
  settings: {
    heroBackgroundImage: '',
    characterCategories: [
      {
        main: '공격 타입',
        subs: ['근거리', '원거리', '마법'],
      },
      {
        main: '역할',
        subs: ['주인공', '조연', '악역'],
      },
    ],
    creatureCategories: [
      {
        main: '포식자',
        subs: ['육식', '잡식'],
      },
      {
        main: '초식동물',
        subs: ['초식', '잡식'],
      },
    ],
    editMode: true,
  },
};
