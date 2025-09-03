// icons
import {
  DashboardOutlined,
  ProfileOutlined,
  HomeOutlined,
  SettingOutlined,
  FormOutlined,
  LayoutOutlined,
  ShoppingOutlined,
  LaptopOutlined,
 PictureOutlined,
} from '@ant-design/icons-vue';

import { StickyNote } from "lucide-vue-next";

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
}

const sidebarItem: menu[] = [
  { header: 'Navigation' },
  {
    title: 'Dashboard',
    icon: DashboardOutlined,
    to: '/admin/dashboard'
  },
  {
    title: 'Beranda',
    icon: HomeOutlined,
    to: '/admin/pages/beranda'
  },
  {
    title: 'Pages',
    icon: LayoutOutlined,
    to: '/admin/pages'
  },

  { header: 'Article' },
  {
    title: 'Blogs',
    icon: FormOutlined,
    to: '/admin/pages/blogs',
  },
  { header: 'E-Commerce' },
  {
    title: 'Products',
    icon: ShoppingOutlined,
    to: '/admin/ecommerce/products',
  },

  { header: 'Media' },
  {
    title: 'Media',
    icon: PictureOutlined,
    to: '/admin/pages/media'
  },

  { header: 'Settings' },
  {
    title: 'Settings',
    icon: SettingOutlined,
    to: '/admin/pages/settings'
  },

  // { header: 'Support' },
  // {
  //   title: 'Ant Icons',
  //   icon: CrownOutlined,
  //   to: '/admin/icon/ant'
  // },
  // {
  //   title: 'Documentation',
  //   icon: QuestionOutlined,
  //   to: 'https://codedthemes.gitbook.io/mantis-vuetify/',
  //   type: 'external',
  //   chip: 'gitbook',
  //   chipColor: 'secondary',
  //   chipVariant: 'flat'
  // }
];

export default sidebarItem;
