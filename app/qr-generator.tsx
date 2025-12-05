import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Button } from '../components';
import { useMaterials } from '../hooks/useMaterials';
import { useAlert } from '@/template';
import { theme } from '../constants/theme';

export default function QRGeneratorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { materials } = useMaterials();
  const { showAlert } = useAlert();
  const qrRef = useRef<any>(null);
  
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  
  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);
  
  const handleDownloadQR = async () => {
    try {
      if (!qrRef.current || !selectedMaterial) return;
      
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
        await MediaLibrary.createAlbumAsync('FinanControl', asset, false);
        
        showAlert('Sucesso!', `QR Code salvo na galeria: ${filename}`);
      });
    } catch (error) {
      showAlert('Erro', 'Não foi possível salvar o QR Code');
      console.error('Download error:', error);
    }
  };
  
  const handleShareQR = async () => {
    try {
      if (!qrRef.current || !selectedMaterial) return;
      
      qrRef.current.toDataURL(async (dataURL: string) => {
        const filename = `${selectedMaterial.sku}_qrcode.png`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        
        await FileSystem.writeAsStringAsync(
          fileUri,
          dataURL.replace('data:image/png;base64,', ''),
          { encoding: FileSystem.EncodingType.Base64 }
        );
        
        await Share.share({
          url: fileUri,
          title: `QR Code - ${selectedMaterial.name}`,
        });
      });
    } catch (error) {
      showAlert('Erro', 'Não foi possível compartilhar o QR Code');
      console.error('Share error:', error);
    }
  };
  
  const handlePrint = () => {
    showAlert('Funcionalidade de Impressão', 'Conecte uma impressora Bluetooth ou configure impressoras térmicas nas Configurações');
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerar QR Code</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {!selectedMaterial ? (
          <>
            <Text style={styles.title}>Selecione um Material</Text>
            <Text style={styles.subtitle}>Escolha o item para gerar o QR Code</Text>
            
            {materials.map(material => (
              <TouchableOpacity
                key={material.id}
                style={styles.materialItem}
                onPress={() => setSelectedMaterialId(material.id)}
              >
                <View style={styles.materialInfo}>
                  <Text style={styles.materialName}>{material.name}</Text>
                  <Text style={styles.materialSku}>SKU: {material.sku}</Text>
                  <Text style={styles.materialLocation}>
                    <Ionicons name="location" size={12} color={theme.colors.textSecondary} />
                    {' '}{material.location}
                  </Text>
                </View>
                <Ionicons name="qr-code" size={32} color={theme.colors.primary} />
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.qrSection}>
            <View style={styles.qrContainer}>
              <QRCode
                value={selectedMaterial.sku}
                size={240}
                backgroundColor="#FFFFFF"
                color="#000000"
                getRef={(ref) => (qrRef.current = ref)}
              />
            </View>
            
            <View style={styles.info}>
              <Text style={styles.infoTitle}>{selectedMaterial.name}</Text>
              <View style={styles.infoRow}>
                <Ionicons name="barcode" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoSku}>SKU: {selectedMaterial.sku}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoLocation}>{selectedMaterial.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="cube" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.infoQuantity}>
                  Disponível: {selectedMaterial.totalQuantity - selectedMaterial.rentedQuantity}/{selectedMaterial.totalQuantity}
                </Text>
              </View>
            </View>
            
            <View style={styles.actions}>
              <Button
                title="Baixar"
                variant="primary"
                onPress={handleDownloadQR}
                style={styles.actionButton}
              />
              <Button
                title="Compartilhar"
                variant="outline"
                onPress={handleShareQR}
                style={styles.actionButton}
              />
            </View>
            
            <Button
              title="Imprimir QR Code"
              variant="secondary"
              onPress={handlePrint}
              style={styles.printButton}
            />
            
            <TouchableOpacity
              style={styles.newButton}
              onPress={() => setSelectedMaterialId(null)}
            >
              <Text style={styles.newButtonText}>
                Gerar outro QR Code
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
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
  
  materialInfo: {
    flex: 1,
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
    marginBottom: theme.spacing.xs,
  },
  
  materialLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  
  qrSection: {
    alignItems: 'center',
  },
  
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.lg,
    marginBottom: theme.spacing.lg,
  },
  
  info: {
    width: '100%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  
  infoTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  infoSku: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  
  infoLocation: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  
  infoQuantity: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  
  actionButton: {
    flex: 1,
  },
  
  printButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  
  newButton: {
    paddingVertical: theme.spacing.md,
  },
  
  newButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    textAlign: 'center',
  },
});
