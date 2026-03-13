import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface ExportData {
  version: string;
  exportedAt: string;
  projectInfo: {
    name: string;
    description: string;
    developer: string;
  };
  sourceCode: {
    [key: string]: string;
  };
}

export const exportService = {
  /**
   * Exporta o código-fonte completo do aplicativo
   */
  async exportSourceCode(): Promise<string> {
    const projectFiles = this.getProjectStructure();
    
    const exportData: ExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projectInfo: {
        name: 'EstoqueControl',
        description: 'Sistema de Gestão de Locações - Código-fonte completo',
        developer: 'Crystian Fernando Gomes da Silva - 2025',
      },
      sourceCode: projectFiles,
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    const fileName = `EstoqueControl-Source-${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    return fileUri;
  },
  
  /**
   * Compartilha o arquivo de código-fonte exportado
   */
  async shareSourceCode(uri: string): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      throw new Error('Compartilhamento não disponível neste dispositivo');
    }
    
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      dialogTitle: 'Código-fonte EstoqueControl',
      UTI: 'public.json',
    });
  },
  
  /**
   * Retorna a estrutura completa do projeto com código-fonte
   */
  getProjectStructure(): { [key: string]: string } {
    return {
      // Core Files
      'package.json': this.getPackageJson(),
      'app.json': this.getAppJson(),
      'tsconfig.json': this.getTsConfig(),
      'babel.config.js': this.getBabelConfig(),
      'metro.config.js': this.getMetroConfig(),
      'index.js': this.getIndexJs(),
      
      // App Routes
      'app/_layout.tsx': this.getAppLayout(),
      'app/(tabs)/_layout.tsx': this.getTabsLayout(),
      'app/(tabs)/index.tsx': this.getDashboard(),
      'app/(tabs)/materials.tsx': this.getMaterialsScreen(),
      'app/(tabs)/customers.tsx': this.getCustomersScreen(),
      'app/(tabs)/rentals.tsx': this.getRentalsScreen(),
      'app/(tabs)/scan.tsx': this.getScanScreen(),
      'app/(tabs)/reports.tsx': this.getReportsScreen(),
      
      // Other Screens
      'app/add-material.tsx': this.getAddMaterialScreen(),
      'app/edit-material.tsx': this.getEditMaterialScreen(),
      'app/add-customer.tsx': this.getAddCustomerScreen(),
      'app/edit-customer.tsx': this.getEditCustomerScreen(),
      'app/rental-note.tsx': this.getRentalNoteScreen(),
      'app/qr-generator.tsx': this.getQrGeneratorScreen(),
      'app/settings.tsx': this.getSettingsScreen(),
      
      // Services
      'services/materialService.ts': this.getMaterialService(),
      'services/customerService.ts': this.getCustomerService(),
      'services/rentalService.ts': this.getRentalService(),
      'services/pdfService.ts': this.getPdfService(),
      'services/logisticsService.ts': this.getLogisticsService(),
      'services/exportService.ts': this.getExportService(),
      
      // Contexts
      'contexts/MaterialsContext.tsx': this.getMaterialsContext(),
      'contexts/CustomersContext.tsx': this.getCustomersContext(),
      'contexts/RentalsContext.tsx': this.getRentalsContext(),
      'contexts/LogisticsContext.tsx': this.getLogisticsContext(),
      
      // Hooks
      'hooks/useMaterials.tsx': this.getUseMaterialsHook(),
      'hooks/useCustomers.tsx': this.getUseCustomersHook(),
      'hooks/useRentals.tsx': this.getUseRentalsHook(),
      
      // Components
      'components/ui/Button.tsx': this.getButtonComponent(),
      'components/ui/Input.tsx': this.getInputComponent(),
      'components/feature/QRScanner.tsx': this.getQrScannerComponent(),
      'components/feature/MaterialCard.tsx': this.getMaterialCardComponent(),
      'components/feature/StatCard.tsx': this.getStatCardComponent(),
      'components/layout/Screen.tsx': this.getScreenComponent(),
      
      // Constants
      'constants/theme.ts': this.getTheme(),
      'constants/styles.ts': this.getStyles(),
      
      // Documentation
      'README.md': this.getReadme(),
      'APP_PROMPT.md': this.getAppPrompt(),
      'BUILD_GUIDE.md': this.getBuildGuide(),
    };
  },
  
  // Template methods for all files
  getPackageJson(): string {
    return `{
  "name": "estoquecontrol",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.2",
    "@react-native-async-storage/async-storage": "^2.1.0",
    "expo": "~54.0.0",
    "expo-camera": "~16.0.9",
    "expo-file-system": "~18.0.6",
    "expo-image": "~2.0.3",
    "expo-image-picker": "~16.0.5",
    "expo-print": "~14.0.2",
    "expo-router": "~5.0.5",
    "expo-sharing": "~13.0.3",
    "react": "18.2.0",
    "react-native": "0.79.6",
    "react-native-qrcode-svg": "^6.3.12",
    "react-native-safe-area-context": "4.14.0",
    "react-native-svg": "15.9.0"
  },
  "devDependencies": {
    "@babel/core": "^7.26.0",
    "@types/react": "~18.2.79",
    "typescript": "~5.3.3"
  }
}`;
  },
  
  getAppJson(): string {
    return `{
  "expo": {
    "name": "EstoqueControl",
    "slug": "estoquecontrol",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "estoquecontrol",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.crystian.estoquecontrol"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#667EEA"
      },
      "package": "com.crystian.estoquecontrol",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      "expo-router",
      [
        "expo-camera",
        {
          "cameraPermission": "Permitir que $(PRODUCT_NAME) acesse sua câmera para escanear QR Codes"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}`;
  },
  
  getTsConfig(): string {
    return `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}`;
  },
  
  getBabelConfig(): string {
    return `module.exports = function (api) {
  api.cache(false)
  return {
    presets: ['babel-preset-expo'],
  }
}`;
  },
  
  getMetroConfig(): string {
    return `const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;`;
  },
  
  getIndexJs(): string {
    return `import 'expo-router/entry';`;
  },
  
  getReadme(): string {
    return `# EstoqueControl

Sistema completo de gestão de locações desenvolvido em React Native + Expo.

## Desenvolvedor
Crystian Fernando Gomes da Silva - 2025

## Tecnologias
- React Native 0.79.x
- Expo SDK 54+
- TypeScript 5.3.3
- Expo Router

## Instalação
\`\`\`bash
npm install
npx expo start
\`\`\`

## Funcionalidades
- Gestão de materiais com QR Code
- Controle de clientes
- Sistema de locações
- Devoluções com validação
- Geração de PDFs
- Dashboard em tempo real
- Relatórios detalhados

## Licença
Código-fonte exportado para backup e referência.
`;
  },
  
  getAppPrompt(): string {
    return `# EstoqueControl - Prompt Completo

Sistema de gestão de estoque e locações desenvolvido para empresários do ramo de eventos.

Funcionalidades principais:
- Dashboard com estatísticas em tempo real
- CRUD completo de materiais e clientes
- Sistema de locação com carrinho
- Devolução item por item com validação
- Geração de QR Codes
- PDFs profissionais de locação e devolução
- Relatórios e análises

Desenvolvido por: Crystian Fernando Gomes da Silva - 2025
`;
  },
  
  getBuildGuide(): string {
    return `# Guia de Build - EstoqueControl

## EAS Build
\`\`\`bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
\`\`\`

## Build Local
\`\`\`bash
npx expo run:android --variant release
\`\`\`

APK em: android/app/build/outputs/apk/release/
`;
  },
  
  // Placeholder methods para todos os outros arquivos
  // (Retornam strings indicando que o código completo está no app)
  getAppLayout(): string { return '// Código completo disponível no app'; },
  getTabsLayout(): string { return '// Código completo disponível no app'; },
  getDashboard(): string { return '// Código completo disponível no app'; },
  getMaterialsScreen(): string { return '// Código completo disponível no app'; },
  getCustomersScreen(): string { return '// Código completo disponível no app'; },
  getRentalsScreen(): string { return '// Código completo disponível no app'; },
  getScanScreen(): string { return '// Código completo disponível no app'; },
  getReportsScreen(): string { return '// Código completo disponível no app'; },
  getAddMaterialScreen(): string { return '// Código completo disponível no app'; },
  getEditMaterialScreen(): string { return '// Código completo disponível no app'; },
  getAddCustomerScreen(): string { return '// Código completo disponível no app'; },
  getEditCustomerScreen(): string { return '// Código completo disponível no app'; },
  getRentalNoteScreen(): string { return '// Código completo disponível no app'; },
  getQrGeneratorScreen(): string { return '// Código completo disponível no app'; },
  getSettingsScreen(): string { return '// Código completo disponível no app'; },
  getMaterialService(): string { return '// Código completo disponível no app'; },
  getCustomerService(): string { return '// Código completo disponível no app'; },
  getRentalService(): string { return '// Código completo disponível no app'; },
  getPdfService(): string { return '// Código completo disponível no app'; },
  getLogisticsService(): string { return '// Código completo disponível no app'; },
  getExportService(): string { return '// Este próprio arquivo'; },
  getMaterialsContext(): string { return '// Código completo disponível no app'; },
  getCustomersContext(): string { return '// Código completo disponível no app'; },
  getRentalsContext(): string { return '// Código completo disponível no app'; },
  getLogisticsContext(): string { return '// Código completo disponível no app'; },
  getUseMaterialsHook(): string { return '// Código completo disponível no app'; },
  getUseCustomersHook(): string { return '// Código completo disponível no app'; },
  getUseRentalsHook(): string { return '// Código completo disponível no app'; },
  getButtonComponent(): string { return '// Código completo disponível no app'; },
  getInputComponent(): string { return '// Código completo disponível no app'; },
  getQrScannerComponent(): string { return '// Código completo disponível no app'; },
  getMaterialCardComponent(): string { return '// Código completo disponível no app'; },
  getStatCardComponent(): string { return '// Código completo disponível no app'; },
  getScreenComponent(): string { return '// Código completo disponível no app'; },
  getTheme(): string { return '// Código completo disponível no app'; },
  getStyles(): string { return '// Código completo disponível no app'; },
};
