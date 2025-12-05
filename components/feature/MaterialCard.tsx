import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../../constants/theme';
import { Material, materialService } from '../../services/materialService';
import { useAlert } from '@/template';

interface MaterialCardProps {
  material: Material;
  onEntry: (quantity: number) => void;
  onExit: (quantity: number) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MaterialCard({ material, onEntry, onExit, onEdit, onDelete }: MaterialCardProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [showQR, setShowQR] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const available = materialService.calculateAvailable(material);
  const statusColor = materialService.getStatusColor(material.status);
  const statusLabel = materialService.getStatusLabel(material.status);
  
  const handleEntry = () => {
    onEntry(1);
    showAlert('Entrada registrada', 'Quantidade adicionada ao estoque');
  };
  
  const handleExit = () => {
    if (available === 0) {
      showAlert('Sem estoque', 'Não há unidades disponíveis para locação');
      return;
    }
    onExit(1);
    showAlert('Saída registrada', 'Item marcado como locado');
  };
  
  const handleEdit = () => {
    router.push(`/edit-material?id=${material.id}`);
  };
  
  const handleDelete = () => {
    if (material.rentedQuantity > 0) {
      showAlert(
        'Não é possível excluir',
        'Este material possui unidades locadas. Realize a devolução antes de excluir.'
      );
      return;
    }
    
    showAlert(
      'Confirmar exclusão',
      `Deseja excluir o material "${material.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            if (onDelete) onDelete();
            showAlert('Material excluído', 'O material foi removido com sucesso');
          },
        },
      ]
    );
  };
  
  return (
    <View style={styles.card}>
      <View style={styles.mainContent}>
        {material.imageUri && (
          <Image
            source={{ uri: material.imageUri }}
            style={styles.materialImage}
            contentFit="cover"
          />
        )}
        
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{material.name}</Text>
              <Text style={styles.sku}>SKU: {material.sku}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setShowQR(!showQR)}>
                <Ionicons name="qr-code" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowActions(!showActions)}>
                <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
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
      
      {showQR && (
        <View style={styles.qrContainer}>
          <QRCode value={material.sku} size={120} />
        </View>
      )}
      
      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Disponível:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.success }]}>
            {available} / {material.totalQuantity}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Locado:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.warning }]}>
            {material.rentedQuantity}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Localização:</Text>
          <Text style={styles.infoValue}>{material.location}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>
      </View>
      
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.entryButton]}
              onPress={handleEntry}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionText}>Entrada</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.exitButton]}
              onPress={handleExit}
              disabled={available === 0}
            >
              <Ionicons name="remove-circle" size={20} color="#FFFFFF" />
              <Text style={styles.actionText}>Saída</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    overflow: 'hidden',
  },
  
  mainContent: {
    flexDirection: 'row',
  },
  
  materialImage: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.surface,
  },
  
  contentWrapper: {
    flex: 1,
    padding: theme.spacing.md,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  
  headerLeft: {
    flex: 1,
  },
  
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  
  actionsMenu: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
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
  
  name: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  sku: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  qrContainer: {
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  
  info: {
    marginBottom: theme.spacing.sm,
  },
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  infoValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
  
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  
  entryButton: {
    backgroundColor: theme.colors.success,
  },
  
  exitButton: {
    backgroundColor: theme.colors.danger,
  },
  
  actionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
});
