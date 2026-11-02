import type { InspirationItem } from '../types';

export interface EditorialShot {
  id: string;
  image: any;
  title: string;
  meta: string;
}

export const editorialShots: EditorialShot[] = [
  {
    id: '1',
    image: require('../../assets/editorial/editorial_1.jpg'),
    title: '街景 · 暖金侧光',
    meta: '35mm',
  },
  {
    id: '2',
    image: require('../../assets/editorial/editorial_2.jpg'),
    title: '室内 · 柔调窗光',
    meta: '50mm',
  },
  {
    id: '3',
    image: require('../../assets/editorial/editorial_3.jpg'),
    title: '海岸 · 电影侧颜',
    meta: '85mm',
  },
];

export const inspirationImages: InspirationItem[] = [
  { source: require('../../assets/inspiration/portrait-window.jpg'), category: '人像', title: '窗边柔光', tag: '人像 · 侧光' },
  { source: require('../../assets/inspiration/landscape-mountains.jpg'), category: '风景', title: '晨雾山湖', tag: '风景 · 倒影' },
  { source: require('../../assets/inspiration/night-city.jpg'), category: '夜景', title: '雨夜街灯', tag: '夜景 · 冷暖对比' },
  { source: require('../../assets/inspiration/portrait-street.jpg'), category: '人像', title: '金色街角', tag: '人像 · 逆光' },
  { source: require('../../assets/inspiration/landscape-coast.jpg'), category: '风景', title: '海岸曲线', tag: '风景 · 引导线' },
  { source: require('../../assets/inspiration/night-stars.jpg'), category: '夜景', title: '星河入湖', tag: '夜景 · 星空' },
  { source: require('../../assets/inspiration/portrait-coast.jpg'), category: '人像', title: '海风侧颜', tag: '人像 · 轮廓光' },
  { source: require('../../assets/inspiration/landscape-forest.jpg'), category: '风景', title: '林间光束', tag: '风景 · 纵深' },
  { source: require('../../assets/inspiration/night-bridge.jpg'), category: '夜景', title: '桥下流光', tag: '夜景 · 灯光倒影' },
];
