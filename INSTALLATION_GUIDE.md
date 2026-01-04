# 📥 Guia de Instalação - EstoqueControl

## 🎯 Objetivo

Este guia mostrará **passo a passo** como instalar e rodar o projeto EstoqueControl no seu computador.

## 📋 Pré-requisitos

### 1. **Node.js** (versão 18 ou superior)

**Windows/macOS/Linux**:
- Baixe em: https://nodejs.org
- Recomendado: versão **LTS** (Long Term Support)
- Verifique a instalação:
  ```bash
  node --version  # Deve mostrar v18.x.x ou superior
  npm --version   # Deve mostrar 9.x.x ou superior
  ```

### 2. **Git** (para clonar o repositório)

**Windows**: https://git-scm.com/download/win  
**macOS**: `brew install git` ou https://git-scm.com/download/mac  
**Linux**: `sudo apt-get install git`

Verifique:
```bash
git --version
```

### 3. **Expo Go** (no celular)

**Android**: https://play.google.com/store/apps/details?id=host.exp.exponent  
**iOS**: https://apps.apple.com/app/expo-go/id982107779

## 🚀 Instalação Passo a Passo

### Passo 1: Clonar o Repositório

```bash
# Se você tem o projeto em um repositório Git:
git clone [URL_DO_REPOSITORIO]
cd estoquecontrol

# OU se você já tem os arquivos:
cd caminho/para/estoquecontrol
```

### Passo 2: Instalar Dependências

```bash
npm install
```

**Aguarde** a instalação de todas as dependências (pode levar alguns minutos na primeira vez).

### Passo 3: Verificar o package.json

Abra o arquivo `package.json` e **verifique** se tem estas dependências:

```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "react": "18.2.0",
    "react-native": "0.79.6",
    "@expo/vector-icons": "^15.0.2",
    "expo-camera": "~16.0.9",
    "expo-image": "~2.0.3",
    "expo-print": "~14.0.2",
    "expo-router": "~5.0.5",
    "@react-native-async-storage/async-storage": "^2.1.0"
  }
}
```

Se algo estiver diferente, **copie as dependências** do arquivo `FIXES_AND_IMPROVEMENTS.md` para o seu `package.json`.

### Passo 4: Limpar Cache (Opcional, mas Recomendado)

```bash
# Limpar completamente
rm -rf node_modules
rm -rf .expo
rm package-lock.json

# Reinstalar
npm install
```

### Passo 5: Iniciar o Projeto

```bash
npx expo start --clear
```

ou simplesmente:

```bash
npm start
```

Você verá algo assim no terminal:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

### Passo 6: Abrir no Celular

#### **Android**:
1. Abra o app **Expo Go**
2. Toque em "Scan QR Code"
3. Aponte para o QR Code no terminal
4. Aguarde o carregamento

#### **iOS**:
1. Abra o app **Câmera** nativo
2. Aponte para o QR Code no terminal
3. Toque na notificação que aparecer
4. O app **Expo Go** abrirá automaticamente

## 🐛 Problemas Comuns e Soluções

### ❌ Erro: "Unable to resolve module"

**Solução**:
```bash
npx expo start --clear
```

### ❌ Erro: "Metro bundler não inicia"

**Solução**:
```bash
# Fechar todos os terminais
# Reiniciar

# Limpar cache
rm -rf .expo
rm -rf node_modules
npm install

# Tentar novamente
npx expo start --clear
```

### ❌ App fecha sozinho ao abrir no Expo Go

**Causa**: Dependências incompatíveis

**Solução**:
```bash
# 1. Verificar versão do Expo Go no celular (deve ser a mais recente)
# 2. Limpar cache do projeto
npx expo start --clear

# 3. Se não funcionar, reinstalar dependências
rm -rf node_modules
npm install
npx expo start --clear
```

### ❌ QR Code não aparece

**Solução**:
```bash
# Tentar modo tunnel
npx expo start --tunnel
```

### ❌ Erro de permissões (Linux/macOS)

**Solução**:
```bash
sudo npm install -g expo-cli
```

## 📱 Testando Funcionalidades

### 1. **Dashboard**
- Ao abrir, você verá estatísticas zeradas (normal em instalação nova)

### 2. **Cadastrar Material**
- Vá para aba "Materiais"
- Clique no botão "+" no canto superior direito
- Preencha os dados
- Salve

### 3. **Cadastrar Cliente**
- Vá para aba "Clientes"
- Clique no botão "+" no canto superior direito
- Preencha os dados
- Salve

### 4. **Fazer uma Locação**
- Vá para aba "Bip Scan"
- Selecione um cliente
- Clique em "Abrir Câmera" ou selecione manualmente um material
- Configure quantidade, valor e dias
- Preencha dados de entrega
- Gere a nota

### 5. **Devolução**
- Vá para aba "Locados"
- Selecione uma locação
- Clique no item para devolver
- Informe o estado
- Confirme

## 🏗️ Gerando APK para Testes

### Opção 1: EAS Build (Recomendado)

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login (crie conta grátis em expo.dev)
eas login

# 3. Configurar projeto
eas build:configure

# 4. Gerar APK
eas build --platform android --profile preview
```

### Opção 2: Build Local (Avançado)

**Requer**:
- Android Studio instalado
- SDK Android configurado
- Java JDK 17

```bash
npx expo run:android --variant release
```

APK estará em: `android/app/build/outputs/apk/release/`

## 📚 Próximos Passos

Após confirmar que o app está funcionando:

1. ✅ Teste todas as funcionalidades (CRUD de materiais, clientes, locações)
2. ✅ Verifique geração de PDF
3. ✅ Teste scanner de QR Code
4. ✅ Adicione assets personalizados (ícone, splash)
5. ✅ Configure para publicação

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique o arquivo**: `FIXES_AND_IMPROVEMENTS.md`
2. **Consulte a documentação**: `SETUP_GUIDE.md`
3. **Logs de erro**: Tire screenshot do terminal e do erro no celular

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] Git instalado
- [ ] Expo Go instalado no celular
- [ ] Repositório clonado
- [ ] `npm install` executado com sucesso
- [ ] `npx expo start` funcionando
- [ ] QR Code aparecendo no terminal
- [ ] App abrindo no Expo Go
- [ ] Dashboard aparecendo corretamente

Se todos os itens estiverem marcados, **parabéns**! 🎉

Seu EstoqueControl está **rodando perfeitamente**!

---

**EstoqueControl v1.0.0**  
*Desenvolvido por Crystian Fernando Gomes da Silva - 2025*
