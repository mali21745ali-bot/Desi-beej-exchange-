export interface SeedCategory {
  id: string;
  nameUrdu: string;
  nameEng: string;
  iconName: string;
  description: string;
}

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    id: 'all',
    nameUrdu: 'تمام بیج',
    nameEng: 'All Seeds',
    iconName: 'Sparkles',
    description: 'تمام اقسام کے بیج'
  },
  {
    id: 'wheat',
    nameUrdu: 'گندم',
    nameEng: 'Wheat',
    iconName: 'Wheat',
    description: 'دیسی لال گندم، سی 591، واڈناک، وغیرہ'
  },
  {
    id: 'rice',
    nameUrdu: 'چاول / دھان',
    nameEng: 'Rice',
    iconName: 'Sprout',
    description: 'دیسی باسمتی 370، سگندھ، کالا چاول'
  },
  {
    id: 'cotton',
    nameUrdu: 'کپاس / پھٹی',
    nameEng: 'Cotton',
    iconName: 'Cloud',
    description: 'دیسی سفید اور روایتی مزاحم کپاس'
  },
  {
    id: 'maize',
    nameUrdu: 'مکئی / چھلی',
    nameEng: 'Maize',
    iconName: 'Sun',
    description: 'دیسی پیلی مکئی، سفید مکئی'
  },
  {
    id: 'sugarcane',
    nameUrdu: 'کماد / گنا',
    nameEng: 'Sugarcane',
    iconName: 'TreePine',
    description: 'کٹھا دیسی گنا، رس دار روایتی سمیرہ'
  },
  {
    id: 'vegetable',
    nameUrdu: 'سبزیاں',
    nameEng: 'Vegetables',
    iconName: 'Carrot',
    description: 'دیسی بھنڈی، کریلا، کدو، پالک، مولی، دھنیا'
  },
  {
    id: 'pulses',
    nameUrdu: 'دالیں و چنا',
    nameEng: 'Pulses & Gram',
    iconName: 'CircleDot',
    description: 'دیسی کالا چنا، مونگ، ماش، مسور'
  },
  {
    id: 'oilseeds',
    nameUrdu: 'تیل دار اجناس',
    nameEng: 'Oilseeds',
    iconName: 'Flower2',
    description: 'دیسی سرسوں، رایا، تارا میرا، تل'
  },
  {
    id: 'fodder',
    nameUrdu: 'چارہ جات',
    nameEng: 'Fodder',
    iconName: 'Layers',
    description: 'برسیم، جئی، جوار، باجرہ، لوسرن'
  },
  {
    id: 'heritage',
    nameUrdu: 'نایاب و خاندانی بیج',
    nameEng: 'Heritage & Heirloom',
    iconName: 'Award',
    description: 'صد سالہ روایتی اور کسانوں کے محفوظ کردہ بیج'
  },
  {
    id: 'fruits',
    nameUrdu: 'پھل و پودے',
    nameEng: 'Fruits & Plants',
    iconName: 'Apple',
    description: 'دیسی تربوز، خربوزہ، بیر، پپیتے وغیرہ'
  }
];
