import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { RentalNote } from './rentalService';
import { Material } from './materialService';

interface PDFOptions {
  rental: RentalNote;
  materials: Material[];
  itemPrices: Record<string, number>;
}

export const pdfService = {
  async generateRentalPDF(options: PDFOptions): Promise<string> {
    const { rental, materials, itemPrices } = options;
    
    const html = this.generateHTML(rental, materials, itemPrices);
    
    try {
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });
      
      return uri;
    } catch (error) {
      throw new Error('Erro ao gerar PDF');
    }
  },
  
  async sharePDF(uri: string, noteNumber: string): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      throw new Error('Compartilhamento não disponível neste dispositivo');
    }
    
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Nota de Locação ${noteNumber}`,
      UTI: 'com.adobe.pdf',
    });
  },
  
  async downloadPDF(uri: string, noteNumber: string): Promise<string> {
    const fileName = `${noteNumber.replace(/\//g, '-')}_${Date.now()}.pdf`;
    const destUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.copyAsync({
      from: uri,
      to: destUri,
    });
    
    return destUri;
  },
  
  generateHTML(rental: RentalNote, materials: Material[], itemPrices: Record<string, number>): string {
    const totalValue = rental.materials.reduce((sum, material) => {
      const price = itemPrices[material.id] || 0;
      return sum + (price * material.quantity);
    }, 0);
    
    const rentalDate = new Date(rental.rentalDate);
    const expectedReturnDate = new Date(rental.expectedReturnDate);
    const daysDiff = Math.ceil((expectedReturnDate.getTime() - rentalDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Logo em base64 (EstoqueControl)
    const logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNGRkZGRkYiLz4KICA8cGF0aCBkPSJNMjAgMTZIMzZWMjBIMjBWMTZaIiBmaWxsPSIjMTIzNDU2Ii8+CiAgPHBhdGggZD0iTTIwIDI2SDMyVjMwSDIwVjI2WiIgZmlsbD0iIzEyMzQ1NiIvPgogIDxwYXRoIGQ9Ik0yMCAzNkgyOFY0MEgyMFYzNloiIGZpbGw9IiMxMjM0NTYiLz4KICA8cmVjdCB4PSI0MCIgeT0iMjgiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgZmlsbD0iI0ZGOEMwMCIvPgogIDxyZWN0IHg9IjQwIiB5PSI0MiIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiBmaWxsPSIjRkY4QzAwIi8+CiAgPHJlY3QgeD0iNTQiIHk9IjM1IiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9IiNGRjhDMDAiLz4KPC9zdmc+';
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nota de Locação ${rental.noteNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #1F2937;
      line-height: 1.4;
      padding: 20px;
      background: #F9FAFB;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
      color: white;
      padding: 24px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }
    
    .header p {
      font-size: 13px;
      opacity: 0.95;
    }
    
    .note-number {
      background: rgba(255, 255, 255, 0.2);
      display: inline-block;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 12px;
      backdrop-filter: blur(10px);
    }
    
    .content {
      padding: 20px;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #667EEA;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #E5E7EB;
      display: flex;
      align-items: center;
    }
    
    .section-icon {
      width: 20px;
      height: 20px;
      background: #667EEA;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      margin-right: 8px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 12px;
    }
    
    .info-item {
      background: #F9FAFB;
      padding: 10px;
      border-radius: 6px;
      border-left: 3px solid #667EEA;
    }
    
    .info-label {
      font-size: 10px;
      text-transform: uppercase;
      color: #6B7280;
      font-weight: 600;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 12px;
      color: #1F2937;
      font-weight: 500;
    }
    
    .materials-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 12px;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    .materials-table thead {
      background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
      color: white;
    }
    
    .materials-table th {
      padding: 10px 8px;
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    
    .materials-table td {
      padding: 8px;
      border-bottom: 1px solid #E5E7EB;
      font-size: 11px;
    }
    
    .materials-table tbody tr {
      background: white;
      transition: background 0.2s;
    }
    
    .materials-table tbody tr:nth-child(even) {
      background: #F9FAFB;
    }
    
    .materials-table tbody tr:last-child td {
      border-bottom: none;
    }
    
    .item-number {
      width: 24px;
      height: 24px;
      background: #667EEA;
      color: white;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 11px;
    }
    
    .item-sku {
      color: #6B7280;
      font-size: 9px;
      font-family: 'Courier New', monospace;
      background: #F3F4F6;
      padding: 2px 6px;
      border-radius: 3px;
      display: inline-block;
      margin-top: 2px;
    }
    
    .quantity-badge {
      background: #E0E7FF;
      color: #4338CA;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 11px;
      display: inline-block;
    }
    
    .price {
      color: #059669;
      font-weight: 700;
      font-size: 12px;
    }
    
    .total-section {
      background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
      padding: 12px;
      border-radius: 6px;
      margin-top: 12px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid #D1D5DB;
    }
    
    .total-row:last-child {
      border-bottom: none;
      padding-top: 8px;
      margin-top: 6px;
      border-top: 2px solid #667EEA;
    }
    
    .total-label {
      font-size: 11px;
      color: #6B7280;
      font-weight: 500;
    }
    
    .total-value {
      font-size: 12px;
      font-weight: 600;
      color: #1F2937;
    }
    
    .grand-total-label {
      font-size: 13px;
      font-weight: 700;
      color: #1F2937;
    }
    
    .grand-total-value {
      font-size: 18px;
      font-weight: 700;
      color: #059669;
    }
    
    .date-card {
      background: white;
      border: 2px solid #E5E7EB;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
    }
    
    .date-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 16px;
      margin: 0 auto 8px;
    }
    
    .date-label {
      font-size: 9px;
      text-transform: uppercase;
      color: #6B7280;
      font-weight: 600;
      letter-spacing: 0.3px;
      margin-bottom: 4px;
    }
    
    .date-value {
      font-size: 13px;
      font-weight: 700;
      color: #1F2937;
    }
    
    .clauses-box {
      background: #FFFBEB;
      border-left: 3px solid #F59E0B;
      padding: 12px;
      border-radius: 6px;
      margin-top: 12px;
    }
    
    .clause {
      margin-bottom: 8px;
      padding-left: 12px;
      position: relative;
      font-size: 10px;
      line-height: 1.5;
      color: #374151;
    }
    
    .clause:before {
      content: "▸";
      position: absolute;
      left: 0;
      color: #F59E0B;
      font-weight: 700;
    }
    
    .clause:last-child {
      margin-bottom: 0;
    }
    
    .footer {
      background: #F9FAFB;
      padding: 16px;
      text-align: center;
      border-top: 2px solid #E5E7EB;
    }
    
    .footer-text {
      color: #6B7280;
      font-size: 10px;
      margin-bottom: 4px;
    }
    
    .footer-subtext {
      color: #9CA3AF;
      font-size: 9px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-active {
      background: #D1FAE5;
      color: #065F46;
    }
    
    .status-overdue {
      background: #FEE2E2;
      color: #991B1B;
    }
    
    .status-returned {
      background: #E5E7EB;
      color: #374151;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoBase64}" alt="EstoqueControl" style="width: 80px; height: 80px; margin-bottom: 16px;" />
      <h1>EstoqueControl</h1>
      <p>Sistema de Gestão de Locações</p>
      <div class="note-number">${rental.noteNumber}</div>
      <div style="margin-top: 16px;">
        <span class="status-badge status-${rental.status}">
          ${this.getStatusLabel(rental.status)}
        </span>
      </div>
    </div>
    
    <div class="content">
      <!-- Cliente -->
      <div class="section">
        <div class="section-title">
          <span class="section-icon">👤</span>
          Dados do Cliente
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Nome / Razão Social</div>
            <div class="info-value">${rental.customerName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">CPF / CNPJ</div>
            <div class="info-value">${rental.customerDocument}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Telefone</div>
            <div class="info-value">${rental.customerPhone}</div>
          </div>
          <div class="info-item">
            <div class="info-label">E-mail</div>
            <div class="info-value">${rental.customerEmail}</div>
          </div>
        </div>
        ${rental.deliveryAddress ? `
        <div class="info-grid" style="margin-top: 16px;">
          <div class="info-item" style="grid-column: 1 / -1;">
            <div class="info-label">Endereço de Entrega</div>
            <div class="info-value">${rental.deliveryAddress}</div>
          </div>
        </div>
        ` : ''}
      </div>
      
      <!-- Datas -->
      <div class="section">
        <div class="section-title">
          <span class="section-icon">📅</span>
          Período de Locação
        </div>
        <div class="info-grid">
          <div class="date-card">
            <div class="date-icon">📤</div>
            <div class="date-label">Data de Saída</div>
            <div class="date-value">${rentalDate.toLocaleDateString('pt-BR')}</div>
          </div>
          <div class="date-card">
            <div class="date-icon">📥</div>
            <div class="date-label">Devolução Prevista</div>
            <div class="date-value">${expectedReturnDate.toLocaleDateString('pt-BR')}</div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 16px; color: #6B7280; font-size: 14px;">
          <strong>Prazo:</strong> ${daysDiff} dia${daysDiff !== 1 ? 's' : ''}
        </div>
      </div>
      
      <!-- Materiais -->
      <div class="section">
        <div class="section-title">
          <span class="section-icon">📦</span>
          Materiais Locados
        </div>
        <table class="materials-table">
          <thead>
            <tr>
              <th style="width: 60px;">#</th>
              <th>Item</th>
              <th style="width: 100px; text-align: center;">Qtd</th>
              <th style="width: 120px; text-align: right;">Valor Unit.</th>
              <th style="width: 120px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rental.materials.map((material, index) => {
              const fullMaterial = materials.find(m => m.id === material.id);
              const unitPrice = itemPrices[material.id] || 0;
              const total = unitPrice * material.quantity;
              
              // Converter imagem para base64 se existir
              let imageBase64 = '';
              if (fullMaterial?.imageUri) {
                // Placeholder: em produção seria necessário converter a URI para base64
                // Por enquanto, usar um placeholder visual
                imageBase64 = fullMaterial.imageUri;
              }
              
              return `
            <tr>
              <td>
                <span class="item-number">${index + 1}</span>
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                  ${fullMaterial?.imageUri ? `
                    <div style="width: 60px; height: 60px; border-radius: 6px; overflow: hidden; background: #F3F4F6; flex-shrink: 0;">
                      <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">📦</div>
                    </div>
                  ` : ''}
                  <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">${material.name}</div>
                    <span class="item-sku">${material.sku}</span>
                  </div>
                </div>
              </td>
              <td style="text-align: center;">
                <span class="quantity-badge">${material.quantity}x</span>
              </td>
              <td style="text-align: right;">
                <span class="price">R$ ${unitPrice.toFixed(2)}</span>
              </td>
              <td style="text-align: right;">
                <span class="price">R$ ${total.toFixed(2)}</span>
              </td>
            </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span class="total-label">Quantidade Total de Itens</span>
            <span class="total-value">${rental.materials.reduce((sum, m) => sum + m.quantity, 0)} unidades</span>
          </div>
          <div class="total-row">
            <span class="total-label">Período de Locação</span>
            <span class="total-value">${daysDiff} dia${daysDiff !== 1 ? 's' : ''}</span>
          </div>
          <div class="total-row">
            <span class="grand-total-label">VALOR TOTAL</span>
            <span class="grand-total-value">R$ ${totalValue.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <!-- Cláusulas -->
      <div class="section">
        <div class="section-title">
          <span class="section-icon">📋</span>
          Termos e Condições
        </div>
        <div class="clauses-box">
          <div class="clause">
            <strong>OBJETO:</strong> A presente locação tem por objeto os materiais listados acima, os quais são entregues em perfeitas condições de uso e devem ser devolvidos nas mesmas condições.
          </div>
          <div class="clause">
            <strong>RESPONSABILIDADE:</strong> O locatário é responsável pelos materiais desde a retirada até a devolução, devendo ressarcir quaisquer danos ou extravios.
          </div>
          <div class="clause">
            <strong>DEVOLUÇÃO:</strong> A devolução deve ocorrer na data prevista. O atraso acarretará cobrança de nova diária por cada dia de atraso.
          </div>
          <div class="clause">
            <strong>CONSERVAÇÃO:</strong> É proibido furar, colar, cortar, pintar ou adesivar os materiais. Qualquer dano será cobrado conforme tabela de reposição.
          </div>
          <div class="clause">
            <strong>INADIMPLÊNCIA:</strong> Em caso de atraso no pagamento, será cobrada multa de 2% mais juros de 1% ao mês sobre o valor devido.
          </div>
          <div class="clause">
            <strong>FORO:</strong> Fica eleito o foro da comarca local para dirimir quaisquer questões decorrentes deste contrato.
          </div>
        </div>
      </div>
      
      ${rental.notes ? `
      <div class="section">
        <div class="section-title">
          <span class="section-icon">📝</span>
          Observações
        </div>
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border-left: 4px solid #667EEA;">
          <p style="color: #374151; font-size: 14px; line-height: 1.8;">${rental.notes}</p>
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <div class="footer-text">
        Documento gerado em ${new Date(rental.createdAt).toLocaleDateString('pt-BR')} às ${new Date(rental.createdAt).toLocaleTimeString('pt-BR')}
      </div>
      <div class="footer-subtext">
        Este documento comprova a locação dos materiais listados e faz parte integrante do contrato.
      </div>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
        <div style="color: #9CA3AF; font-size: 10px;">
          EstoqueControl - Sistema de Gestão de Locações<br>
          Desenvolvido por Crystian Fernando Gomes da Silva - 2025
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  },
  
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Ativa',
      returned: 'Devolvida',
      overdue: 'Atrasada',
    };
    return labels[status] || status;
  },
};
