import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, Button } from '../components';
import { useCustomers } from '../hooks/useCustomers';
import { useAlert } from '@/template';
import { theme } from '../constants/theme';

export default function AddCustomerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addCustomer } = useCustomers();
  const { showAlert } = useAlert();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf');
  const [notes, setNotes] = useState('');
  
  const [hasAddress, setHasAddress] = useState(false);
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const handleSubmit = () => {
    if (!name.trim()) {
      showAlert('Erro', 'Por favor, informe o nome do cliente');
      return;
    }
    
    if (!email.trim()) {
      showAlert('Erro', 'Por favor, informe o e-mail');
      return;
    }
    
    if (!phone.trim()) {
      showAlert('Erro', 'Por favor, informe o telefone');
      return;
    }
    
    if (!document.trim()) {
      showAlert('Erro', `Por favor, informe o ${documentType.toUpperCase()}`);
      return;
    }
    
    addCustomer({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      document: document.trim(),
      documentType,
      address: hasAddress ? {
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
      } : undefined,
      notes: notes.trim(),
    });
    
    showAlert('Sucesso', 'Cliente cadastrado com sucesso');
    router.back();
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Cadastrar Cliente</Text>
        <Text style={styles.subtitle}>Preencha os dados do cliente</Text>
        
        <Input
          label="Nome Completo *"
          value={name}
          onChangeText={setName}
          placeholder="Nome do cliente"
        />
        
        <Input
          label="E-mail *"
          value={email}
          onChangeText={setEmail}
          placeholder="email@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Input
          label="Telefone *"
          value={phone}
          onChangeText={setPhone}
          placeholder="(11) 98765-4321"
          keyboardType="phone-pad"
        />
        
        <View style={styles.documentTypeSwitch}>
          <Text style={styles.label}>Tipo de Documento</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>CPF</Text>
            <Switch
              value={documentType === 'cnpj'}
              onValueChange={(value) => setDocumentType(value ? 'cnpj' : 'cpf')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
            <Text style={styles.switchLabel}>CNPJ</Text>
          </View>
        </View>
        
        <Input
          label={`${documentType.toUpperCase()} *`}
          value={document}
          onChangeText={setDocument}
          placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
          keyboardType="numeric"
        />
        
        <View style={styles.addressToggle}>
          <Text style={styles.label}>Adicionar Endereço</Text>
          <Switch
            value={hasAddress}
            onValueChange={setHasAddress}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        </View>
        
        {hasAddress && (
          <>
            <Input
              label="CEP"
              value={zipCode}
              onChangeText={setZipCode}
              placeholder="00000-000"
              keyboardType="numeric"
            />
            
            <View style={styles.row}>
              <Input
                label="Rua"
                value={street}
                onChangeText={setStreet}
                placeholder="Nome da rua"
                style={{ flex: 2 }}
              />
              <Input
                label="Número"
                value={number}
                onChangeText={setNumber}
                placeholder="123"
                keyboardType="numeric"
                style={{ flex: 1 }}
              />
            </View>
            
            <Input
              label="Complemento"
              value={complement}
              onChangeText={setComplement}
              placeholder="Apto, bloco, etc."
            />
            
            <Input
              label="Bairro"
              value={neighborhood}
              onChangeText={setNeighborhood}
              placeholder="Nome do bairro"
            />
            
            <View style={styles.row}>
              <Input
                label="Cidade"
                value={city}
                onChangeText={setCity}
                placeholder="São Paulo"
                style={{ flex: 2 }}
              />
              <Input
                label="UF"
                value={state}
                onChangeText={setState}
                placeholder="SP"
                maxLength={2}
                autoCapitalize="characters"
                style={{ flex: 1 }}
              />
            </View>
          </>
        )}
        
        <Input
          label="Observações"
          value={notes}
          onChangeText={setNotes}
          placeholder="Notas sobre o cliente"
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
            title="Cadastrar"
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
  
  documentTypeSwitch: {
    marginBottom: theme.spacing.md,
  },
  
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  
  switchLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  
  addressToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  
  button: {
    flex: 1,
  },
});
