# 📱 EstoqueControl - Guia Completo de Build e Publicação

## ✅ Checklist Pré-Build

### Funcionalidades Implementadas
- ✅ **Persistência de Dados**: Todos os contextos salvam em AsyncStorage
- ✅ **Dashboard em Tempo Real**: Indicadores atualizados automaticamente
- ✅ **Sistema de Materiais**: Cadastro, edição, fotos, QR codes, status
- ✅ **Sistema de Clientes**: Cadastro, edição, validações
- ✅ **Sistema de Locações**: Carrinho múltiplo, notas, devoluções
- ✅ **Geração de PDF**: Notas profissionais com logo e cláusulas
- ✅ **Scanner QR Code**: Funcional para saída de materiais
- ✅ **Logística**: Entregas e retiradas
- ✅ **Relatórios**: Análises em tempo real
- ✅ **Status de Materiais**: Disponível/Manutenção/Danificado/Baixa

### Navegação
- ✅ Tabs funcionais (Dashboard, Materiais, Clientes, Locados, Bip/Scan, Relatórios)
- ✅ Modais corretamente configurados
- ✅ Navegação sem crashes
- ✅ Safe areas implementadas

### Estado & Dados
- ✅ Contextos com AsyncStorage
- ✅ Loading states
- ✅ Error handling com alerts
- ✅ Validações de formulários

---

## 🏗️ BUILD - ANDROID

### 1. Pré-requisitos
```bash
# Verificar Node.js (versão 16+)
node --version

# Verificar Expo CLI
npx expo --version
```

### 2. Configuração do app.json
Arquivo já configurado com:
- ✅ Nome: EstoqueControl
- ✅ Slug: estoquecontrol
- ✅ Ícone: assets/images/logo.png
- ✅ Splash screen configurado

### 3. Build APK (Desenvolvimento)
```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Login na Expo (criar conta em expo.dev se necessário)
eas login

# Configurar projeto
eas build:configure

# Build APK
eas build --platform android --profile preview
```

**Aguardar ~10-15 minutos**. Você receberá um link para download do APK.

### 4. Build AAB (Produção - Google Play)
```bash
# Build para produção
eas build --platform android --profile production
```

---

## 🍎 BUILD - iOS

### 1. Pré-requisitos
- Conta Apple Developer ($99/ano)
- Computador macOS com Xcode

### 2. Build iOS
```bash
# Build para simulador (desenvolvimento)
eas build --platform ios --profile preview

# Build para App Store (produção)
eas build --platform ios --profile production
```

---

## 📦 PUBLICAÇÃO - GOOGLE PLAY STORE

### 1. Criar Conta Google Play Console
- Acesse: https://play.google.com/console
- Taxa única: $25 USD
- Preencha informações da conta de desenvolvedor

### 2. Criar Novo App
1. Clicar em "Criar app"
2. Preencher:
   - **Nome**: EstoqueControl
   - **Idioma padrão**: Português (Brasil)
   - **Tipo de app**: Aplicativo
   - **Categoria**: Negócios / Produtividade

### 3. Upload do AAB
1. Menu lateral → **Lançamentos** → **Produção**
2. Clicar em "Criar novo lançamento"
3. Upload do arquivo `.aab` gerado pelo EAS
4. Preencher:
   - Nome do lançamento: `1.0.0`
   - Notas de versão (português):
     ```
     Versão inicial do EstoqueControl
     - Gestão de estoque de materiais
     - Cadastro de clientes
     - Sistema de locações
     - Geração de notas em PDF
     - QR Code para rastreamento
     ```

### 4. Conteúdo da Loja
**Título**: EstoqueControl - Gestão de Locações

**Descrição curta** (80 caracteres):
```
Sistema completo para gestão de locações de equipamentos e materiais
```

**Descrição completa**:
```
EstoqueControl é o sistema definitivo para empresários do ramo de locação de equipamentos e materiais para eventos.

🎯 FUNCIONALIDADES PRINCIPAIS:
• Gestão completa de estoque com fotos
• Cadastro de clientes com validações
• Sistema de locações com múltiplos itens
• Geração automática de notas em PDF
• QR Code para rastreamento de materiais
• Controle de status (Disponível/Manutenção/Danificado)
• Dashboard em tempo real
• Relatórios e análises
• Sistema de devoluções com observações
• Logística de entregas e retiradas

💼 IDEAL PARA:
✓ Empresas de locação de equipamentos
✓ Fornecedores para eventos
✓ Locadoras de materiais
✓ Gestores de estoque

📊 BENEFÍCIOS:
• Organização total do negócio
• Controle profissional de locações
• Redução de perdas e extravios
• Agilidade no atendimento
• Relatórios precisos

Desenvolvido por Crystian Fernando Gomes da Silva - 2025
```

### 5. Screenshots Necessários
**Mínimo 2, recomendado 8 capturas de tela:**
1. Dashboard com estatísticas
2. Lista de materiais com fotos
3. Cadastro de material
4. Lista de clientes
5. Sistema de saída (Bip/Scan)
6. Nota de locação
7. Lista de locados
8. Relatórios

