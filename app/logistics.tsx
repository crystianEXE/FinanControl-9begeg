import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLogistics } from '../hooks/useLogistics';
import { useRentals } from '../hooks/useRentals';
import { logisticsService } from '../services/logisticsService';
import { useAlert } from '@/template';
import { theme } from '../constants/theme';

export default function LogisticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { deliveries, updateDeliveryStatus } = useLogistics();
  const { rentals } = useRentals();
  const { showAlert } = useAlert();
  
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleStatusChange = (id: string, currentStatus: string) => {
    const statusFlow = {
      scheduled: 'in_transit',
      in_transit: 'delivered',
      delivered: 'delivered',
      cancelled: 'cancelled',
    };
    
    const nextStatus = statusFlow[currentStatus as keyof typeof statusFlow];
    
    if (nextStatus === currentStatus) {
      showAlert('Status final', 'Esta entrega já foi concluída');
      return;
    }
    
    updateDeliveryStatus(id, nextStatus as any);
    showAlert('Status atualizado', `Status alterado para: ${logisticsService.getStatusLabel(nextStatus as any)}`);
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Logística</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Entregas e Retiradas</Text>
          <Text style={styles.subtitle}>{deliveries.length} agendamentos</Text>
        </View>
        
        {deliveries.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={64} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>Nenhuma entrega agendada</Text>
          </View>
        ) : (
          <FlatList
            data={deliveries}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const linkedRental = rentals.find(r => r.deliveryId === item.id);
              
              return (
              <View style={styles.deliveryCard}>
                {item.rentalNoteNumber && (
                  <View style={styles.noteNumberBadge}>
                    <Ionicons name="document-text" size={14} color={theme.colors.primary} />
                    <Text style={styles.noteNumberText}>{item.rentalNoteNumber}</Text>
                  </View>
                )}
                
                <View style={styles.deliveryHeader}>
                  <View style={styles.typeIcon}>
                    <Ionicons
                      name={logisticsService.getTypeIcon(item.type)}
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.customerName}>{item.customerName}</Text>
                    <Text style={styles.deliveryType}>
                      {logisticsService.getTypeLabel(item.type)}
                    </Text>
                  </View>
                  
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${logisticsService.getStatusColor(item.status)}20` },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: logisticsService.getStatusColor(item.status) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: logisticsService.getStatusColor(item.status) },
                      ]}
                    >
                      {logisticsService.getStatusLabel(item.status)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.deliveryDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{formatDate(item.scheduledDate)}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {item.address.street}, {item.address.number} - {item.address.city}/{item.address.state}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="cube" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{item.materialIds.length} materiais</Text>
                  </View>
                  
                  {item.notes && (
                    <View style={styles.notesRow}>
                      <Ionicons name="information-circle" size={16} color={theme.colors.info} />
                      <Text style={styles.notesText}>{item.notes}</Text>
                    </View>
                  )}
                </View>
                
                {item.status !== 'delivered' && item.status !== 'cancelled' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleStatusChange(item.id, item.status)}
                  >
                    <Text style={styles.actionButtonText}>
                      {item.status === 'scheduled' ? 'Iniciar Entrega' : 'Marcar como Entregue'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                {linkedRental && (
                  <TouchableOpacity
                    style={styles.viewNoteButton}
                    onPress={() => router.push(`/rental-note?id=${linkedRental.id}`)}
                  >
                    <Ionicons name="document-text" size={18} color={theme.colors.primary} />
                    <Text style={styles.viewNoteButtonText}>Ver Nota de Locação</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
  
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  
  titleRow: {
    marginBottom: theme.spacing.lg,
  },
  
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  deliveryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  
  deliveryInfo: {
    flex: 1,
  },
  
  customerName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  deliveryType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
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
  
  deliveryDetails: {
    gap: theme.spacing.sm,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  
  detailText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
    backgroundColor: `${theme.colors.info}10`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
  },
  
  notesText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.info,
  },
  
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  
  actionButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
  
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  
  noteNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  
  noteNumberText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  
  viewNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: `${theme.colors.primary}10`,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
  },
  
  viewNoteButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
});
