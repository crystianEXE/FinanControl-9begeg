import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button } from '../../components';
import { useRentals } from '../../hooks/useRentals';
import { useMaterials } from '../../hooks/useMaterials';
import { useAlert } from '@/template';
import { theme } from '../../constants/theme';
import { RentalNote } from '../../services/rentalService';

export default function RentalsScreen() {
  const router = useRouter();
  const { rentals, getActiveRentals, getOverdueRentals, returnMaterialFromRental } = useRentals();
  const { processReturn, updateMaterialStatus } = useMaterials();
  const { showAlert } = useAlert();
  
  const [filter, setFilter] = useState<'all' | 'active' | 'overdue' | 'returned'>('active');
  const [selectedRental, setSelectedRental] = useState<RentalNote | null>(null);
  const [returnObservations, setReturnObservations] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [materialToReturn, setMaterialToReturn] = useState<{ id: string; name: string; quantity: number } | null>(null);
  
  const getFilteredRentals = () => {
    switch (filter) {
      case 'active':
        return getActiveRentals();
      case 'overdue':
        return getOverdueRentals();
      case 'returned':
        return rentals.filter(r => r.status === 'returned');
      default:
        return rentals;
    }
  };
  
  const filteredRentals = getFilteredRentals();
  
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  const getDaysRemaining = (expectedReturnDate: string) => {
    const today = new Date();
    const returnDate = new Date(expectedReturnDate);
    const diffTime = returnDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'overdue':
        return theme.colors.danger;
      case 'returned':
        return theme.colors.textSecondary;
      default:
        return theme.colors.text;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'overdue':
        return 'Atrasado';
      case 'returned':
        return 'Devolvido';
      default:
        return status;
    }
  };
  
  const handleInitiateReturn = (material: { id: string; name: string; quantity: number }) => {
    setMaterialToReturn(material);
    setShowReturnModal(true);
  };
  
  const handleConfirmReturn = () => {
    if (!selectedRental || !materialToReturn) return;
    
    const obs = returnObservations.trim();
    
    try {
      // Processar devolução no material
      processReturn(materialToReturn.id, materialToReturn.quantity);
      
      // Atualizar status do material se necessário
      if (obs.toLowerCase().includes('danificado') || obs.toLowerCase().includes('avariado')) {
        updateMaterialStatus(materialToReturn.id, 'damaged', 'Sistema', obs);
      } else {
        updateMaterialStatus(materialToReturn.id, 'available', 'Sistema', 'Devolução realizada');
      }
      
      // Remover material da locação
      returnMaterialFromRental(selectedRental.id, materialToReturn.id, materialToReturn.quantity, obs);
      
      showAlert('Item Devolvido', `${materialToReturn.name} devolvido com sucesso`);
      
      // Verificar se todos os itens foram devolvidos
      const updatedRental = rentals.find(r => r.id === selectedRental.id);
      if (updatedRental && updatedRental.materials.length === 0) {
        showAlert('Devolução Completa', 'Todos os itens foram devolvidos. Gerando nota de devolução...');
        // Aqui você pode navegar para a nota de devolução
      }
      
      setShowReturnModal(false);
      setMaterialToReturn(null);
      setReturnObservations('');
      
      // Atualizar rental selecionado
      const refreshedRental = rentals.find(r => r.id === selectedRental.id);
      if (refreshedRental) {
        setSelectedRental(refreshedRental);
      }
    } catch (error: any) {
      showAlert('Erro', error.message);
    }
  };
  
  const renderRentalCard = ({ item }: { item: RentalNote }) => {
    const daysRemaining = getDaysRemaining(item.expectedReturnDate);
    const totalItems = item.materials.reduce((sum, m) => sum + m.quantity, 0);
    
    return (
      <TouchableOpacity
        style={styles.rentalCard}
        onPress={() => setSelectedRental(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.noteNumberBadge}>
            <Ionicons name="document-text" size={14} color={theme.colors.primary} />
            <Text style={styles.noteNumberText}>{item.noteNumber}</Text>
          </View>
          
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.customerDocument}>{item.customerDocument}</Text>
        
        <View style={styles.cardDivider} />
        
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="cube" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{totalItems} item(ns)</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>Saída: {formatDate(item.rentalDate)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>
              Retorno: {formatDate(item.expectedReturnDate)}
            </Text>
          </View>
          
          {item.status !== 'returned' && (
            <View style={styles.detailRow}>
              <Ionicons 
                name={daysRemaining >= 0 ? 'checkmark-circle' : 'alert-circle'} 
                size={16} 
                color={daysRemaining >= 0 ? theme.colors.success : theme.colors.danger} 
              />
              <Text style={[
                styles.detailText,
                { color: daysRemaining >= 0 ? theme.colors.success : theme.colors.danger }
              ]}>
                {daysRemaining >= 0 
                  ? `Faltam ${daysRemaining} dia(s)` 
                  : `Atrasado ${Math.abs(daysRemaining)} dia(s)`
                }
              </Text>
            </View>
          )}
          
          {item.returnDate && (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-done" size={16} color={theme.colors.success} />
              <Text style={[styles.detailText, { color: theme.colors.success }]}>
                Devolvido em: {formatDate(item.returnDate)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Materiais Locados</Text>
          <Text style={styles.subtitle}>{filteredRentals.length} locações</Text>
        </View>
      </View>
      
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Ativos ({getActiveRentals().length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'overdue' && styles.filterButtonActive]}
          onPress={() => setFilter('overdue')}
        >
          <Text style={[styles.filterText, filter === 'overdue' && styles.filterTextActive]}>
            Atrasados ({getOverdueRentals().length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'returned' && styles.filterButtonActive]}
          onPress={() => setFilter('returned')}
        >
          <Text style={[styles.filterText, filter === 'returned' && styles.filterTextActive]}>
            Devolvidos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todos ({rentals.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      {filteredRentals.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-outline" size={64} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>
            {filter === 'active' && 'Nenhuma locação ativa'}
            {filter === 'overdue' && 'Nenhuma locação atrasada'}
            {filter === 'returned' && 'Nenhuma devolução registrada'}
            {filter === 'all' && 'Nenhuma locação registrada'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRentals}
          keyExtractor={item => item.id}
          renderItem={renderRentalCard}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Modal de Detalhes */}
      <Modal
        visible={selectedRental !== null && !showReturnModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRental(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Detalhes da Locação
              </Text>
              <TouchableOpacity onPress={() => setSelectedRental(null)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedRental && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Nota</Text>
                  <Text style={styles.modalNoteNumber}>{selectedRental.noteNumber}</Text>
                  
                  <View style={[
                    styles.modalStatusBadge,
                    { backgroundColor: `${getStatusColor(selectedRental.status)}20` }
                  ]}>
                    <Text style={[
                      styles.modalStatusText,
                      { color: getStatusColor(selectedRental.status) }
                    ]}>
                      {getStatusLabel(selectedRental.status)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Cliente</Text>
                  <Text style={styles.modalInfoText}>{selectedRental.customerName}</Text>
                  <Text style={styles.modalInfoSubtext}>{selectedRental.customerDocument}</Text>
                  <Text style={styles.modalInfoSubtext}>{selectedRental.customerPhone}</Text>
                  <Text style={styles.modalInfoSubtext}>{selectedRental.customerEmail}</Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Materiais</Text>
                  {selectedRental.materials.map((material, index) => (
                    <View key={index} style={styles.materialRow}>
                      <View style={styles.materialIcon}>
                        <Ionicons name="cube" size={20} color={theme.colors.primary} />
                      </View>
                      <View style={styles.materialInfo}>
                        <Text style={styles.materialName}>{material.name}</Text>
                        <Text style={styles.materialSku}>SKU: {material.sku} • Qtd: {material.quantity}</Text>
                      </View>
                      {selectedRental.status !== 'returned' && (
                        <TouchableOpacity
                          style={styles.returnItemButton}
                          onPress={() => handleInitiateReturn({
                            id: material.id,
                            name: material.name,
                            quantity: material.quantity
                          })}
                        >
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Datas</Text>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.dateLabel}>Saída:</Text>
                    <Text style={styles.dateValue}>{formatDate(selectedRental.rentalDate)}</Text>
                  </View>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
                    <Text style={styles.dateLabel}>Retorno previsto:</Text>
                    <Text style={styles.dateValue}>{formatDate(selectedRental.expectedReturnDate)}</Text>
                  </View>
                  {selectedRental.returnDate && (
                    <View style={styles.dateRow}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                      <Text style={styles.dateLabel}>Devolvido:</Text>
                      <Text style={[styles.dateValue, { color: theme.colors.success }]}>
                        {formatDate(selectedRental.returnDate)}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Entrega</Text>
                  <View style={styles.addressBox}>
                    <Ionicons name="location" size={16} color={theme.colors.primary} />
                    <Text style={styles.addressText}>{selectedRental.deliveryAddress}</Text>
                  </View>
                </View>
                
                {selectedRental.notes && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Observações</Text>
                    <Text style={styles.notesText}>{selectedRental.notes}</Text>
                  </View>
                )}
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.viewNoteButton}
                    onPress={() => {
                      setSelectedRental(null);
                      router.push(`/rental-note?id=${selectedRental.id}`);
                    }}
                  >
                    <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                    <Text style={styles.viewNoteButtonText}>Ver Nota Completa</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Modal de Devolução de Item */}
      <Modal
        visible={showReturnModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReturnModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Devolver Item</Text>
              <TouchableOpacity onPress={() => setShowReturnModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {materialToReturn && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.returnInfoBox}>
                  <Ionicons name="cube" size={32} color={theme.colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.returnInfoTitle}>{materialToReturn.name}</Text>
                    <Text style={styles.returnInfoSubtitle}>
                      Quantidade: {materialToReturn.quantity} unidade(s)
                    </Text>
                  </View>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Estado do Material</Text>
                  <TouchableOpacity
                    style={styles.quickObsButton}
                    onPress={() => setReturnObservations('Item retornou em perfeito estado')}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                    <Text style={styles.quickObsText}>Item retornou normal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickObsButton}
                    onPress={() => setReturnObservations('Item veio danificado')}
                  >
                    <Ionicons name="warning" size={16} color={theme.colors.warning} />
                    <Text style={styles.quickObsText}>Item danificado</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickObsButton}
                    onPress={() => setReturnObservations('Item veio avariado')}
                  >
                    <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
                    <Text style={styles.quickObsText}>Item avariado</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Observações da Devolução</Text>
                  <TextInput
                    style={styles.textArea}
                    value={returnObservations}
                    onChangeText={setReturnObservations}
                    placeholder="Descreva o estado do material..."
                    multiline
                    numberOfLines={4}
                  />
                </View>
                
                <View style={styles.modalActions}>
                  <Button
                    title="Cancelar"
                    variant="outline"
                    onPress={() => {
                      setShowReturnModal(false);
                      setMaterialToReturn(null);
                      setReturnObservations('');
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Confirmar Devolução"
                    variant="success"
                    onPress={handleConfirmReturn}
                    style={{ flex: 1 }}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
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
  
  filters: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  
  filterText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  
  filterTextActive: {
    color: '#FFFFFF',
  },
  
  rentalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  noteNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  
  noteNumberText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.xs,
  },
  
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  
  customerName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  customerDocument: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  cardDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  
  cardDetails: {
    gap: theme.spacing.sm,
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
    textAlign: 'center',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxHeight: '90%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  modalSection: {
    marginBottom: theme.spacing.lg,
  },
  
  modalSectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  
  modalNoteNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  
  modalStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  
  modalStatusText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  
  modalInfoText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  modalInfoSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  
  materialIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  
  materialInfo: {
    flex: 1,
  },
  
  materialName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  materialSku: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  
  returnItemButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  
  dateLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  
  dateValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  
  addressText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  
  notesText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    lineHeight: 20,
  },
  
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  
  viewNoteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: `${theme.colors.primary}10`,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  
  viewNoteButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  
  returnInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  
  returnInfoTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  returnInfoSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  
  textArea: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  quickObsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  
  quickObsText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
  },
});
