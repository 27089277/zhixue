# 智学云教 App（React Native + Expo）

iOS / 安卓 移动端。功能与 Web 一致，UI 参考学而思 + 菁优网重做。后端复用现有 Spring 服务（/api/*）。

## 目录
- src/app/ expo-router 路由（login、(student)、(teacher)、exam/[paperId]、result/[paperId]、grade/[id]、compose、drill）
- src/store、src/api、src/types、src/data 复用自 Web（store 换 AsyncStorage、api 改绝对地址）
- src/components 原生组件（UI kit / RichText / Handwriting）；src/theme 品牌 token

## 本地运行（Expo Go 即可）
    cd app
    npx expo start        # 按 i 开 iOS 模拟器 / 手机装 Expo Go 扫码
- 默认连线上后端 http://111.231.12.64/api（需放行腾讯 80）。
- 本地联调：EXPO_PUBLIC_API_BASE=http://<你的Mac局域网IP>:8080/api npx expo start
- 演示登录：教师 13800000000 / 学生 13900000000 / 管理员 13700000000，验证码 246810。

## 出包（需 Expo 账号）
    npm i -g eas-cli && eas login
    eas build -p android --profile preview    # 出 APK（内测）
    eas build -p ios --profile development     # iOS 开发构建
    eas build -p ios --profile production      # 上架构建（需 Apple Developer）

## 说明
- 手写作答现为矢量轨迹（Expo Go 兼容）；导出 PNG 上传 + 老师红笔批注需 react-native-skia/view-shot + EAS dev build。
- 公式（KaTeX）暂按纯文本；后续用 WebView 渲染。
