import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Button } from '../components';
import { useContracts } from '../hooks/useContracts';
import { useAlert } from '@/template';
import { theme } from '../constants/theme';
import { contractService } from '../services/contractService';

export default function ViewContractScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getContractById } = useContracts();
  const { showAlert } = useAlert();
  
  const contract = getContractById(id!);
  
  if (!contract) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.notFound}>
          <Ionicons name="document-text-outline" size={64} color={theme.colors.textLight} />
          <Text style={styles.notFoundText}>Contrato não encontrado</Text>
          <Button title="Voltar" variant="primary" onPress={() => router.back()} />
        </View>
      </View>
    );
  }
  
  const handleShare = async () => {
    try {
      const shareMessage = `📄 CONTRATO DE LOCAÇÃO ${contract.contractNumber}\n\n` +
        `👤 Cliente: ${contract.customerName}\n` +
        `📅 Data: ${contractService.formatDate(contract.orderDate)}\n` +
        `📦 Total de itens: ${contract.items.reduce((sum, item) => sum + item.quantity, 0)}\n` +
        `💰 Valor Total: ${contractService.formatCurrency(contract.totalAmount)}\n\n` +
        `🔄 Período: ${contractService.formatDate(contract.rentalStartDate)} até ${contractService.formatDate(contract.rentalEndDate)}`;
      
      await Share.share({
        message: shareMessage,
        title: `Contrato ${contract.contractNumber}`,
      });
    } catch (error) {
      console.error('Share error:', error);
      showAlert('Erro', 'Não foi possível compartilhar o contrato');
    }
  };
  
  const handleDownload = async () => {
    showAlert(
      'Salvar Contrato',
      'Use o botão de compartilhar para enviar este contrato por WhatsApp, E-mail ou outras opções disponíveis no seu dispositivo.'
    );
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Visualizar Contrato</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleDownload} style={styles.headerButton}>
            <Ionicons name="download-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scroll}>
        <View style={styles.contractContainer}>
          {/* Header */}
          <View style={styles.contractHeader}>
            <Text style={styles.contractTitle}>CONTRATO DE LOCAÇÃO E TERMO DE RESPONSABILIDADE</Text>
          </View>
          
          {/* Informações Gerais */}
          <View style={styles.contractSection}>
            <Text style={styles.sectionTitle}>INFORMAÇÕES GERAIS</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cliente:</Text>
              <Text style={styles.infoValue}>{contract.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data do Pedido:</Text>
              <Text style={styles.infoValue}>
                {contractService.formatDate(contract.orderDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{contract.customerDocumentType.toUpperCase()}:</Text>
              <Text style={styles.infoValue}>{contract.customerDocument}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefone:</Text>
              <Text style={styles.infoValue}>{contract.customerPhone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>E-mail:</Text>
              <Text style={styles.infoValue}>{contract.customerEmail}</Text>
            </View>
            {contract.customerAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Endereço:</Text>
                <Text style={styles.infoValue}>
                  {contract.customerAddress.street}, {contract.customerAddress.number}, {contract.customerAddress.city}/{contract.customerAddress.state}
                </Text>
              </View>
            )}
          </View>
          
          {/* Período da Locação */}
          <View style={styles.contractSection}>
            <View style={styles.dateRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Início Locação</Text>
                <Text style={styles.dateValue}>
                  {contractService.formatDate(contract.rentalStartDate)}
                </Text>
              </View>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Término Locação</Text>
                <Text style={styles.dateValue}>
                  {contractService.formatDate(contract.rentalEndDate)}
                </Text>
              </View>
            </View>
            {contract.eventPurpose && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Objetivo da Locação:</Text>
                <Text style={styles.infoValue}>{contract.eventPurpose}</Text>
              </View>
            )}
          </View>
          
          {/* Logística */}
          <View style={styles.contractSection}>
            <Text style={styles.sectionTitle}>INFORMAÇÕES DE LOGÍSTICA</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo:</Text>
              <Text style={styles.infoValue}>
                {contract.deliveryType === 'pickup' ? 'RETIRAR NA LOJA' : 'ENTREGA'}
              </Text>
            </View>
            {contract.deliveryAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Endereço de Entrega:</Text>
                <Text style={styles.infoValue}>{contract.deliveryAddress}</Text>
              </View>
            )}
            <View style={styles.dateRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Entrega</Text>
                <Text style={styles.dateValue}>
                  {contractService.formatDate(contract.deliveryDate)} {contractService.formatTime(contract.deliveryTime)}
                </Text>
              </View>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Devolução</Text>
                <Text style={styles.dateValue}>
                  {contractService.formatDate(contract.returnDate)} {contractService.formatTime(contract.returnTime)}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Lista de Itens */}
          <View style={styles.contractSection}>
            <Text style={styles.sectionTitle}>LISTA DE ITENS</Text>
            
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>ITEM</Text>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>QTD</Text>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>DIAS</Text>
              <Text style={[styles.tableCell, { flex: 0.7 }]}>UNIT.</Text>
              <Text style={[styles.tableCell, { flex: 0.7 }]}>TOTAL</Text>
            </View>
            
            {contract.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 1.5, alignItems: 'flex-start' }]}>
                  {item.imageUri && (
                    <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
                  )}
                  <View>
                    <Text style={styles.itemSku}>{item.sku}</Text>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.dimensions && (
                      <Text style={styles.itemDimensions}>
                        {contractService.formatDimensions(item.dimensions)}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>{item.days}</Text>
                <Text style={[styles.tableCell, { flex: 0.7 }]}>
                  {contractService.formatCurrency(item.unitPrice)}
                </Text>
                <Text style={[styles.tableCell, { flex: 0.7 }]}>
                  {contractService.formatCurrency(item.total)}
                </Text>
              </View>
            ))}
            
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>SUBTOTAL DO PEDIDO (R$)</Text>
                <Text style={styles.totalValue}>
                  {contractService.formatCurrency(contract.subtotal)}
                </Text>
              </View>
              <View style={[styles.totalRow, styles.totalRowFinal]}>
                <Text style={styles.totalLabelFinal}>TOTAL GERAL (R$)</Text>
                <Text style={styles.totalValueFinal}>
                  {contractService.formatCurrency(contract.totalAmount)}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Cláusulas */}
          <View style={styles.contractSection}>
            <Text style={styles.sectionTitle}>CLÁUSULAS DO CONTRATO</Text>
            {contractService.getContractClauses().map((clause, index) => (
              <Text key={index} style={styles.clause}>
                {clause}
              </Text>
            ))}
          </View>
          
          {/* Assinaturas */}
          <View style={styles.signatureSection}>
            <Text style={styles.signatureDate}>
              {contractService.formatDate(contract.orderDate)}
            </Text>
            
            <View style={styles.signatureRow}>
              <View style={styles.signatureBox}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Assinatura do Locatário</Text>
              </View>
              
              <View style={styles.signatureBox}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Assinatura da Locadora</Text>
              </View>
            </View>
          </View>
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
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  
  headerButton: {
    padding: theme.spacing.xs,
  },
  
  scroll: {
    flex: 1,
  },
  
  contractContainer: {
    backgroundColor: '#FFFFFF',
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.lg,
  },
  
  contractHeader: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.lg,
  },
  
  contractTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  contractSection: {
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  },
  
  infoRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  
  infoLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  
  infoValue: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  
  dateRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  
  dateBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  
  dateLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  dateValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  
  tableRow: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  tableCell: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    textAlign: 'center',
  },
  
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  
  itemSku: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  
  itemName: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  
  itemDimensions: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  totalSection: {
    marginTop: theme.spacing.md,
  },
  
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.sm,
    backgroundColor: '#F3F4F6',
    marginBottom: theme.spacing.xs,
  },
  
  totalRowFinal: {
    backgroundColor: theme.colors.primary,
  },
  
  totalLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  totalValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  totalLabelFinal: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  totalValueFinal: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  clause: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 16,
    textAlign: 'justify',
  },
  
  signatureSection: {
    marginTop: theme.spacing.lg,
  },
  
  signatureDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: theme.spacing.lg,
  },
  
  signatureBox: {
    flex: 1,
    alignItems: 'center',
  },
  
  signatureLine: {
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  signatureLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  
  notFoundText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
});
