# EstoqueControl - Guia de Configuração e Build

## 📋 Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (para builds): `npm install -g eas-cli`
- Android Studio (para testes locais Android)
- Xcode (para testes locais iOS - apenas macOS)

## 🚀 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Limpar cache (se necessário)

```bash
npx expo start --clear
```

## 📱 Executar em Desenvolvimento

### Expo Go (Recomendado para testes rápidos)

```bash
npx expo start
```

Depois:
- Escaneie o QR code com o app Expo Go (iOS/Android)
- Ou pressione 'a' para Android emulator
- Ou pressione 'i' para iOS simulator (apenas macOS)

### Development Build (Para funcionalidades nativas completas)

```bash
npx expo run:android
# ou
npx expo run:ios
```

## 🏗️ Gerar APK para Produção

### Método 1: EAS Build (Recomendado)

#### Configurar EAS (primeira vez)

```bash
eas login
eas build:configure
```

#### Gerar APK

```bash
# Preview (teste)
eas build --platform android --profile preview

# Produção
eas build --platform android --profile production
```

O APK será gerado na nuvem e você receberá um link para download.

### Método 2: Build Local (Alternativo)

**Requisitos:**
- Android Studio instalado
- SDK configurado
- Java JDK 17

```bash
# Gerar APK localmente
npx expo run:android --variant release
```

O APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

## 📦 Estrutura de Pastas

```
estoquecontrol/
├── app/                      # Telas e rotas (Expo Router)
│   ├── (tabs)/              # Navegação por abas
│   ├── _layout.tsx          # Layout raiz
│   └── *.tsx                # Telas modais e standalone
├── components/              # Componentes reutilizáveis
│   ├── ui/                  # Componentes de UI básicos
│   ├── feature/             # Componentes de funcionalidades
│   └── layout/              # Componentes de layout
├── contexts/                # Contextos globais (estado)
├── hooks/                   # Custom hooks
├── services/                # Lógica de negócio e APIs
├── constants/               # Temas, cores, estilos
├── assets/                  # Imagens, fontes, etc
└── template/                # Templates de autenticação

```

## 🔧 Configurações Importantes

### Assets de Ícones e Splash

Crie os seguintes arquivos em `assets/images/`:

- `icon.png` - 1024x1024px (ícone do app)
- `adaptive-icon.png` - 1024x1024px (Android adaptive icon)
- `splash.png` - 1284x2778px (tela de splash)
- `favicon.png` - 48x48px (web favicon)

### Variáveis de Ambiente

Se precisar de variáveis de ambiente, crie `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=sua-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-key
```

## 🐛 Solução de Problemas Comuns

### Erro: "Metro bundler não inicia"

```bash
npx expo start --clear
rm -rf node_modules
npm install
```

### Erro: "Android build failed"

```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Erro: "Dependências incompatíveis"

```bash
npx expo install --fix
```

### Cache corrompido

```bash
rm -rf node_modules
rm -rf .expo
rm package-lock.json
npm install
npx expo start --clear
```

## 📲 Publicação

### Google Play Store

1. Gerar APK/AAB:
```bash
eas build --platform android --profile production
```

2. Baixe o arquivo gerado

3. Acesse [Google Play Console](https://play.google.com/console)

4. Crie um novo app e faça upload do APK/AAB

### Apple App Store

1. Gerar build iOS:
```bash
eas build --platform ios --profile production
```

2. Faça o upload via EAS Submit:
```bash
eas submit --platform ios
```

## 🔐 Assinatura de App (Android)

Para builds de produção, você precisa de um keystore:

```bash
# Gerar keystore
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Configure em `eas.json` ou use EAS managed credentials.

## 📊 Monitoramento

### Ver logs em produção

```bash
npx expo-cli logs
```

### Analytics e Crashlytics

Integre Firebase ou Sentry seguindo suas respectivas documentações.

## 🆘 Suporte

- **Expo Docs:** https://docs.expo.dev
- **React Native Docs:** https://reactnative.dev
- **Desenvolvedor:** Crystian Fernando Gomes da Silva

## 📝 Notas Importantes

✅ **Compatibilidade Garantida:**
- Expo SDK 54+
- React 18.2.0
- React Native 0.79.x
- TypeScript 5.x

✅ **Funcionalidades Principais:**
- Gestão de estoque e materiais
- Controle de clientes e locações
- Geração de PDF para notas
- Scanner QR Code
- Sistema de devoluções
- Dashboard em tempo real
- Logística de entregas

⚠️ **Antes de Publicar:**
1. Teste em dispositivos reais (Android e iOS)
2. Verifique todas as permissões necessárias
3. Configure ícones e splash screens
4. Teste fluxo completo de CRUD
5. Valide geração de PDFs
6. Teste scanner de QR Code

---

**EstoqueControl v1.0.0**  
*Desenvolvido pensando no empresário do ramo de locação*
