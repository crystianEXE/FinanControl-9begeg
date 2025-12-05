import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RentalNote } from '../../services/rentalService';
import { rentalService } from '../../services/rentalService';
import { useLogistics } from '../../hooks/useLogistics';
import { logisticsService } from '../../services/logisticsService';
import { useMaterials } from '../../hooks/useMaterials';
import { theme } from '../../constants/theme';

interface RentalNoteViewerProps {
  rental: RentalNote;
}

export function RentalNoteViewer({ rental }: RentalNoteViewerProps) {
  const router = useRouter();
  const { getDeliveryById } = useLogistics();
  const { getMaterialById } = useMaterials();
  const delivery = rental.deliveryId ? getDeliveryById(rental.deliveryId) : undefined;
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>FinanControl</Text>
          <Text style={styles.logoSubtext}>Gestão de Eventos</Text>
        </View>
        
        <View style={styles.noteInfo}>
          <Text style={styles.noteNumber}>{rental.noteNumber}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${rentalService.getStatusColor(rental.status)}20` },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: rentalService.getStatusColor(rental.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: rentalService.getStatusColor(rental.status) },
              ]}
            >
              {rentalService.getStatusLabel(rental.status)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Cliente</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="person" size={20} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Nome</Text>
            <Text style={styles.infoValue}>{rental.customerName}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="card" size={20} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Documento</Text>
            <Text style={styles.infoValue}>{rental.customerDocument}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="call" size={20} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Telefone</Text>
            <Text style={styles.infoValue}>{rental.customerPhone}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={20} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>E-mail</Text>
            <Text style={styles.infoValue}>{rental.customerEmail}</Text>
          </View>
        </View>
        
        {rental.deliveryAddress && (
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Endereço de Entrega</Text>
              <Text style={styles.infoValue}>{rental.deliveryAddress}</Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Materiais Locados</Text>
        
        {rental.materials.map((material, index) => {
          const fullMaterial = getMaterialById(material.id);
          return (
            <View key={material.id} style={styles.materialRow}>
              <View style={styles.materialIndex}>
                <Text style={styles.materialIndexText}>{index + 1}</Text>
              </View>
              
              {fullMaterial?.imageUri && (
                <Image
                  source={{ uri: fullMaterial.imageUri }}
                  style={styles.materialImage}
                  contentFit="cover"
                />
              )}
              
              <View style={styles.materialInfo}>
                <Text style={styles.materialName}>{material.name}</Text>
                <Text style={styles.materialSku}>SKU: {material.sku}</Text>
                <Text style={styles.materialPrice}>R$ {(material.unitPrice || 150).toFixed(2)} / dia</Text>
              </View>
              
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>{material.quantity}x</Text>
              </View>
            </View>
          );
        })}
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total de Itens:</Text>
          <Text style={styles.totalValue}>
            {rental.materials.reduce((sum, m) => sum + m.quantity, 0)} unidades
          </Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Valor Total:</Text>
          <Text style={styles.totalValuePrice}>
            R$ {rental.materials.reduce((sum, m) => sum + ((m.unitPrice || 150) * m.quantity), 0).toFixed(2)}
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Período de Locação</Text>
        
        <View style={styles.dateRow}>
          <View style={styles.dateCard}>
            <Ionicons name="calendar" size={24} color={theme.colors.success} />
            <Text style={styles.dateLabel}>Data de Saída</Text>
            <Text style={styles.dateValue}>
              {rentalService.formatDateShort(rental.rentalDate)}
            </Text>
          </View>
          
          <View style={styles.dateCard}>
            <Ionicons name="calendar" size={24} color={theme.colors.warning} />
            <Text style={styles.dateLabel}>Devolução Prevista</Text>
            <Text style={styles.dateValue}>
              {rentalService.formatDateShort(rental.expectedReturnDate)}
            </Text>
          </View>
        </View>
        
        {rental.actualReturnDate && (
          <View style={styles.returnCard}>
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
            <View style={styles.returnInfo}>
              <Text style={styles.returnLabel}>Devolvido em</Text>
              <Text style={styles.returnValue}>
                {rentalService.formatDate(rental.actualReturnDate)}
              </Text>
            </View>
          </View>
        )}
      </View>
      
      {delivery && (
        <>
          <View style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status de Entrega</Text>
            
            <View style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <Ionicons
                  name={logisticsService.getTypeIcon(delivery.type)}
                  size={32}
                  color={theme.colors.primary}
                />
                <View style={styles.deliveryHeaderInfo}>
                  <Text style={styles.deliveryType}>
                    {logisticsService.getTypeLabel(delivery.type)}
                  </Text>
                  <View
                    style={[
                      styles.deliveryStatusBadge,
                      { backgroundColor: `${logisticsService.getStatusColor(delivery.status)}20` },
                    ]}
                  >
                    <View
                      style={[
                        styles.deliveryStatusDot,
                        { backgroundColor: logisticsService.getStatusColor(delivery.status) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.deliveryStatusText,
                        { color: logisticsService.getStatusColor(delivery.status) },
                      ]}
                    >
                      {logisticsService.getStatusLabel(delivery.status)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.deliveryInfo}>
                <View style={styles.deliveryInfoRow}>
                  <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.deliveryInfoText}>
                    Agendado: {rentalService.formatDateShort(delivery.scheduledDate)}
                  </Text>
                </View>
                
                {delivery.deliveredDate && (
                  <View style={styles.deliveryInfoRow}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                    <Text style={styles.deliveryInfoText}>
                      Entregue: {rentalService.formatDateShort(delivery.deliveredDate)}
                    </Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.viewDeliveryButton}
                onPress={() => router.push('/logistics')}
              >
                <Text style={styles.viewDeliveryButtonText}>Ver detalhes da entrega</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
      
      <View style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cláusulas Contratuais</Text>
        <View style={styles.clausesCard}>
          <Text style={styles.clauseText}>
            1. OBJETO: A presente locação tem por objeto os materiais listados acima, os quais são entregues em perfeitas condições de uso e devem ser devolvidos nas mesmas condições.
          </Text>
          <Text style={styles.clauseText}>
            2. RESPONSABILIDADE: O locatário é responsável pelos materiais desde a retirada até a devolução, devendo ressarcir quaisquer danos ou extravios.
          </Text>
          <Text style={styles.clauseText}>
            3. DEVOLUÇÃO: A devolução deve ocorrer na data prevista. O atraso acarretará cobrança de nova diária por cada dia de atraso.
          </Text>
          <Text style={styles.clauseText}>
            4. CONSERVAÇÃO: É proibido furar, colar, cortar, pintar ou adesivar os materiais. Qualquer dano será cobrado.
          </Text>
          <Text style={styles.clauseText}>
            5. INADIMPLÊNCIA: Em caso de atraso no pagamento, será cobrada multa de 2% mais juros de 1% ao mês.
          </Text>
        </View>
      </View>
      
      {rental.notes && (
        <>
          <View style={styles.divider} />
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{rental.notes}</Text>
            </View>
          </View>
        </>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Documento gerado em {rentalService.formatDate(rental.createdAt)}
        </Text>
        <Text style={styles.footerSubtext}>
          Este documento comprova a locação dos materiais listados
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
  },
  
  logo: {
    flex: 1,
  },
  
  logoText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  
  logoSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  noteInfo: {
    alignItems: 'flex-end',
  },
  
  noteNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.xs,
  },
  
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  
  section: {
    padding: theme.spacing.lg,
  },
  
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  
  infoLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  
  materialImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  
  materialIndex: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  
  materialIndexText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  materialInfo: {
    flex: 1,
  },
  
  materialName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  materialSku: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  
  materialPrice: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  
  quantityBadge: {
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  quantityText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  totalLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  totalValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  
  totalValuePrice: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.success,
  },
  
  clausesCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  
  clauseText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
    textAlign: 'justify',
  },
  
  dateRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  
  dateCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  
  dateLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  dateValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  
  returnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.success}10`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  
  returnInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  
  returnLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  
  returnValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
  
  notesCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  
  notesText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  footerSubtext: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  
  deliveryCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  
  deliveryHeaderInfo: {
    flex: 1,
  },
  
  deliveryType: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  deliveryStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  deliveryStatusDot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.xs,
  },
  
  deliveryStatusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  
  deliveryInfo: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  
  deliveryInfoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  
  viewDeliveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  
  viewDeliveryButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
});
