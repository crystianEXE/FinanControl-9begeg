import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Input, Button } from '../components';
import { useMaterials } from '../hooks/useMaterials';
import { useAlert } from '@/template';
import { theme } from '../constants/theme';

export default function EditMaterialScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { materials, updateMaterial } = useMaterials();
  const { showAlert } = useAlert();
  
  const material = materials.find(m => m.id === id);
  
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [status, setStatus] = useState<'available' | 'rented' | 'maintenance' | 'damaged' | 'retired'>('available');
  const [observations, setObservations] = useState('');
  const [rentalPrice, setRentalPrice] = useState('');
  const [replacementPrice, setReplacementPrice] = useState('');
  
  useEffect(() => {
    if (material) {
      setName(material.name);
      setSku(material.sku);
      setQuantity(material.totalQuantity.toString());
      setLocation(material.location);
      setImageUri(material.imageUri || null);
      setStatus(material.status);
      setObservations(material.observations || '');
      setRentalPrice((material.rentalPrice || 150).toString());
      setReplacementPrice((material.replacementPrice || 500).toString());
    }
  }, [material]);
  
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      showAlert('Permissão negada', 'Precisamos de acesso à galeria para adicionar fotos');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      showAlert('Permissão negada', 'Precisamos de acesso à câmera para tirar fotos');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  const handleRemoveImage = () => {
    setImageUri(null);
  };
  
  const handleSubmit = () => {
    if (!name.trim()) {
      showAlert('Erro', 'Por favor, informe o nome do material');
      return;
    }
    
    const qty = parseInt(quantity) || 0;
    if (qty <= 0) {
      showAlert('Erro', 'Por favor, informe uma quantidade válida');
      return;
    }
    
    if (!material) {
      showAlert('Erro', 'Material não encontrado');
      return;
    }
    
    const rental = parseFloat(rentalPrice) || 150;
    const replacement = parseFloat(replacementPrice) || 500;
    
    updateMaterial(material.id, {
      name: name.trim(),
      sku: sku.trim(),
      totalQuantity: qty,
      location: location.trim() || 'Depósito Principal',
      imageUri: imageUri || undefined,
      status,
      observations: observations.trim() || undefined,
      rentalPrice: rental,
      replacementPrice: replacement,
    });
    
    showAlert('Sucesso', 'Material atualizado com sucesso');
    router.back();
  };
  
  if (!material) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.danger} />
          <Text style={styles.notFoundText}>Material não encontrado</Text>
          <Button
            title="Voltar"
            variant="primary"
            onPress={() => router.back()}
          />
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Editar Material</Text>
        <Text style={styles.subtitle}>Atualize os dados do item</Text>
        
        <View style={styles.imageSection}>
          <Text style={styles.label}>Foto do Material</Text>
          
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
              >
                <Ionicons name="close-circle" size={32} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageButtons}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera" size={32} color={theme.colors.primary} />
                <Text style={styles.imageButtonText}>Tirar Foto</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.imageButton}
                onPress={handlePickImage}
              >
                <Ionicons name="images" size={32} color={theme.colors.primary} />
                <Text style={styles.imageButtonText}>Galeria</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <Input
          label="Nome do Material *"
          value={name}
          onChangeText={setName}
          placeholder="Ex: Gerador 10KVA"
        />
        
        <Input
          label="SKU / Código"
          value={sku}
          onChangeText={setSku}
          placeholder="Código do material"
        />
        
        <Input
          label="Quantidade Total *"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="0"
        />
        
        <Input
          label="Localização"
          value={location}
          onChangeText={setLocation}
          placeholder="Depósito Principal"
        />
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Status do Material *</Text>
          <View style={styles.statusOptions}>
            <TouchableOpacity
              style={[styles.statusOption, status === 'available' && styles.statusOptionActive]}
              onPress={() => setStatus('available')}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={status === 'available' ? '#FFFFFF' : '#10B981'} 
              />
              <Text style={[styles.statusOptionText, status === 'available' && styles.statusOptionTextActive]}>
                Disponível
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.statusOption, status === 'maintenance' && styles.statusOptionActive]}
              onPress={() => setStatus('maintenance')}
            >
              <Ionicons 
                name="construct" 
                size={20} 
                color={status === 'maintenance' ? '#FFFFFF' : '#3B82F6'} 
              />
              <Text style={[styles.statusOptionText, status === 'maintenance' && styles.statusOptionTextActive]}>
                Manutenção
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.statusOption, status === 'damaged' && styles.statusOptionActive]}
              onPress={() => setStatus('damaged')}
            >
              <Ionicons 
                name="warning" 
                size={20} 
                color={status === 'damaged' ? '#FFFFFF' : '#EF4444'} 
              />
              <Text style={[styles.statusOptionText, status === 'damaged' && styles.statusOptionTextActive]}>
                Danificado
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.statusOption, status === 'retired' && styles.statusOptionActive]}
              onPress={() => setStatus('retired')}
            >
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={status === 'retired' ? '#FFFFFF' : '#6B7280'} 
              />
              <Text style={[styles.statusOptionText, status === 'retired' && styles.statusOptionTextActive]}>
                Baixa
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Input
          label="Observações"
          value={observations}
          onChangeText={setObservations}
          placeholder="Informações sobre o estado do material"
          multiline
          numberOfLines={3}
        />
        
        <Input
          label="Valor de Locação (R$)"
          value={rentalPrice}
          onChangeText={setRentalPrice}
          keyboardType="decimal-pad"
          placeholder="150.00"
        />
        
        <Input
          label="Valor de Reposição (R$)"
          value={replacementPrice}
          onChangeText={setReplacementPrice}
          keyboardType="decimal-pad"
          placeholder="500.00"
        />
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={theme.colors.info} />
          <Text style={styles.infoText}>
            Quantidade locada: {material.rentedQuantity} unidade(s)
          </Text>
        </View>
        
        <View style={styles.actions}>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
          />
          <Button
            title="Salvar"
            variant="primary"
            onPress={handleSubmit}
            style={styles.button}
          />
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
    marginBottom: theme.spacing.xs,
  },
  
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  imageSection: {
    marginBottom: theme.spacing.lg,
  },
  
  imageButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  
  imageButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  
  imageButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  
  imagePreviewContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.full,
  },
  
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: `${theme.colors.info}10`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.info,
  },
  
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  
  button: {
    flex: 1,
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
    color: theme.colors.danger,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  
  statusOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  
  statusOptionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  statusOptionTextActive: {
    color: '#FFFFFF',
  },
});
