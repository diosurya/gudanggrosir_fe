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
    title: 'Pages',
    icon: LoginOutlined,
    to: '/admin/pages/beranda',
    children: [
        {
          title: 'Beranda',
          to: '/admin/pages/beranda'
        },
        {
          title: 'About',
          to: '/admin/pages/about'
        },
        // {
        //   title: 'Tag',
        //   to: '/admin/pages/products/fashion'
        // }
      ]
  },

  { header: 'Posts' },
  {
    title: 'Blogs',
    icon: ProfileOutlined,
    to: '/admin/pages/blogs',
    children: [
        {
          title: 'Blogs',
          to: '/admin/pages/blogs'
        },
        // {
        //   title: 'Category',
        //   to: '/admin/pages/category-blog'
        // },
        // {
        //   title: 'Tag',
        //   to: '/admin/pages/products/fashion'
        // }
      ]
  },
  { header: 'E-Commerce' },
  {
    title: 'Products',
    icon: ProfileOutlined,
    to: '/admin/ecommerce/products',
      children: [
        {
          title: 'Products',
          to: '/admin/ecommerce/products'
        },
        // {
        //   title: 'Category',
        //   to: '/admin/ecommerce/products/electronics'
        // },
        // {
        //   title: 'Tag',
        //   to: '/admin/ecommerce/products/fashion'
        // }
      ]
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
