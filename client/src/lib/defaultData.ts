import { PortfolioData } from '@/types';

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  profile: {
    name: '',
    bio: '',
    profileImage: '',
    socialLinks: [{ platform: 'X', url: 'https://twitter.com' }, { platform: 'Pixiv', url: 'https://artstation.com' }, { platform: 'Instagram', url: 'https://instagram.com' },],
  },

  worlds: [],

  characters: [],

  creatures: [],

  settings: {
    heroBackgroundImage: '',

    characterCategories: [],

    creatureCategories: [],

    editMode: true,
  },
};
