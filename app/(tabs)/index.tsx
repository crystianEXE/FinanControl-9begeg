import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, StatCard, SimpleChart } from '../../components';
import { useMaterials } from '../../hooks/useMaterials';
import { useCustomers } from '../../hooks/useCustomers';
import { useLogistics } from '../../hooks/useLogistics';
import { useContracts } from '../../hooks/useContracts';
import { useRentals } from '../../hooks/useRentals';
import { theme } from '../../constants/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const { getTotalItems, getTotalRented, getTotalAvailable, chartData, loading, materials, refreshChartData } = useMaterials();
  const { customers } = useCustomers();
  const { deliveries } = useLogistics();
  const { contracts } = useContracts();
  const { rentals } = useRentals();
  
  // Auto-refresh dashboard
  useEffect(() => {
    refreshChartData();
  }, [materials, rentals]);
  
  const activeDeliveries = deliveries.filter(d => d.status === 'scheduled' || d.status === 'in_transit').length;
  
  if (loading) {
    return (
      <Screen>
        <Text>Carregando...</Text>
      </Screen>
    );
  }
  
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoHeader}>
            <View style={styles.logoContainer}>
              <Ionicons name="clipboard" size={24} color="#FF8C00" />
              <View style={styles.logoBox}>
                <Ionicons name="cube" size={14} color="#FF8C00" />
              </View>
            </View>
            <View>
              <Text style={styles.greeting}>EstoqueControl</Text>
              <Text style={styles.subtitle}>Gestão Inteligente de Locações</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push('/(tabs)/materials')}
            activeOpacity={0.7}
          >
            <StatCard
              title="Total de Itens"
              value={getTotalItems()}
              icon="cube"
              colors={[theme.colors.primary, theme.colors.secondary]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push('/(tabs)/rentals')}
            activeOpacity={0.7}
          >
            <StatCard
              title="Itens Locados"
              value={getTotalRented()}
              icon="cube-outline"
              colors={[theme.colors.warning, '#F97316']}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push('/(tabs)/materials')}
            activeOpacity={0.7}
          >
            <StatCard
              title="Disponível"
              value={getTotalAvailable()}
              icon="checkmark-circle"
              colors={[theme.colors.success, '#059669']}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push('/(tabs)/materials')}
            activeOpacity={0.7}
          >
            <StatCard
              title="Manutenção"
              value={materials.filter(m => m.status === 'maintenance').length}
              icon="construct"
              colors={[theme.colors.info, '#3B82F6']}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push('/(tabs)/customers')}
            activeOpacity={0.7}
          >
            <StatCard
              title="Total Clientes"
              value={customers.length}
              icon="people"
              colors={[theme.colors.secondary, theme.colors.primary]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push('/(tabs)/rentals')}
            activeOpacity={0.7}
          >
            <StatCard
              title="Locações Ativas"
              value={rentals.filter(r => r.status === 'active').length}
              icon="document-text"
              colors={[theme.colors.danger, '#DC2626']}
            />
          </TouchableOpacity>
        </View>
        
        <SimpleChart data={chartData} />
        
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/rentals')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="document-text" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ver Locações</Text>
              <Text style={styles.actionSubtitle}>Materiais locados e devoluções</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/add-material')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Cadastrar Material</Text>
              <Text style={styles.actionSubtitle}>Adicionar novo item ao estoque</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/add-customer')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.secondary }]}>
              <Ionicons name="person-add" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Cadastrar Cliente</Text>
              <Text style={styles.actionSubtitle}>Adicionar novo cliente</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/scan')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.success }]}>
              <Ionicons name="scan" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Bip/Scan</Text>
              <Text style={styles.actionSubtitle}>Registrar entrada ou saída</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/logistics')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.info }]}>
              <Ionicons name="car" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Logística</Text>
              <Text style={styles.actionSubtitle}>Gerenciar entregas e retiradas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>
        
        {/* Créditos */}
        <View style={styles.creditsSection}>
          <View style={styles.creditsCard}>
            <Ionicons name="person-circle" size={48} color={theme.colors.primary} />
            <View style={styles.creditsContent}>
              <Text style={styles.creditsTitle}>Desenvolvido por</Text>
              <Text style={styles.creditsName}>Crystian Fernando Gomes da Silva</Text>
              <Text style={styles.creditsYear}>2025</Text>
            </View>
          </View>
          <Text style={styles.creditsDescription}>
            EstoqueControl foi desenvolvido pensando no empresário do ramo de locação de equipamentos e materiais para eventos. 
            Sistema completo para gestão de estoque, clientes, contratos e logística, trazendo eficiência e organização para o seu negócio.
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
  
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  
  logoContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#F3F4F6',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  logoBox: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  
  greeting: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  
  quickActions: {
    marginTop: theme.spacing.lg,
  },
  
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  
  actionContent: {
    flex: 1,
  },
  
  actionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  actionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  creditsSection: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  creditsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  
  creditsContent: {
    flex: 1,
  },
  
  creditsTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  creditsName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  
  creditsYear: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  creditsDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
});
