import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Input, Button } from '../components';
import { useContracts } from '../hooks/useContracts';
import { useCustomers } from '../hooks/useCustomers';
import { useMaterials } from '../hooks/useMaterials';
import { useAlert } from '@/template';
import { theme } from '../constants/theme';
import { contractService, ContractItem } from '../services/contractService';

export default function CreateContractScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addContract } = useContracts();
  const { customers } = useCustomers();
  const { materials } = useMaterials();
  const { showAlert } = useAlert();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [eventPurpose, setEventPurpose] = useState('');
  
  const [rentalStartDate, setRentalStartDate] = useState(new Date());
  const [rentalEndDate, setRentalEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [deliveryTime, setDeliveryTime] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [returnTime, setReturnTime] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  const [selectedItems, setSelectedItems] = useState<ContractItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  const handleDateChange = (event: any, selectedDate?: Date, field?: string) => {
    setShowDatePicker(null);
    if (selectedDate && field) {
      switch (field) {
        case 'rentalStart':
          setRentalStartDate(selectedDate);
          break;
        case 'rentalEnd':
          setRentalEndDate(selectedDate);
          break;
        case 'delivery':
          setDeliveryDate(selectedDate);
          break;
        case 'return':
          setReturnDate(selectedDate);
          break;
      }
    }
  };
  
  const handleAddMaterial = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;
    
    const days = contractService.calculateDays(
      rentalStartDate.toISOString(),
      rentalEndDate.toISOString()
    );
    
    const newItem: ContractItem = {
      id: material.id,
      sku: material.sku,
      name: material.name,
      imageUri: material.imageUri,
      quantity: 1,
      days,
      unitPrice: 50, // Preço padrão, pode ser editado
      total: 0,
      replacementPrice: 500, // Preço padrão, pode ser editado
    };
    
    newItem.total = contractService.calculateItemTotal(
      newItem.quantity,
      newItem.days,
      newItem.unitPrice
    );
    
    setSelectedItems(prev => [...prev, newItem]);
    setShowMaterialPicker(false);
  };
  
  const handleUpdateItem = (index: number, updates: Partial<ContractItem>) => {
    setSelectedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      
      updated[index].total = contractService.calculateItemTotal(
        updated[index].quantity,
        updated[index].days,
        updated[index].unitPrice
      );
      
      return updated;
    });
  };
  
  const handleRemoveItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = () => {
    if (!selectedCustomerId) {
      showAlert('Erro', 'Selecione um cliente');
      return;
    }
    
    if (selectedItems.length === 0) {
      showAlert('Erro', 'Adicione pelo menos um item');
      return;
    }
    
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      showAlert('Erro', 'Informe o endereço de entrega');
      return;
    }
    
    if (!selectedCustomer) return;
    
    const contract = addContract({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerDocument: selectedCustomer.document,
      customerDocumentType: selectedCustomer.documentType,
      customerPhone: selectedCustomer.phone,
      customerEmail: selectedCustomer.email,
      customerAddress: selectedCustomer.address,
      orderDate: new Date().toISOString(),
      rentalStartDate: rentalStartDate.toISOString(),
      rentalEndDate: rentalEndDate.toISOString(),
      deliveryDate: deliveryDate.toISOString(),
      deliveryTime,
      returnDate: returnDate.toISOString(),
      returnTime,
      eventPurpose,
      deliveryType,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
      items: selectedItems,
      status: 'pending',
      paymentStatus: 'pending',
      paidAmount: 0,
      notes,
    });
    
    showAlert('Sucesso', 'Contrato criado com sucesso!');
    router.push(`/view-contract?id=${contract.id}`);
  };
  
  const subtotal = contractService.calculateSubtotal(selectedItems);
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Criar Contrato de Locação</Text>
        
        {/* Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          
          {selectedCustomer ? (
            <View style={styles.selectedCustomer}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{selectedCustomer.name}</Text>
                <Text style={styles.customerDetail}>{selectedCustomer.email}</Text>
                <Text style={styles.customerDetail}>{selectedCustomer.phone}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCustomerId('')}>
                <Ionicons name="close-circle" size={24} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowCustomerPicker(true)}
            >
              <Ionicons name="person-add" size={20} color={theme.colors.primary} />
              <Text style={styles.selectButtonText}>Selecionar Cliente</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Datas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datas da Locação</Text>
          
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Início</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker('rentalStart')}
              >
                <Text>{contractService.formatDate(rentalStartDate.toISOString())}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Término</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker('rentalEnd')}
              >
                <Text>{contractService.formatDate(rentalEndDate.toISOString())}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Objetivo */}
        <Input
          label="Objetivo da Locação"
          value={eventPurpose}
          onChangeText={setEventPurpose}
          placeholder="Ex: Casamento, Aniversário, etc."
        />
        
        {/* Logística */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logística</Text>
          
          <View style={styles.deliveryTypeButtons}>
            <TouchableOpacity
              style={[
                styles.deliveryTypeButton,
                deliveryType === 'pickup' && styles.deliveryTypeButtonActive,
              ]}
              onPress={() => setDeliveryType('pickup')}
            >
              <Text
                style={[
                  styles.deliveryTypeButtonText,
                  deliveryType === 'pickup' && styles.deliveryTypeButtonTextActive,
                ]}
              >
                Retirar na Loja
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.deliveryTypeButton,
                deliveryType === 'delivery' && styles.deliveryTypeButtonActive,
              ]}
              onPress={() => setDeliveryType('delivery')}
            >
              <Text
                style={[
                  styles.deliveryTypeButtonText,
                  deliveryType === 'delivery' && styles.deliveryTypeButtonTextActive,
                ]}
              >
                Entrega
              </Text>
            </TouchableOpacity>
          </View>
          
          {deliveryType === 'delivery' && (
            <Input
              label="Endereço de Entrega"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Endereço completo"
              multiline
            />
          )}
        </View>
        
        {/* Itens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens ({selectedItems.length})</Text>
          
          <TouchableOpacity
            style={styles.addItemButton}
            onPress={() => setShowMaterialPicker(true)}
          >
            <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.addItemButtonText}>Adicionar Item</Text>
          </TouchableOpacity>
          
          {selectedItems.map((item, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                  <Ionicons name="trash" size={20} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.itemInputs}>
                <Input
                  label="Qtd"
                  value={String(item.quantity)}
                  onChangeText={(v) =>
                    handleUpdateItem(index, { quantity: parseInt(v) || 1 })
                  }
                  keyboardType="numeric"
                  style={{ flex: 1 }}
                />
                
                <Input
                  label="Dias"
                  value={String(item.days)}
                  onChangeText={(v) =>
                    handleUpdateItem(index, { days: parseInt(v) || 1 })
                  }
                  keyboardType="numeric"
                  style={{ flex: 1 }}
                />
                
                <Input
                  label="R$ Unit"
                  value={String(item.unitPrice)}
                  onChangeText={(v) =>
                    handleUpdateItem(index, { unitPrice: parseFloat(v) || 0 })
                  }
                  keyboardType="numeric"
                  style={{ flex: 1 }}
                />
              </View>
              
              <Text style={styles.itemTotal}>
                Total: {contractService.formatCurrency(item.total)}
              </Text>
            </View>
          ))}
          
          {selectedItems.length > 0 && (
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>SUBTOTAL</Text>
              <Text style={styles.totalValue}>
                {contractService.formatCurrency(subtotal)}
              </Text>
            </View>
          )}
        </View>
        
        {/* Observações */}
        <Input
          label="Observações"
          value={notes}
          onChangeText={setNotes}
          placeholder="Observações adicionais"
          multiline
          numberOfLines={3}
        />
        
        <View style={styles.actions}>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
          />
          <Button
            title="Criar Contrato"
            variant="primary"
            onPress={handleSubmit}
            style={styles.button}
          />
        </View>
      </ScrollView>
      
      {/* Date Picker */}
      {showDatePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={
            showDatePicker === 'rentalStart'
              ? rentalStartDate
              : showDatePicker === 'rentalEnd'
              ? rentalEndDate
              : showDatePicker === 'delivery'
              ? deliveryDate
              : returnDate
          }
          mode="date"
          display="default"
          onChange={(e, d) => handleDateChange(e, d, showDatePicker)}
        />
      )}
      
      {/* Customer Picker Modal */}
      {showCustomerPicker && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Cliente</Text>
              <TouchableOpacity onPress={() => setShowCustomerPicker(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {customers.map(customer => (
                <TouchableOpacity
                  key={customer.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCustomerId(customer.id);
                    setShowCustomerPicker(false);
                  }}
                >
                  <Text style={styles.modalItemTitle}>{customer.name}</Text>
                  <Text style={styles.modalItemSubtitle}>{customer.email}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      
      {/* Material Picker Modal */}
      {showMaterialPicker && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Material</Text>
              <TouchableOpacity onPress={() => setShowMaterialPicker(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {materials.map(material => (
                <TouchableOpacity
                  key={material.id}
                  style={styles.modalItem}
                  onPress={() => handleAddMaterial(material.id)}
                >
                  <Text style={styles.modalItemTitle}>{material.name}</Text>
                  <Text style={styles.modalItemSubtitle}>SKU: {material.sku}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  scroll: {
    flex: 1,
  },
  
  content: {
    padding: theme.spacing.lg,
  },
  
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  
  section: {
    marginBottom: theme.spacing.lg,
  },
  
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  selectedCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  
  customerInfo: {
    flex: 1,
  },
  
  customerName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  customerDetail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  
  selectButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  
  dateRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  
  dateButton: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  deliveryTypeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  
  deliveryTypeButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  
  deliveryTypeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  
  deliveryTypeButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  
  deliveryTypeButtonTextActive: {
    color: theme.colors.primary,
  },
  
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    marginBottom: theme.spacing.md,
  },
  
  addItemButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  
  item: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  itemName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  itemInputs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  
  itemTotal: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    textAlign: 'right',
    marginTop: theme.spacing.sm,
  },
  
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  
  totalLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  totalValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  
  button: {
    flex: 1,
  },
  
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxHeight: '80%',
    padding: theme.spacing.lg,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  modalList: {
    maxHeight: 400,
  },
  
  modalItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  modalItemTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  modalItemSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
