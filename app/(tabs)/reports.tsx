import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components';
import { useMaterials } from '../../hooks/useMaterials';
import { materialService } from '../../services/materialService';
import { theme } from '../../constants/theme';

export default function ReportsScreen() {
  const { materials, movements } = useMaterials();
  
  const stats = useMemo(() => {
    const totalValue = materials.reduce((sum, m) => sum + m.totalQuantity, 0);
    const totalRented = materials.reduce((sum, m) => sum + m.rentedQuantity, 0);
    const utilizationRate = totalValue > 0 ? ((totalRented / totalValue) * 100).toFixed(1) : 0;
    
    const mostRented = [...materials]
      .sort((a, b) => b.rentedQuantity - a.rentedQuantity)
      .slice(0, 5);
    
    const recentMovements = [...movements]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    
    const inField = materials.filter(m => m.status === 'in_field').length;
    const available = materials.filter(m => m.status === 'available').length;
    const maintenance = materials.filter(m => m.status === 'maintenance').length;
    
    return {
      totalValue,
      totalRented,
      utilizationRate,
      mostRented,
      recentMovements,
      statusCounts: { inField, available, maintenance },
    };
  }, [materials, movements]);
  
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entry': return 'arrow-down-circle';
      case 'exit': return 'arrow-up-circle';
      case 'return': return 'arrow-undo-circle';
      case 'info': return 'information-circle';
      default: return 'ellipse';
    }
  };
  
  const getMovementColor = (type: string) => {
    switch (type) {
      case 'entry': return theme.colors.success;
      case 'exit': return theme.colors.danger;
      case 'return': return theme.colors.info;
      case 'info': return theme.colors.textSecondary;
      default: return theme.colors.text;
    }
  };
  
  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'entry': return 'Entrada';
      case 'exit': return 'Saída';
      case 'return': return 'Devolução';
      case 'info': return 'Consulta';
      default: return type;
    }
  };
  
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatórios</Text>
          <Text style={styles.subtitle}>Análises em tempo real</Text>
        </View>
        
        {/* Resumo Geral */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Resumo Geral</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { borderLeftColor: theme.colors.primary }]}>
              <Text style={styles.statLabel}>Total de Itens</Text>
              <Text style={styles.statValue}>{stats.totalValue}</Text>
            </View>
            
            <View style={[styles.statBox, { borderLeftColor: theme.colors.warning }]}>
              <Text style={styles.statLabel}>Taxa de Uso</Text>
              <Text style={styles.statValue}>{stats.utilizationRate}%</Text>
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { borderLeftColor: theme.colors.success }]}>
              <Text style={styles.statLabel}>Disponíveis</Text>
              <Text style={styles.statValue}>{stats.statusCounts.available}</Text>
            </View>
            
            <View style={[styles.statBox, { borderLeftColor: theme.colors.danger }]}>
              <Text style={styles.statLabel}>Em Campo</Text>
              <Text style={styles.statValue}>{stats.statusCounts.inField}</Text>
            </View>
          </View>
        </View>
        
        {/* Materiais Mais Locados */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Top 5 Mais Locados</Text>
          
          {stats.mostRented.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma locação registrada</Text>
          ) : (
            stats.mostRented.map((material, index) => (
              <View key={material.id} style={styles.rankItem}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.rankContent}>
                  <Text style={styles.rankName}>{material.name}</Text>
                  <Text style={styles.rankSku}>{material.sku}</Text>
                </View>
                <View style={styles.rankStats}>
                  <Text style={styles.rankValue}>{material.rentedQuantity}</Text>
                  <Text style={styles.rankLabel}>locados</Text>
                </View>
              </View>
            ))
          )}
        </View>
        
        {/* Movimentações Recentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Últimas Movimentações</Text>
          
          {stats.recentMovements.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma movimentação registrada</Text>
          ) : (
            stats.recentMovements.map((movement) => {
              const material = materials.find(m => m.id === movement.materialId);
              if (!material) return null;
              
              return (
                <View key={movement.id} style={styles.movementItem}>
                  <View style={[
                    styles.movementIcon,
                    { backgroundColor: `${getMovementColor(movement.type)}20` }
                  ]}>
                    <Ionicons
                      name={getMovementIcon(movement.type)}
                      size={20}
                      color={getMovementColor(movement.type)}
                    />
                  </View>
                  
                  <View style={styles.movementContent}>
                    <Text style={styles.movementMaterial}>{material.name}</Text>
                    <View style={styles.movementDetails}>
                      <Text style={styles.movementType}>
                        {getMovementLabel(movement.type)}
                      </Text>
                      {movement.quantity > 0 && (
                        <Text style={styles.movementQuantity}>
                          • {movement.quantity} un.
                        </Text>
                      )}
                      {movement.customer && (
                        <Text style={styles.movementCustomer}>
                          • {movement.customer}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.movementDate}>
                      {formatDate(movement.timestamp)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
        
        {/* Status dos Materiais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Status dos Materiais</Text>
          
          <View style={styles.statusList}>
            {materials.map((material) => (
              <View key={material.id} style={styles.materialStatusItem}>
                <View style={styles.materialStatusInfo}>
                  <Text style={styles.materialStatusName}>{material.name}</Text>
                  <Text style={styles.materialStatusLocation}>
                    <Ionicons name="location" size={12} color={theme.colors.textSecondary} />
                    {' '}{material.location}
                  </Text>
                </View>
                
                <View style={styles.materialStatusBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: materialService.getStatusColor(material.status) }
                    ]}
                  />
                  <Text style={styles.materialStatusText}>
                    {materialService.getStatusLabel(material.status)}
                  </Text>
                </View>
                
                <Text style={styles.materialStatusQty}>
                  {materialService.calculateAvailable(material)}/{material.totalQuantity}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.footer}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.footerText}>
            Atualizado em tempo real
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
  },
  
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
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
  
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    ...theme.shadows.sm,
  },
  
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  
  rankNumber: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  rankContent: {
    flex: 1,
  },
  
  rankName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  rankSku: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  rankStats: {
    alignItems: 'flex-end',
  },
  
  rankValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  
  rankLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  
  movementItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  
  movementIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  
  movementContent: {
    flex: 1,
  },
  
  movementMaterial: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  movementDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  movementType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  movementQuantity: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  
  movementCustomer: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  
  movementDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  
  statusList: {
    gap: theme.spacing.sm,
  },
  
  materialStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  
  materialStatusInfo: {
    flex: 1,
  },
  
  materialStatusName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  materialStatusLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  materialStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.xs,
  },
  
  materialStatusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  
  materialStatusQty: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.lg,
  },
  
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
