import mainConfig from './main.config'
import { envConfig } from 'zirconia-common'

export default mainConfig({
  ssr: false,

  head: {
    titleTemplate: '%s - ZirconiaCMS',
    title: 'Панель управления',
  },

  server: {
    port: envConfig.adminPort,
  },

  plugins: [
    '~/plugins/primevue',
    '~/assets/styles/layout.scss'
  ],

  css: ['primeflex/primeflex.css'],

  primevue: {
    theme: 'vela-purple',
    ripple: true,
    components: [
      'AutoComplete',
      'Accordion',
      'AccordionTab',
      'Avatar',
      'AvatarGroup',
      'Badge',
      'Button',
      'Breadcrumb',
      'Calendar',
      'Card',
      'Carousel',
      'Chart',
      'Checkbox',
      'Chip',
      'Chips',
      'ColorPicker',
      'Column',
      'ConfirmDialog',
      'ConfirmPopup',
      'ContextMenu',
      'DataTable',
      'DataView',
      'DataViewLayoutOptions',
      'Dialog',
      'Divider',
      'Dropdown',
      'Fieldset',
      'FileUpload',
      'InlineMessage',
      'Inplace',
      'InputMask',
      'InputNumber',
      'InputSwitch',
      'InputText',
      'Knob',
      'Galleria',
      'Listbox',
      'MegaMenu',
      'Menu',
      'Menubar',
      'Message',
      'MultiSelect',
      'OrderList',
      'OrganizationChart',
      'OverlayPanel',
      'Paginator',
      'Panel',
      'PanelMenu',
      'Password',
      'PickList',
      'ProgressBar',
      'Rating',
      'RadioButton',
      'SelectButton',
      'ScrollPanel',
      'ScrollTop',
      'Slider',
      'Sidebar',
      'Skeleton',
      'SplitButton',
      'Splitter',
      'SplitterPanel',
      'Steps',
      'TabMenu',
      'Tag',
      'TieredMenu',
      'Textarea',
      'Timeline',
      'Toast',
      'Toolbar',
      'TabView',
      'TabPanel',
      'ToggleButton',
      'Tree',
      'TreeTable',
      'TriStateCheckbox'
    ],
    directives: [
      'Tooltip',
      'Ripple',
      'BadgeDirective',
      'StyleClass'
    ]
  },
 
  modules: [
    'primevue/nuxt',
  ],

  auth: {
    redirect: {
      login: '/login',
      logout: '/login',
      home: '/'
    }
  },

  router: {
    middleware: ['auth']
  }
})