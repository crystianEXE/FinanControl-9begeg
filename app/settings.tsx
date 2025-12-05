import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { theme } from '../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  
  const [notifications, setNotifications] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  
  const handleExportData = () => {
    showAlert('Exportar Dados', 'Funcionalidade de exportação em desenvolvimento. Em breve você poderá exportar todos os dados em CSV/Excel');
  };
  
  const handleImportData = () => {
    showAlert('Importar Dados', 'Funcionalidade de importação em desenvolvimento. Em breve você poderá importar dados de outros sistemas');
  };
  
  const handleClearCache = () => {
    showAlert('Limpar Cache', 'Cache limpo com sucesso!', [
      { text: 'OK', style: 'default' }
    ]);
  };
  
  const handleAbout = () => {
    showAlert(
      'Sobre o FinanControl',
      'Sistema de gerenciamento de estoque para locação de equipamentos em eventos.\n\nVersão: 1.0.0 (Protótipo)\n\nDesenvolvido com React Native + Expo'
    );
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Notificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notificações</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Ativar Notificações</Text>
              <Text style={styles.settingDescription}>Receber alertas do sistema</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Alerta de Estoque Baixo</Text>
              <Text style={styles.settingDescription}>Notificar quando quantidade estiver baixa</Text>
            </View>
            <Switch
              value={lowStockAlert}
              onValueChange={setLowStockAlert}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </View>
        
        {/* Dados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Gerenciar Dados</Text>
          
          <TouchableOpacity style={styles.settingButton} onPress={handleExportData}>
            <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.success}20` }]}>
              <Ionicons name="download" size={20} color={theme.colors.success} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Exportar Dados</Text>
              <Text style={styles.settingDescription}>Baixar backup em CSV/Excel</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingButton} onPress={handleImportData}>
            <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.info}20` }]}>
              <Ionicons name="cloud-upload" size={20} color={theme.colors.info} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Importar Dados</Text>
              <Text style={styles.settingDescription}>Carregar dados de outros sistemas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Backup Automático</Text>
              <Text style={styles.settingDescription}>Salvar dados diariamente</Text>
            </View>
            <Switch
              value={autoBackup}
              onValueChange={setAutoBackup}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </View>
        
        {/* Impressoras */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🖨️ Impressoras</Text>
          
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => showAlert('Impressoras', 'Configuração de impressoras térmicas em desenvolvimento')}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.secondary}20` }]}>
              <Ionicons name="print" size={20} color={theme.colors.secondary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Impressoras Térmicas</Text>
              <Text style={styles.settingDescription}>Configurar impressão de QR Codes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>
        
        {/* Segurança */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Segurança e Privacidade</Text>
          
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => showAlert('Níveis de Acesso', 'Gerenciamento de permissões em desenvolvimento')}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.warning}20` }]}>
              <Ionicons name="shield-checkmark" size={20} color={theme.colors.warning} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Níveis de Acesso</Text>
              <Text style={styles.settingDescription}>Gerenciar permissões de usuários</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>
        
        {/* Sistema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Sistema</Text>
          
          <TouchableOpacity style={styles.settingButton} onPress={handleClearCache}>
            <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.danger}20` }]}>
              <Ionicons name="trash" size={20} color={theme.colors.danger} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Limpar Cache</Text>
              <Text style={styles.settingDescription}>Liberar espaço de armazenamento</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingButton} onPress={handleAbout}>
            <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sobre</Text>
              <Text style={styles.settingDescription}>Informações do aplicativo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>FinanControl v1.0.0</Text>
          <Text style={styles.footerSubtext}>Sistema de Gestão de Estoque</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  scroll: {
    flex: 1,
  },
  
  content: {
    padding: theme.spacing.lg,
  },
  
  section: {
    marginBottom: theme.spacing.xl,
  },
  
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  
  settingInfo: {
    flex: 1,
  },
  
  settingLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  
  footerText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  footerSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
