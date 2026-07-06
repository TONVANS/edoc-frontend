// src\lib\theme.ts
import { ThemeConfig } from 'antd';

export const antdThemeConfig: ThemeConfig = {  
  token: {  
    colorPrimary: '#185C4D', // Deep Forest Green  
    colorInfo: '#185C4D',  
    colorSuccess: '#1A7A44',  
    colorWarning: '#9B7016',  
    colorError: '#B83131',  
    colorTextBase: '#1C1C1E',  
    colorBgBase: '#FFFFFF',  
    colorBgLayout: 'transparent', // Let Tailwind app-gradient show through  
    fontFamily: '"Plus Jakarta Sans", "Noto Sans Lao", sans-serif',  
    borderRadius: 12,  
    wireframe: false,  
  },  
  components: {  
    Card: { 
      paddingLG: 24,
      boxShadowTertiary: '0 4px 20px rgba(0, 0, 0, 0.04)'
    },  
    Button: { controlHeight: 40, borderRadius: 8 },  
    Table: {  
      headerBg: '#185C4D',  
      headerColor: '#FFFFFF',  
      borderRadius: 12,  
    },  
    Modal: { borderRadiusOuter: 16 },  
  },  
};
