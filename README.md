# 📦 EstoqueControl

> Sistema completo de gestão de estoque e locações para empresas de eventos e equipamentos

**Desenvolvido por:** Crystian Fernando Gomes da Silva - 2025

## 🎯 Sobre o Projeto

EstoqueControl é um aplicativo móvel desenvolvido com React Native e Expo, pensado especialmente para empresários do ramo de locação de equipamentos e materiais para eventos. O sistema oferece controle total sobre estoque, clientes, contratos e logística, trazendo eficiência e organização para o seu negócio.

## ✨ Funcionalidades

### 📊 Dashboard em Tempo Real
- Visão geral do estoque
- Materiais disponíveis e locados
- Itens em manutenção
- Total de clientes
- Locações ativas

### 🔧 Gestão de Materiais
- Cadastro completo de equipamentos
- Controle de quantidade total e disponível
- Status personalizáveis (Disponível, Locado, Manutenção, Danificado, Baixa)
- Upload de fotos dos materiais
- Histórico de alterações de status
- Geração automática de QR Codes
- Valores de locação e reposição

### 👥 Gestão de Clientes
- Cadastro completo de clientes
- Documentos e dados de contato
- Histórico de locações por cliente

### 📝 Sistema de Locações
- Saída de materiais via scanner QR Code ou manual
- Carrinho com múltiplos itens
- Configuração individual de quantidade, valor e dias
- Notas de locação profissionais em PDF
- Sistema de devoluções item por item
- Notas de devolução automáticas
- Validação de estado (normal, danificado, avariado)

### 🚚 Logística
- Controle de entregas e retiradas
- Agendamento de datas
- Endereços de entrega
- Status de logística

### 📄 Relatórios
- Top 5 materiais mais locados
- Últimas movimentações
- Status detalhado de todos os materiais
- Taxa de utilização do estoque

### 📱 Scanner QR Code
- Leitura via câmera
- Identificação automática de materiais
- Adição rápida ao carrinho de saída

## 🛠️ Tecnologias

- **React Native** - Framework mobile
- **Expo SDK 54+** - Ferramentas e APIs nativas
- **TypeScript** - Tipagem estática
- **Expo Router** - Navegação file-based
- **AsyncStorage** - Persistência local de dados
- **Expo Image Picker** - Upload de fotos
- **React Native PDF** - Geração de documentos
- **QR Code Scanner** - Leitura de códigos

## 📥 Instalação

```bash
# Clonar repositório
git clone [url-do-repositorio]

# Entrar no diretório
cd estoquecontrol

# Instalar dependências
npm install

# Iniciar em desenvolvimento
npx expo start
```

## 📱 Como Executar

### Desenvolvimento (Expo Go)
```bash
npx expo start
```
Escaneie o QR Code com o app Expo Go no seu celular.

### Build Android (APK)
```bash
# Via EAS (recomendado)
eas build --platform android --profile preview

# Local
npx expo run:android --variant release
```

### Build iOS
```bash
eas build --platform ios --profile production
```

## 📂 Estrutura do Projeto

```
app/              → Telas e navegação
components/       → Componentes reutilizáveis
contexts/         → Gerenciamento de estado global
hooks/            → Custom hooks
services/         → Lógica de negócio
constants/        → Temas e estilos
assets/           → Imagens e arquivos estáticos
```

## 🎨 Design System

O app utiliza um design system consistente com:
- Cores personalizáveis (tema light/dark)
- Componentes padronizados
- Ícones do @expo/vector-icons
- Tipografia hierárquica
- Espaçamentos consistentes
- Sombras e elevações

## 📖 Guia de Uso

### 1️⃣ Cadastrar Materiais
- Acesse "Materiais" → Botão "+"
- Preencha nome, código, quantidade
- Adicione foto (opcional)
- Defina valores de locação e reposição
- Salve

### 2️⃣ Cadastrar Clientes
- Acesse "Clientes" → Botão "+"
- Preencha dados completos
- Salve

### 3️⃣ Fazer uma Locação
- Acesse "Bip Scan"
- Selecione cliente
- Escaneie QR Code ou adicione manualmente
- Configure quantidade, valor e dias para cada item
- Preencha dados de entrega
- Gere a nota de locação

### 4️⃣ Fazer Devolução
- Acesse "Locados"
- Selecione a locação
- Clique no item para devolver
- Informe o estado do material
- Confirme a devolução
- Ao devolver todos os itens, uma nota de devolução é gerada

## 🔐 Dados e Privacidade

- Todos os dados são armazenados localmente no dispositivo
- Nenhuma informação é enviada para servidores externos
- Backup manual via exportação (funcionalidade futura)

## 🚀 Roadmap Futuro

- [ ] Integração com backend (Supabase)
- [ ] Sincronização em nuvem
- [ ] Backup automático
- [ ] Relatórios avançados
- [ ] Envio de notas por email/WhatsApp
- [ ] Multi-usuários
- [ ] Dashboard web

## 🐛 Problemas Conhecidos

Consulte o arquivo `SETUP_GUIDE.md` para soluções de problemas comuns.

## 📄 Licença

Todos os direitos reservados - Crystian Fernando Gomes da Silva © 2025

## 👤 Desenvolvedor

**Crystian Fernando Gomes da Silva**

EstoqueControl foi desenvolvido pensando no empresário do ramo de locação de equipamentos e materiais para eventos, trazendo uma solução completa, moderna e intuitiva para gestão do seu negócio.

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!**
