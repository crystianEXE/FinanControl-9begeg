import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Input, Button, QRScanner } from '../components';
import { useMaterials } from '../hooks/useMaterials';
import { useAlert } from '@/template';
import { theme } from '../constants/theme';

export default function AddMaterialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addMaterial } = useMaterials();
  const { showAlert } = useAlert();
  
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('Depósito Principal');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatedSKU, setGeneratedSKU] = useState('');
  const qrRef = React.useRef<any>(null);
  
  const handleQRScanned = (data: string) => {
    setSku(data);
    setShowScanner(false);
    showAlert('QR Code Lido', `SKU: ${data}`);
  };
  
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
    
    // Gerar SKU automaticamente se estiver vazio
    let finalSKU = sku.trim();
    if (!finalSKU) {
      const timestamp = Date.now();
      const namePrefix = name.trim().substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
      finalSKU = `${namePrefix || 'MAT'}${timestamp}`;
    }
    
    addMaterial({
      name: name.trim(),
      sku: finalSKU,
      totalQuantity: qty,
      location: location.trim() || 'Depósito Principal',
      imageUri: imageUri || undefined,
    });
    
    setGeneratedSKU(finalSKU);
    setShowQRModal(true);
  };
  
  const handleDownloadQR = async () => {
    try {
      if (!qrRef.current) return;
      
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permissão negada', 'Precisamos de acesso à galeria para salvar o QR Code');
        return;
      }
      
      qrRef.current.toDataURL(async (dataURL: string) => {
        const filename = `${generatedSKU}_qrcode.png`;
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        
        await FileSystem.writeAsStringAsync(
          fileUri,
          dataURL.replace('data:image/png;base64,', ''),
          { encoding: FileSystem.EncodingType.Base64 }
        );
        
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('EstoqueControl', asset, false);
        
        showAlert('QR Code salvo!', `O QR Code foi salvo na galeria: ${filename}`);
      });
    } catch (error) {
      showAlert('Erro', 'Não foi possível salvar o QR Code');
      console.error('Download error:', error);
    }
  };
  
  const handleFinish = () => {
    setShowQRModal(false);
    router.back();
  };
  
  if (showScanner) {
    return (
      <QRScanner
        title="Escanear SKU do Material"
        onScan={handleQRScanned}
        onClose={() => setShowScanner(false)}
      />
    );
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Cadastrar Material</Text>
        <Text style={styles.subtitle}>Preencha os dados do novo item</Text>
        
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
        
        <View>
          <Text style={styles.label}>SKU / Código</Text>
          <View style={styles.skuContainer}>
            <Input
              value={sku}
              onChangeText={setSku}
              placeholder="Deixe vazio para gerar automaticamente"
              style={{ flex: 1 }}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setShowScanner(true)}
            >
              <Ionicons name="camera" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
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
        
        <View style={styles.actions}>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
          />
          <Button
            title="Cadastrar"
            variant="primary"
            onPress={handleSubmit}
            style={styles.button}
          />
        </View>
      </ScrollView>
      
      {/* Modal de QR Code */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="slide"
        onRequestClose={handleFinish}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
              <Text style={styles.modalTitle}>Material Cadastrado!</Text>
              <Text style={styles.modalSubtitle}>QR Code gerado com sucesso</Text>
            </View>
            
            <View style={styles.qrCodeContainer}>
              {generatedSKU ? (
                <QRCode
                  value={generatedSKU}
                  size={200}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                  getRef={(ref) => (qrRef.current = ref)}
                />
              ) : (
                <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="alert-circle" size={48} color={theme.colors.warning} />
                  <Text style={{ marginTop: 8, color: theme.colors.textSecondary }}>SKU não gerado</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.skuText}>SKU: {generatedSKU}</Text>
            
            <View style={styles.modalActions}>
              <Button
                title="Baixar QR Code"
                variant="primary"
                onPress={handleDownloadQR}
                style={styles.modalButton}
              />
              <Button
                title="Concluir"
                variant="outline"
                onPress={handleFinish}
                style={styles.modalButton}
              />
            </View>
            
            <Text style={styles.modalHint}>
              💡 Imprima e cole no material para facilitar o scan
            </Text>
          </View>
        </View>
      </Modal>
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
  
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  
  button: {
    flex: 1,
  },
  
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  skuContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  
  scanButton: {
    backgroundColor: theme.colors.primary,
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  
  modalHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  
  modalSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  qrCodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  
  skuText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  
  modalActions: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  
  modalButton: {
    width: '100%',
  },
  
  modalHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
});