**Formato**: 1080x1920 (portrait) ou 1920x1080 (landscape)

### 6. Ícone da Loja
- Tamanho: 512x512 px
- Formato: PNG 32-bit
- Já existe: `assets/images/logo.png` (redimensionar se necessário)

### 7. Classificação de Conteúdo
Responder questionário:
- **Público-alvo**: 3+ anos (aplicativo de negócios)
- **Sem violência, sexo, drogas, etc.**

### 8. Política de Privacidade
**OBRIGATÓRIO**. Exemplo mínimo:
```
POLÍTICA DE PRIVACIDADE - EstoqueControl

1. COLETA DE DADOS
O EstoqueControl armazena dados localmente no dispositivo do usuário:
- Informações de materiais cadastrados
- Dados de clientes (nome, documento, contato)
- Registros de locações
- Fotos de materiais

2. USO DOS DADOS
Os dados são utilizados exclusivamente para funcionamento do aplicativo e gestão do negócio do usuário.

3. ARMAZENAMENTO
Todos os dados são armazenados localmente no dispositivo. Não enviamos dados para servidores externos.

4. COMPARTILHAMENTO
Não compartilhamos dados com terceiros.

5. CONTATO
Para dúvidas: [seu-email@example.com]

Última atualização: Janeiro 2025
```

Hospedar em: https://docs.google.com/document ou seu próprio site

### 9. Revisão e Lançamento
1. Revisar todas as informações
2. Clicar em "Enviar para revisão"
3. **Aguardar aprovação**: 1-7 dias úteis
4. Após aprovação → App estará disponível na Google Play Store

---

## 🍎 PUBLICAÇÃO - APP STORE (iOS)

### 1. Conta Apple Developer
- Acesse: https://developer.apple.com
- Custo: $99/ano
- Criar certificados e provisioning profiles

### 2. App Store Connect
1. Acesse: https://appstoreconnect.apple.com
2. Clicar em "Meus Apps" → "+"
3. Preencher:
   - **Nome**: EstoqueControl
   - **Idioma principal**: Português (Brasil)
   - **Bundle ID**: app.onspace.ai.estoquecontrol
   - **SKU**: estoquecontrol-2025

### 3. Upload via EAS
```bash
# Build e upload automático
eas submit --platform ios
```

### 4. Informações do App
- **Categoria primária**: Negócios
- **Categoria secundária**: Produtividade
- **Classificação**: 4+ (sem conteúdo censurável)

### 5. Screenshots
**Necessário para cada tamanho de dispositivo:**
- iPhone 6.9" (iPhone 16 Pro Max)
- iPhone 6.7" (iPhone 15 Pro Max)
- iPhone 6.5" (iPhone 11 Pro Max)
- iPad Pro 12.9"

**Usar simuladores do Xcode ou ferramenta online**

### 6. Revisão Apple
1. Preencher todas as informações
2. Submeter para revisão
3. **Aguardar**: 1-3 dias úteis
4. Apple testa o app manualmente

---

## 🔄 ATUALIZAÇÕES FUTURAS

### Incrementar Versão
```javascript
// app.json
{
  "expo": {
    "version": "1.0.1",  // Mudar aqui
    "ios": {
      "buildNumber": "2"  // iOS: incrementar
    },
    "android": {
      "versionCode": 2    // Android: incrementar
    }
  }
}
```

### Build Nova Versão
```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Module not found"
```bash
# Limpar cache
npx expo start -c

# Reinstalar node_modules
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Duplicate class"
```bash
# Limpar gradle (Android)
cd android
./gradlew clean
cd ..
```

### App não abre depois do build
- Verificar permissões no AndroidManifest.xml
- Testar em dispositivo real, não apenas emulador

### Build falha no EAS
- Verificar internet estável
- Conferir créditos na conta Expo
- Revisar logs de erro fornecidos

---

## 📞 SUPORTE

**Desenvolvedor**: Crystian Fernando Gomes da Silva
**Ano**: 2025
**Plataforma**: OnSpace - https://www.onspace.ai

---

## 📝 NOTAS IMPORTANTES

1. **Teste em dispositivos reais** antes de publicar
2. **Mantenha backup** dos certificados e chaves
3. **Documente mudanças** em cada atualização
4. **Monitore reviews** após publicação
5. **Responda usuários** rapidamente
6. **Atualize regularmente** para correções e melhorias

---

## 🎉 PARABÉNS!

Seu app EstoqueControl está pronto para ser publicado e usado profissionalmente! 

Sistema completo com:
✅ Todas as funcionalidades implementadas
✅ Persistência de dados
✅ Interface profissional
✅ Pronto para produção

**PRÓXIMOS PASSOS:**
1. Fazer build via EAS
2. Testar APK/IPA em dispositivos reais
3. Preparar screenshots profissionais
4. Criar conta nas lojas
5. Publicar!

Boa sorte com seu aplicativo! 🚀
