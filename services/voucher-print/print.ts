import { Voucher, VoucherTemplate, PrintOptions } from '@/types/generate-voucher'
import { VOUCHER_TEMPLATES, getTemplateById } from '@/constants/voucher-template'

class PrintService {
  private templates: Map<string, string> = new Map()

  constructor() {
    this.loadTemplates()
  }

  public async loadTemplates() {
    // In a real application, these would be loaded from files or API
    // For now, we'll define them as template literals
    const templateFiles = {
      classic: await this.fetchTemplate('/templates/classic.html'),
      modern: await this.fetchTemplate('/templates/modern.html'),
      compact: await this.fetchTemplate('/templates/compact.html'),
      elegant: await this.fetchTemplate('/templates/elegant.html'),
      colorful: await this.fetchTemplate('/templates/colorful.html')
    }

    Object.entries(templateFiles).forEach(([key, content]) => {
      this.templates.set(key, content)
    })
  }

  public async fetchTemplate(path: string): Promise<string> {
    // This would fetch the actual template file in a real application
    // For demo purposes, we'll return the template content
    const templates = {
      '/templates/classic.html': this.getClassicTemplate(),
    }
    
    return templates[path as keyof typeof templates] || ''
  }

  public getAvailableTemplates(): VoucherTemplate[] {
    return VOUCHER_TEMPLATES
  }

  public generateVoucherCards(vouchers: Voucher[], templateId: string): string {
    const template = getTemplateById(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    return vouchers.map((voucher, index) => {
      switch (templateId) {
        case 'classic':
          return this.generateClassicCard(voucher, index)
        case 'modern':
          return this.generateModernCard(voucher, index)
        case 'compact':
          return this.generateCompactCard(voucher, index)
        case 'elegant':
          return this.generateElegantCard(voucher, index)
        case 'colorful':
          return this.generateColorfulCard(voucher, index)
        default:
          return this.generateClassicCard(voucher, index)
      }
    }).join('')
  }

  public generatePrintHTML(
    vouchers: Voucher[], 
    batchName: string, 
    options: PrintOptions
  ): string {
    const templateContent = this.templates.get(options.template.id)
    if (!templateContent) {
      throw new Error(`Template ${options.template.id} not loaded`)
    }

    const voucherCards = this.generateVoucherCards(vouchers, options.template.id)
    
    return templateContent
      .replace('{{title}}', `Voucher Print - ${batchName}`)
      .replace('{{batchName}}', batchName)
      .replace('{{totalVouchers}}', vouchers.length.toString())
      .replace('{{generatedDate}}', new Date().toLocaleString('id-ID'))
      .replace('{{voucherCards}}', voucherCards)
      .replace(/{{columns}}/g, options.template.columns.toString())
      .replace(/{{pageSize}}/g, options.pageSize)
      .replace(/{{margin}}/g, options.margin)
  }

  public openPrintWindow(html: string): void {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
    } else {
      throw new Error('Failed to open print window. Please check popup blocker settings.')
    }
  }

  private generateClassicCard(voucher: Voucher, index: number): string {
    return `
      <div class="voucher-card">
        <div class="voucher-title">HOTSPOT VOUCHER</div>
        <div class="voucher-index">[${index + 1}]</div>
        <div class="voucher-label">Username</div>
        <div class="voucher-code">${voucher.username}</div>
        <div class="voucher-label">Password</div>
        <div class="voucher-code">${voucher.password}</div>
        <div class="voucher-details">
          ${voucher.validity} - ${voucher.profile}
        </div>
      </div>
    `
  }

  private generateModernCard(voucher: Voucher, index: number): string {
    return `
      <div class="voucher-card">
        <div class="voucher-title">🚀 WIFI ACCESS</div>
        <div class="voucher-index">[${index + 1}]</div>
        <div class="voucher-label">Username</div>
        <div class="voucher-code">${voucher.username}</div>
        <div class="voucher-label">Password</div>
        <div class="voucher-code">${voucher.password}</div>
        <div class="voucher-details">
          ⏱️ ${voucher.validity} | 📊 ${voucher.profile}
        </div>
      </div>
    `
  }

