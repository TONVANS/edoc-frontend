// src/components/layout/sidebarStyles.ts

// ปรับปรุง Style ใหม่ทั้งหมดเพื่อให้เข้ากับพื้นหลังสีเขียวเข้มของ Sidebar
export const SIDEBAR_MENU_STYLES = `
  .sidebar-menu.ant-menu { background: transparent !important; border: none !important; }
  
  .sidebar-menu .ant-menu-item {
    border-radius: 12px !important;
    margin: 4px 12px !important;
    width: calc(100% - 24px) !important;
    height: auto !important;
    padding: 10px 12px !important;
    line-height: 1.4 !important;
    font-size: 13.5px !important;
    font-weight: 500 !important;
    color: rgba(255, 255, 255, 0.65) !important;
    display: flex !important;
    align-items: center !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .sidebar-menu .ant-menu-item:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #ffffff !important;
    transform: translateX(4px);
  }
  
  .sidebar-menu .ant-menu-item-selected {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%) !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar-menu .ant-menu-item-selected::after { display: none !important; }
  
  .sidebar-menu .ant-menu-item-group-title {
    font-size: 10px !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
    color: rgba(255, 255, 255, 0.4) !important;
    padding: 16px 16px 8px !important;
  }
`;