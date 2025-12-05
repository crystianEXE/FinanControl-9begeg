import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useMaterials } from '../../hooks/useMaterials';
import { materialService } from '../../services/materialService';
import { theme } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '@/template';

export default function MaterialsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { materials, loading } = useMaterials();
  const { showAlert } = useAlert();
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<{ sku: string; name: string } | null>(null);
  const qrRef = useRef<any>(null);
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <View style={styles.logoContainer}>
            <Ionicons name="clipboard" size={20} color="#FF8C00" />
            <View style={styles.logoBox}>
              <Ionicons name="cube" size={12} color="#FF8C00" />
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Materiais</Text>
          <Text style={styles.subtitle}>{materials.length} itens cadastrados</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-material')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {materials.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={64} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>Nenhum material cadastrado</Text>
          <Text style={styles.emptySubtext}>Toque no botão + para adicionar</Text>
        </View>
      ) : (
        <FlatList
          data={materials}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const available = materialService.calculateAvailable(item);
            return (
              <View style={styles.materialCard}>
                <View style={styles.materialImageContainer}>
                  {item.imageUri ? (
                    <Image
                      source={{ uri: item.imageUri }}
                      style={styles.materialImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.materialImagePlaceholder}>
                      <Ionicons name="image-outline" size={32} color={theme.colors.textLight} />
                    </View>
                  )}
                </View>
                
                <View style={styles.materialInfo}>
                  <View style={styles.materialHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.materialName}>{item.name}</Text>
                      <Text style={styles.materialSku}>SKU: {item.sku}</Text>
                    </View>
                    
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${materialService.getStatusColor(item.status)}20` }
                      ]}
                    >
                      <Ionicons
                        name={materialService.getStatusIcon(item.status) as any}
                        size={14}
                        color={materialService.getStatusColor(item.status)}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: materialService.getStatusColor(item.status) }
                        ]}
                      >
                        {materialService.getStatusLabel(item.status)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.quantityRow}>
                    <View style={styles.quantityItem}>
                      <Text style={styles.quantityLabel}>Total</Text>
                      <Text style={styles.quantityValue}>{item.totalQuantity}</Text>
                    </View>
                    
                    <View style={styles.quantityItem}>
                      <Text style={styles.quantityLabel}>Disponível</Text>
                      <Text style={[
                        styles.quantityValue,
                        { color: available > 0 ? theme.colors.success : theme.colors.danger }
                      ]}>
                        {available}
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.qrButton}
                      onPress={() => {
                        setSelectedMaterial({ sku: item.sku, name: item.name });
                        setShowQRModal(true);
                      }}
                    >
                      <Ionicons name="qr-code" size={20} color={theme.colors.secondary} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => router.push(`/edit-material?id=${item.id}`)}
                    >
                      <Ionicons name="create" size={20} color={theme.colors.primary} />
                      <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Modal de QR Code */}
      <Modal
        visible={showQRModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>QR Code do Material</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedMaterial && (
              <>
                <Text style={styles.materialNameModal}>{selectedMaterial.name}</Text>
                <Text style={styles.materialSkuModal}>SKU: {selectedMaterial.sku}</Text>
                
                <View style={styles.qrCodeContainer}>
                  <QRCode
                    value={selectedMaterial.sku}
                    size={200}
                    backgroundColor="#FFFFFF"
                    color="#000000"
                    getRef={(ref) => (qrRef.current = ref)}
                  />
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={async () => {
                      try {
                        if (!qrRef.current) return;
                        
                        const { status } = await MediaLibrary.requestPermissionsAsync();
                        if (status !== 'granted') {
                          showAlert('Permissão negada', 'Precisamos de acesso à galeria para salvar o QR Code');
                          return;
                        }
                        
                        qrRef.current.toDataURL(async (dataURL: string) => {
                          const filename = `${selectedMaterial.sku}_qrcode.png`;
                          const fileUri = `${FileSystem.documentDirectory}${filename}`;
                          
                          await FileSystem.writeAsStringAsync(
                            fileUri,
                            dataURL.replace('data:image/png;base64,', ''),
                            { encoding: FileSystem.EncodingType.Base64 }
                          );
                          
                          const asset = await MediaLibrary.createAssetAsync(fileUri);
                          await MediaLibrary.createAlbumAsync('EstoqueControl', asset, false);
                          
                          showAlert('QR Code salvo!', `O QR Code foi salvo na galeria`);
                        });
                      } catch (error) {
                        showAlert('Erro', 'Não foi possível salvar o QR Code');
                        console.error('Download error:', error);
                      }
                    }}
                  >
                    <Ionicons name="download" size={24} color="#FFFFFF" />
                    <Text style={styles.downloadButtonText}>Baixar QR Code</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowQRModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalHint}>
                  💡 Imprima e cole no material para facilitar o scan
                </Text>
              </>
            )}
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
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
  },
  
  logoWrapper: {
    marginRight: theme.spacing.sm,
  },
  
  logoContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  logoBox: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  addButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  
  list: {
    padding: theme.spacing.md,
  },
  
  materialCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  
  materialImageContainer: {
    width: 80,
    height: 80,
    marginRight: theme.spacing.md,
  },
  
  materialImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  
  materialImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  materialInfo: {
    flex: 1,
  },
  
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  
  materialName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  
  materialSku: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  
  quantityItem: {
    alignItems: 'center',
  },
  
  quantityLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  
  quantityValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  qrButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `${theme.colors.secondary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  
  editButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
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
  
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  
  materialNameModal: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  materialSkuModal: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  
  qrCodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  
  modalActions: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    width: '100%',
  },
  
  downloadButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
  
  closeButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
    alignItems: 'center',
  },
  
  closeButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  
  modalHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
