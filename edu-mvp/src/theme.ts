import type { ThemeConfig } from "antd";

// 对齐 legacy.css 的绿色品牌变量（--green #087c59 等），让 AntD 组件融入定制风格。
export const theme: ThemeConfig = {
  token: {
    colorPrimary: "#087c59",
    colorInfo: "#087c59",
    colorSuccess: "#087c59",
    colorWarning: "#e49a20",
    colorError: "#d93d36",
    colorLink: "#087c59",
    colorText: "#18201d",
    colorTextSecondary: "#66736f",
    colorBorder: "#dce5e1",
    colorBgLayout: "#f5f7f6",
    borderRadius: 8,
    fontFamily:
      'Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif',
  },
  components: {
    Button: { borderRadius: 8, controlHeight: 36 },
    Modal: { borderRadiusLG: 14 },
    Table: { borderRadius: 8, headerBg: "#f3f7f5" },
    Card: { borderRadiusLG: 12 },
  },
};
