// icons
import {
  QuestionOutlined,
  DashboardOutlined,
  ChromeOutlined,
  LoginOutlined,
  ProfileOutlined,
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  CrownOutlined,
  SettingOutlined,
} from '@ant-design/icons-vue';

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
  { header: 'Pages' },
  {
    title: 'Beranda',
    icon: LoginOutlined,
    to: '/admin/pages/beranda'
  },
  {
    title: 'About',
    icon: ProfileOutlined,
    to: '/admin/pages/about'
  },
  { header: 'Blogs' },
  {
    title: 'Blogs',
    icon: ProfileOutlined,
    to: '/admin/pages/blogs'
  },
  {
    title: 'Kategori Blogs',
    icon: ProfileOutlined,
    to: '/admin/pages/blogs'
  },
  { header: 'Products' },
  {
    title: 'Products',
    icon: ProfileOutlined,
    to: '/admin/pages/products'
  },
  { header: 'Settings' },
  {
    title: 'Settings',
    icon: SettingOutlined,
    to: '/admin/pages/settings'
  },

  { header: 'Support' },
  {
    title: 'Ant Icons',
    icon: CrownOutlined,
    to: '/admin/icon/ant'
  },
  {
    title: 'Documentation',
    icon: QuestionOutlined,
    to: 'https://codedthemes.gitbook.io/mantis-vuetify/',
    type: 'external',
    chip: 'gitbook',
    chipColor: 'secondary',
    chipVariant: 'flat'
  }
];

export default sidebarItem;
