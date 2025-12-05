
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Customer, customerService } from '../../services/customerService';
import { theme } from '../../constants/theme';
import { useAlert } from '@/template';

interface CustomerCardProps {
  customer: Customer;
  onPress?: () => void;
  onDelete?: () => void;
}

export function CustomerCard({ customer, onPress, onDelete }: CustomerCardProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [showActions, setShowActions] = useState(false);
  
  const handleEdit = () => {
    router.push(`/edit-customer?id=${customer.id}`);
  };
  
  const handleDelete = () => {
    if (customer.totalRentals > 0) {
      showAlert(
        'Não é possível excluir',
        'Este cliente possui locações ativas. Finalize todas as locações antes de excluir.'
      );
      return;
    }
    
    showAlert(
      'Confirmar exclusão',
      `Deseja excluir o cliente "${customer.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            if (onDelete) onDelete();
            showAlert('Cliente excluído', 'O cliente foi removido com sucesso');
          },
        },
      ]
    );
  };
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity style={styles.cardContent} onPress={onPress} activeOpacity={0.7}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.info}>
            <Text style={styles.name}>{customer.name}</Text>
            <View style={styles.row}>
              <Ionicons name="mail" size={12} color={theme.colors.textSecondary} />
              <Text style={styles.email}>{customer.email}</Text>
            </View>
          </View>
          
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{customer.totalRentals}</Text>
            <Text style={styles.badgeLabel}>locações</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => setShowActions(!showActions)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      {showActions && (
        <View style={styles.actionsMenu}>
          <TouchableOpacity style={styles.actionMenuItem} onPress={handleEdit}>
            <Ionicons name="pencil" size={20} color={theme.colors.primary} />
            <Text style={styles.actionMenuText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionMenuItem} onPress={handleDelete}>
            <Ionicons name="trash" size={20} color={theme.colors.danger} />
            <Text style={[styles.actionMenuText, { color: theme.colors.danger }]}>Excluir</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {customerService.formatPhone(customer.phone)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="card" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>
            {customerService.formatDocument(customer.document, customer.documentType)}
          </Text>
        </View>
      </View>
      
      {customer.address && (
        <View style={styles.address}>
          <Ionicons name="location" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.addressText}>
            {customer.address.street}, {customer.address.number} - {customer.address.city}/{customer.address.state}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  moreButton: {
    padding: theme.spacing.xs,
  },
  
  actionsMenu: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  
  actionMenuText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  
  avatarText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  info: {
    flex: 1,
  },
  
  name: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  
  email: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  badge: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  badgeText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  
  badgeLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  
  details: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
  
  address: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  
  addressText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
