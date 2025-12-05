import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, QRScanner } from '../../components';
import { useMaterials } from '../../hooks/useMaterials';
import { useCustomers } from '../../hooks/useCustomers';
import { useRentals } from '../../hooks/useRentals';
import { useLogistics } from '../../hooks/useLogistics';
import { useAlert } from '@/template';
import { theme } from '../../constants/theme';
import { Material, materialService } from '../../services/materialService';

type ScanMode = 'camera' | 'manual' | null;

interface CartItem {
  material: Material;
  quantity: number;
  unitPrice: number;
  days: number;
}

export default function ScanScreen() {
  const router = useRouter();
  const { materials, processExit, registerInfo } = useMaterials();
  const { customers } = useCustomers();
  const { addRental } = useRentals();
  const { addDelivery } = useLogistics();
  const { showAlert } = useAlert();
  
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [scanMode, setScanMode] = useState<ScanMode>(null);
  
  // Carrinho de itens para saída
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Estados para nota de locação
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [expectedReturnDays, setExpectedReturnDays] = useState('3');
  const [rentalNotes, setRentalNotes] = useState('');
  
  // Estados para logística
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [scheduledDeliveryDays, setScheduledDeliveryDays] = useState('1');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const handleSelectMaterial = (material: Material) => {
    // Verificar se o material pode ser locado
    const available = materialService.calculateAvailable(material);
    
    if (material.status === 'maintenance') {
      showAlert('Material em Manutenção', 'Este material está em manutenção e não pode ser locado');
      return;
    }
    
    if (material.status === 'damaged') {
      showAlert('Material Danificado', 'Este material está danificado e não pode ser locado');
      return;
    }
    
    if (material.status === 'retired') {
      showAlert('Material em Baixa', 'Este material foi dado como baixa e não pode ser locado');
      return;
    }
    
    if (available <= 0) {
      showAlert('Quantidade Insuficiente', 'Não há unidades disponíveis para locação');
      return;
    }
    
    setSelectedMaterial(material);
    setScanMode(null);
  };
  
  const handleQRScanned = (data: string) => {
    const material = materials.find(m => m.sku === data);
    
    if (!material) {
      showAlert('Material não encontrado', `SKU "${data}" não existe no sistema`);
      setScanMode(null);
      return;
    }
    
    // Se houver cliente selecionado, adicionar direto ao carrinho
    if (selectedCustomerId) {
      handleSelectMaterial(material);
      if (selectedMaterial) {
        handleAddToCart(material);
      }
    } else {
      handleSelectMaterial(material);
    }
  };
  
  const handleAddToCart = (material: Material) => {
    if (!selectedCustomerId) {
      showAlert('Erro', 'Por favor, selecione um cliente primeiro');
      return;
    }
    
    const available = materialService.calculateAvailable(material);
    
    if (available <= 0) {
      showAlert('Quantidade Insuficiente', 'Não há unidades disponíveis para locação');
      return;
    }
    
    const existingItem = cart.find(item => item.material.id === material.id);
    
    if (existingItem) {
      // Se já existe, incrementa a quantidade se houver disponível
      const newQuantity = existingItem.quantity + 1;
      
      if (newQuantity > available) {
        showAlert('Quantidade Insuficiente', `Apenas ${available} unidade(s) disponível(is)`);
        return;
      }
      
      setCart(prev => prev.map(item => 
        item.material.id === material.id 
          ? { ...item, quantity: newQuantity }
          : item
      ));
      setSelectedMaterial(null);
      showAlert('Quantidade atualizada', `${material.name}: ${newQuantity} unidade(s)`);
      return;
    }
    
    const newItem: CartItem = {
      material,
      quantity: 1,
      unitPrice: material.rentalPrice || 150.00,
      days: 3,
    };
    
    setCart(prev => [...prev, newItem]);
    setSelectedMaterial(null);
    showAlert('Item adicionado', `${material.name} adicionado ao carrinho`);
  };
  
  const handleUpdateCartItem = (materialId: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(item => {
      if (item.material.id !== materialId) return item;
      
      const updatedItem = { ...item, ...updates };
      
      // Validar quantidade disponível
      const available = materialService.calculateAvailable(item.material);
      
      // Se está tentando atualizar quantidade, validar
      if (updates.quantity !== undefined) {
        if (updatedItem.quantity > available) {
          showAlert('Quantidade insuficiente', `Apenas ${available} unidade(s) disponível(is) para ${item.material.name}`);
          return item;
        }
        
        if (updatedItem.quantity <= 0) {
          showAlert('Quantidade inválida', 'A quantidade deve ser maior que zero');
          return item;
        }
      }
      
      return updatedItem;
    }));
  };
  
  const handleRemoveFromCart = (materialId: string) => {
    setCart(prev => prev.filter(item => item.material.id !== materialId));
  };
  
  const handleConfirmRental = () => {
    if (cart.length === 0) {
      showAlert('Erro', 'Adicione pelo menos um item ao carrinho');
      return;
    }
    
    if (!selectedCustomerId) {
      showAlert('Erro', 'Selecione um cliente');
      return;
    }
    
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      showAlert('Erro', 'Cliente não encontrado');
      return;
    }
    
    // Validar endereço se for entrega
    if (deliveryType === 'delivery') {
      if (!street || !number || !neighborhood || !city || !state || !zipCode) {
        showAlert('Erro', 'Preencha todos os campos do endereço de entrega');
        return;
      }
    }
    
    // Validar quantidade disponível de todos os itens
    const errors: string[] = [];
    for (const item of cart) {
      const available = materialService.calculateAvailable(item.material);
      if (item.quantity > available) {
        errors.push(`${item.material.name}: apenas ${available} disponível(is), mas você está tentando alugar ${item.quantity}`);
      }
    }
    
    if (errors.length > 0) {
      showAlert('Quantidade insuficiente', errors.join('\n'));
      return;
    }
    
    const days = parseInt(expectedReturnDays) || 3;
    const deliveryDays = parseInt(scheduledDeliveryDays) || 1;
    
    // Calcular data de devolução
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + days);
    
    // Calcular data de entrega agendada
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + deliveryDays);
    
    try {
      // Processar saída de todos os itens do carrinho
      const materialIds: string[] = [];
      cart.forEach(item => {
        processExit(item.material.id, item.quantity, customer.name);
        materialIds.push(item.material.id);
      });
      
      // Criar entrega na logística
      const delivery = addDelivery({
        customerId: customer.id,
        customerName: customer.name,
        materialIds,
        type: deliveryType,
        scheduledDate: scheduledDate.toISOString(),
        address: {
          street: deliveryType === 'delivery' ? street : 'Retirada no local',
          number: deliveryType === 'delivery' ? number : '-',
          complement: complement || undefined,
          neighborhood: deliveryType === 'delivery' ? neighborhood : '-',
          city: deliveryType === 'delivery' ? city : '-',
          state: deliveryType === 'delivery' ? state : '-',
          zipCode: deliveryType === 'delivery' ? zipCode : '-',
        },
        notes: rentalNotes.trim() || undefined,
        rentalNoteNumber: '',
      });
      
      // Criar nota de locação com todos os materiais do carrinho
      const rentalMaterials = cart.map(item => ({
        id: item.material.id,
        name: item.material.name,
        sku: item.material.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
      
      const rental = addRental({
        customerId: customer.id,
        customerName: customer.name,
        customerDocument: customer.document,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        materials: rentalMaterials,
        rentalDate: new Date().toISOString(),
        expectedReturnDate: returnDate.toISOString(),
        deliveryAddress: deliveryType === 'delivery' 
          ? `${street}, ${number}${complement ? ` - ${complement}` : ''} - ${neighborhood}, ${city}/${state} - ${zipCode}`
          : 'Retirada no local',
        notes: rentalNotes.trim() || undefined,
        deliveryId: delivery.id,
        deliveryType,
      });
      
      showAlert('Locação registrada', `Nota ${rental.noteNumber} criada com ${cart.length} item(ns)`);
      
      // Navegar para a nota
      setTimeout(() => {
        router.push(`/rental-note?id=${rental.id}`);
      }, 500);
      
      resetForm();
      setShowRentalForm(false);
      setCart([]);
    } catch (error: any) {
      showAlert('Erro', error.message);
    }
  };
  
  const resetForm = () => {
    setSelectedMaterial(null);
    setSelectedCustomerId('');
    setExpectedReturnDays('3');
    setRentalNotes('');
    setDeliveryType('delivery');
    setScheduledDeliveryDays('1');
    setStreet('');
    setNumber('');
    setComplement('');
    setNeighborhood('');
    setCity('');
    setState('');
    setZipCode('');
  };
  
  if (scanMode === 'camera') {
    return (
      <QRScanner
        title="Escanear para Saída"
        onScan={handleQRScanned}
        onClose={() => setScanMode(null)}
      />
    );
  }
  
  return (
    <Screen>
      <View style={styles.header}>
        <Ionicons name="scan" size={64} color={theme.colors.primary} />
        <Text style={styles.title}>Saída de Materiais</Text>
        <Text style={styles.subtitle}>Registre a saída de equipamentos para locação</Text>
      </View>
      
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => setScanMode('camera')}
      >
        <Ionicons name="camera" size={32} color="#FFFFFF" />
        <Text style={styles.scanButtonText}>Abrir Câmera</Text>
      </TouchableOpacity>
      
      <Text style={styles.orText}>ou selecione manualmente</Text>
      
      {/* Carrinho de Saída */}
      {selectedCustomerId && (
        <View style={styles.cartSection}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Carrinho ({cart.length})</Text>
            {cart.length > 0 && (
              <TouchableOpacity onPress={() => setShowRentalForm(true)}>
                <Ionicons name="checkmark-circle" size={28} color={theme.colors.success} />
              </TouchableOpacity>
            )}
          </View>
          
          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={48} color={theme.colors.textLight} />
              <Text style={styles.emptyCartText}>Adicione itens para criar a locação</Text>
            </View>
          ) : (
            <FlatList
              data={cart}
              keyExtractor={(item) => item.material.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cartList}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                  {item.material.imageUri ? (
                    <Image
                      source={{ uri: item.material.imageUri }}
                      style={styles.cartItemImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.cartItemImage, { backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="image-outline" size={32} color={theme.colors.textLight} />
                    </View>
                  )}
                  <Text style={styles.cartItemName} numberOfLines={1}>
                    {item.material.name}
                  </Text>
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemDetail}>{item.quantity}x</Text>
                    <Text style={styles.cartItemDetail}>R$ {item.unitPrice.toFixed(2)}</Text>
                    <Text style={styles.cartItemDetail}>{item.days}d</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeCartButton}
                    onPress={() => handleRemoveFromCart(item.material.id)}
                  >
                    <Ionicons name="close-circle" size={20} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      )}
      
      <Text style={styles.sectionTitle}>Selecione um Material</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {materials
          .filter(m => m.status !== 'retired') // Ocultar itens em baixa
          .map(material => {
            const available = materialService.calculateAvailable(material);
            const canRent = material.status === 'available' && available > 0;
            
            return (
              <TouchableOpacity
                key={material.id}
                style={[styles.materialItem, !canRent && styles.materialItemDisabled]}
                onPress={() => canRent && handleSelectMaterial(material)}
                disabled={!canRent}
              >
                {material.imageUri ? (
                  <Image
                    source={{ uri: material.imageUri }}
                    style={styles.materialThumbnail}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.materialThumbnail, { backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="image-outline" size={24} color={theme.colors.textLight} />
                  </View>
                )}
                <View style={styles.materialInfo}>
                  <Text style={styles.materialName}>{material.name}</Text>
                  <Text style={styles.materialSku}>{material.sku}</Text>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${materialService.getStatusColor(material.status)}20` }
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: materialService.getStatusColor(material.status) }
                        ]}
                      >
                        {materialService.getStatusLabel(material.status)}
                      </Text>
                    </View>
                    <Text style={[
                      styles.availableText,
                      { color: available > 0 ? theme.colors.success : theme.colors.danger }
                    ]}>
                      {available} disponível(is)
                    </Text>
                  </View>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={canRent ? theme.colors.textLight : theme.colors.border} 
                />
              </TouchableOpacity>
            );
          })}
      </ScrollView>
      
      {/* Modal de Adicionar ao Carrinho */}
      <Modal
        visible={selectedMaterial !== null && !showRentalForm}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMaterial(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar ao Carrinho</Text>
              <TouchableOpacity onPress={() => setSelectedMaterial(null)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedMaterial && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalMaterial}>{selectedMaterial.name}</Text>
                <Text style={styles.modalSku}>SKU: {selectedMaterial.sku}</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Cliente *</Text>
                  <View style={styles.customerPicker}>
                    {customers.length === 0 ? (
                      <Text style={styles.noCustomersText}>
                        Nenhum cliente cadastrado
                      </Text>
                    ) : (
                      customers.map(customer => (
                        <TouchableOpacity
                          key={customer.id}
                          style={[
                            styles.customerOption,
                            selectedCustomerId === customer.id && styles.customerOptionSelected
                          ]}
                          onPress={() => setSelectedCustomerId(customer.id)}
                        >
                          <View style={styles.customerOptionInfo}>
                            <Text style={styles.customerOptionName}>{customer.name}</Text>
                            <Text style={styles.customerOptionDoc}>{customer.document}</Text>
                          </View>
                          {selectedCustomerId === customer.id && (
                            <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                </View>
                
                <View style={styles.modalActions}>
                  <Button
                    title="Cancelar"
                    variant="outline"
                    onPress={() => setSelectedMaterial(null)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Adicionar"
                    variant="primary"
                    onPress={() => handleAddToCart(selectedMaterial)}
                    style={{ flex: 1 }}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Modal de Nota de Locação */}
      <Modal
        visible={showRentalForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRentalForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nota de Locação</Text>
              <TouchableOpacity onPress={() => setShowRentalForm(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.rentalInfoCard}>
                <Ionicons name="document-text" size={32} color={theme.colors.primary} />
                <Text style={styles.rentalInfoText}>
                  {cart.length} item(ns) no carrinho
                </Text>
              </View>
              
              {/* Lista de itens do carrinho */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Itens da Locação</Text>
                {cart.map((item, index) => (
                  <View key={item.material.id} style={styles.rentalItem}>
                    <View style={styles.rentalItemHeader}>
                      <Text style={styles.rentalItemName}>{item.material.name}</Text>
                      <TouchableOpacity onPress={() => handleRemoveFromCart(item.material.id)}>
                        <Ionicons name="trash" size={20} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.rentalItemInputs}>
                      <View style={styles.rentalItemInput}>
                        <Text style={styles.rentalItemInputLabel}>Qtd</Text>
                        <TextInput
                          style={styles.rentalItemInputField}
                          value={String(item.quantity)}
                          onChangeText={(v) => handleUpdateCartItem(item.material.id, { quantity: parseInt(v) || 1 })}
                          keyboardType="numeric"
                        />
                      </View>
                      
                      <View style={styles.rentalItemInput}>
                        <Text style={styles.rentalItemInputLabel}>R$ Unit</Text>
                        <TextInput
                          style={styles.rentalItemInputField}
                          value={String(item.unitPrice)}
                          onChangeText={(v) => handleUpdateCartItem(item.material.id, { unitPrice: parseFloat(v) || 0 })}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      
                      <View style={styles.rentalItemInput}>
                        <Text style={styles.rentalItemInputLabel}>Dias</Text>
                        <TextInput
                          style={styles.rentalItemInputField}
                          value={String(item.days)}
                          onChangeText={(v) => handleUpdateCartItem(item.material.id, { days: parseInt(v) || 1 })}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                    
                    <Text style={styles.rentalItemTotal}>
                      Total: R$ {(item.quantity * item.unitPrice * item.days).toFixed(2)}
                    </Text>
                  </View>
                ))}
                
                <View style={styles.totalBox}>
                  <Text style={styles.totalLabel}>TOTAL GERAL</Text>
                  <Text style={styles.totalValue}>
                    R$ {cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.days), 0).toFixed(2)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Prazo de Devolução (dias)</Text>
                <TextInput
                  style={styles.input}
                  value={expectedReturnDays}
                  onChangeText={setExpectedReturnDays}
                  keyboardType="numeric"
                  placeholder="3"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Tipo de Entrega *</Text>
                <View style={styles.deliveryTypeRow}>
                  <TouchableOpacity
                    style={[
                      styles.deliveryTypeOption,
                      deliveryType === 'delivery' && styles.deliveryTypeOptionActive
                    ]}
                    onPress={() => setDeliveryType('delivery')}
                  >
                    <Ionicons 
                      name="car" 
                      size={24} 
                      color={deliveryType === 'delivery' ? '#FFFFFF' : theme.colors.primary} 
                    />
                    <Text style={[
                      styles.deliveryTypeText,
                      deliveryType === 'delivery' && styles.deliveryTypeTextActive
                    ]}>
                      Entrega
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.deliveryTypeOption,
                      deliveryType === 'pickup' && styles.deliveryTypeOptionActive
                    ]}
                    onPress={() => setDeliveryType('pickup')}
                  >
                    <Ionicons 
                      name="business" 
                      size={24} 
                      color={deliveryType === 'pickup' ? '#FFFFFF' : theme.colors.primary} 
                    />
                    <Text style={[
                      styles.deliveryTypeText,
                      deliveryType === 'pickup' && styles.deliveryTypeTextActive
                    ]}>
                      Retirada
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {deliveryType === 'delivery' ? 'Entrega em (dias)' : 'Disponível para retirada em (dias)'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={scheduledDeliveryDays}
                  onChangeText={setScheduledDeliveryDays}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>
              
              {deliveryType === 'delivery' && (
                <>
                  <View style={styles.addressHeader}>
                    <Ionicons name="location" size={20} color={theme.colors.primary} />
                    <Text style={styles.addressHeaderText}>Endereço de Entrega</Text>
                  </View>
                  
                  <View style={styles.inputRow}>
                    <View style={[styles.inputContainer, { flex: 3 }]}>
                      <Text style={styles.inputLabel}>Rua *</Text>
                      <TextInput
                        style={styles.input}
                        value={street}
                        onChangeText={setStreet}
                        placeholder="Nome da rua"
                      />
                    </View>
                    
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Número *</Text>
                      <TextInput
                        style={styles.input}
                        value={number}
                        onChangeText={setNumber}
                        placeholder="123"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Complemento</Text>
                    <TextInput
                      style={styles.input}
                      value={complement}
                      onChangeText={setComplement}
                      placeholder="Apto, bloco, etc."
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Bairro *</Text>
                    <TextInput
                      style={styles.input}
                      value={neighborhood}
                      onChangeText={setNeighborhood}
                      placeholder="Nome do bairro"
                    />
                  </View>
                  
                  <View style={styles.inputRow}>
                    <View style={[styles.inputContainer, { flex: 2 }]}>
                      <Text style={styles.inputLabel}>Cidade *</Text>
                      <TextInput
                        style={styles.input}
                        value={city}
                        onChangeText={setCity}
                        placeholder="Cidade"
                      />
                    </View>
                    
                    <View style={[styles.inputContainer, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>UF *</Text>
                      <TextInput
                        style={styles.input}
                        value={state}
                        onChangeText={setState}
                        placeholder="SP"
                        maxLength={2}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>CEP *</Text>
                    <TextInput
                      style={styles.input}
                      value={zipCode}
                      onChangeText={setZipCode}
                      placeholder="00000-000"
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Observações (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={rentalNotes}
                  onChangeText={setRentalNotes}
                  placeholder="Informações adicionais..."
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  title="Voltar"
                  variant="outline"
                  onPress={() => setShowRentalForm(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Gerar Nota"
                  variant="primary"
                  onPress={handleConfirmRental}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  
  scanButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  orText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  
  section: {
    marginBottom: theme.spacing.lg,
  },
  
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  
  materialItemDisabled: {
    opacity: 0.5,
  },
  
  materialThumbnail: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
  },
  
  materialInfo: {
    flex: 1,
  },
  
  materialName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  materialSku: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  
  availableText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
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
    maxHeight: '80%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  modalMaterial: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  modalSku: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  
  customerPicker: {
    maxHeight: 200,
  },
  
  customerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  customerOptionSelected: {
    borderColor: theme.colors.success,
    backgroundColor: `${theme.colors.success}10`,
  },
  
  customerOptionInfo: {
    flex: 1,
  },
  
  customerOptionName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  customerOptionDoc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  noCustomersText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  
  rentalInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  
  rentalInfoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    lineHeight: 20,
  },
  
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  
  deliveryTypeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  
  deliveryTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  
  deliveryTypeOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  
  deliveryTypeText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  deliveryTypeTextActive: {
    color: '#FFFFFF',
  },
  
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  
  addressHeaderText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  inputRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  
  cartSection: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  
  cartTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  emptyCart: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  
  emptyCartText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  
  cartList: {
    gap: theme.spacing.sm,
  },
  
  cartItem: {
    width: 140,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    position: 'relative',
  },
  
  cartItemImage: {
    width: '100%',
    height: 80,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.xs,
  },
  
  cartItemName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  cartItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  cartItemDetail: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  
  removeCartButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.full,
  },
  
  rentalItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  
  rentalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  rentalItemName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  
  rentalItemInputs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  
  rentalItemInput: {
    flex: 1,
  },
  
  rentalItemInputLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  rentalItemInputField: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    textAlign: 'center',
  },
  
  rentalItemTotal: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    textAlign: 'right',
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
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  totalValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
});