  private generateCompactCard(voucher: Voucher, index: number): string {
    return `
      <div class="voucher-card">
        <div class="voucher-title">WIFI</div>
        <div class="voucher-index">[${index + 1}]</div>
        <div class="voucher-label">User</div>
        <div class="voucher-code">${voucher.username}</div>
        <div class="voucher-label">Pass</div>
        <div class="voucher-code">${voucher.password}</div>
        <div class="voucher-details">${voucher.validity}</div>
      </div>
    `
  }

  private generateElegantCard(voucher: Voucher, index: number): string {
    return `
      <div class="voucher-card">
        <div class="voucher-title">✨ Premium Access</div>
        <div class="voucher-index">Voucher #${index + 1}</div>
        <div class="decorative-line"></div>
        <div class="voucher-label">Username</div>
        <div class="voucher-code">${voucher.username}</div>
        <div class="voucher-label">Password</div>
        <div class="voucher-code">${voucher.password}</div>
        <div class="decorative-line"></div>
        <div class="voucher-details">
          ${voucher.validity} • ${voucher.profile}
        </div>
      </div>
    `
  }

  private generateColorfulCard(voucher: Voucher, index: number): string {
    const emojis = ['🎯', '🎪', '🎨', '🌈', '🎊']
    const emoji = emojis[index % emojis.length]
    
    return `
      <div class="voucher-card">
        <div class="voucher-title">${emoji} SUPER WIFI ${emoji}</div>
        <div class="voucher-index">Card #${index + 1}</div>
        <div class="voucher-label">👤 Username</div>
        <div class="voucher-code">${voucher.username}</div>
        <div class="voucher-label">🔑 Password</div>
        <div class="voucher-code">${voucher.password}</div>
        <div class="voucher-details">
          ⏰ ${voucher.validity} | 📈 ${voucher.profile}
        </div>
      </div>
    `
  }

  // Template content methods (these would normally be loaded from files)
  private getClassicTemplate(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
    <style>
        @media print {
            @page { size: {{pageSize}}; margin: {{margin}}; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
            .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .voucher-grid { display: grid; grid-template-columns: repeat({{columns}}, 1fr); gap: 5mm; }
            .voucher-card { border: 2px solid #000; padding: 8px; text-align: center; background: white; border-radius: 4px; }
            .voucher-title { font-weight: bold; font-size: 12px; margin-bottom: 5px; }
            .voucher-index { font-size: 10px; color: #666; margin-bottom: 5px; }
            .voucher-label { font-size: 10px; margin-bottom: 3px; }
            .voucher-code { font-weight: bold; font-size: 14px; margin-bottom: 5px; font-family: 'Courier New', monospace; }
            .voucher-details { font-size: 9px; color: #333; }
            .no-print { display: none !important; }
        }
        @media screen {
            body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
            .print-header { text-align: center; margin-bottom: 30px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .voucher-grid { display: grid; grid-template-columns: repeat({{columns}}, 1fr); gap: 15px; }
            .voucher-card { border: 2px solid #000; padding: 15px; text-align: center; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .control-buttons { position: fixed; top: 20px; right: 20px; z-index: 1000; }
            .control-buttons button { margin-left: 10px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; }
        }
    </style>
</head>
<body>
    <div class="control-buttons no-print">
        <button onclick="window.print()">🖨️ Print</button>
        <button onclick="window.close()">✖️ Close</button>
    </div>
    <div class="print-header">
        <h1>🌐 HOTSPOT VOUCHERS</h1>
        <h2>📦 Batch: {{batchName}}</h2>
        <p>📊 Total Vouchers: {{totalVouchers}}</p>
        <p>📅 Generated on: {{generatedDate}}</p>
    </div>
    <div class="voucher-grid">{{voucherCards}}</div>
    <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script>
</body>
</html>`
  }
}

const PrintVoucher = new PrintService()

export const fetchPrint = PrintVoucher.fetchTemplate("/templates/classic.html");