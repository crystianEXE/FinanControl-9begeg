import { Stack } from 'expo-router';
import { MaterialsProvider } from '../contexts/MaterialsContext';
import { CustomersProvider } from '../contexts/CustomersContext';
import { SuppliersProvider } from '../contexts/SuppliersContext';
import { LogisticsProvider } from '../contexts/LogisticsContext';
import { RentalsProvider } from '../contexts/RentalsContext';
import { ContractsProvider } from '../contexts/ContractsContext';
import { AlertProvider } from '@/template';

export default function RootLayout() {
  return (
    <AlertProvider>
      <MaterialsProvider>
        <CustomersProvider>
          <SuppliersProvider>
            <LogisticsProvider>
              <RentalsProvider>
                <ContractsProvider>
                  <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen 
                    name="add-material" 
                    options={{ 
                      title: 'Cadastrar Material',
                      presentation: 'modal',
                    }} 
                  />
                  <Stack.Screen 
                    name="add-customer" 
                    options={{ 
                      title: 'Cadastrar Cliente',
                      presentation: 'modal',
                    }} 
                  />
                  <Stack.Screen 
                    name="edit-material" 
                    options={{ 
                      title: 'Editar Material',
                      presentation: 'modal',
                    }} 
                  />
                  <Stack.Screen 
                    name="edit-customer" 
                    options={{ 
                      title: 'Editar Cliente',
                      presentation: 'modal',
                    }} 
                  />
                  <Stack.Screen 
                    name="create-contract" 
                    options={{ 
                      title: 'Criar Contrato',
                      presentation: 'modal',
                    }} 
                  />
                  <Stack.Screen 
                    name="view-contract" 
                    options={{ 
                      title: 'Visualizar Contrato',
                      presentation: 'modal',
                    }} 
                  />
                  <Stack.Screen 
                    name="qr-generator" 
                    options={{ 
                      title: 'Gerar QR Code',
                      presentation: 'modal',
                    }} 
                  />
                  <Stack.Screen 
                    name="logistics" 
                    options={{ 
                      title: 'Logística',
                      presentation: 'modal',
                    }} 
                  />
                  <Stack.Screen 
                    name="settings" 
                    options={{ 
                      title: 'Configurações',
                    }} 
                  />
                  <Stack.Screen 
                    name="rental-note" 
                    options={{ 
                      title: 'Nota de Locação',
                      presentation: 'modal',
                    }} 
                  />
                </Stack>
                </ContractsProvider>
              </RentalsProvider>
            </LogisticsProvider>
          </SuppliersProvider>
        </CustomersProvider>
      </MaterialsProvider>
    </AlertProvider>
  );
}
