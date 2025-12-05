import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Share, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RentalNoteViewer } from '../components/feature/RentalNoteViewer';
import { useRentals } from '../hooks/useRentals';
import { useMaterials } from '../hooks/useMaterials';
import { pdfService } from '../services/pdfService';
import { theme } from '../constants/theme';

export default function RentalNoteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { getRentalById } = useRentals();
  const { materials } = useMaterials();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const rentalId = params.id as string;
  const rental = getRentalById(rentalId);
  
  if (!rental) {
    return null;
  }
  
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      const itemPrices: Record<string, number> = {};
      rental.materials.forEach(material => {
        itemPrices[material.id] = material.unitPrice || 150;
      });
      
      const uri = await pdfService.generateRentalPDF({
        rental,
        materials,
        itemPrices,
      });
      
      await pdfService.sharePDF(uri, rental.noteNumber);
      
      Alert.alert('Sucesso', 'PDF gerado e compartilhado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF');
      console.error('PDF error:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Nota de Locação ${rental.noteNumber}\n\nCliente: ${rental.customerName}\nData: ${new Date(rental.rentalDate).toLocaleDateString('pt-BR')}\n\nTotal de itens: ${rental.materials.reduce((sum, m) => sum + m.quantity, 0)}`,
        title: `Nota ${rental.noteNumber}`,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar a nota');
    }
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleDownloadPDF} 
            style={styles.headerButton}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons name="document-text" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <RentalNoteViewer rental={rental} />
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
    backgroundColor: '#FFFFFF',
  },
  
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
});
