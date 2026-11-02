export type InspirationCategory = '人像' | '风景' | '夜景';

export type InspirationItem = {
  source: import('react-native').ImageSourcePropType;
  category: InspirationCategory;
  title: string;
  tag: string;
};
