"use client"

interface VoucherPreviewProps {
  template: "simple" | "card" | "minimal" | "receipt"
  voucher: {
    code: string
    profile: string
    validity?: string
    instructions?: string
    costPrice?: number
    sellingPrice?: number
  }
  companyInfo?: {
    name: string
    address?: string
    phone?: string
    website?: string
  }
  showInstructions?: boolean
  showPrice?: boolean
  currencySymbol?: string
}

export function VoucherPreview({
  template,
  voucher,
  companyInfo,
  showInstructions = true,
  showPrice = true,
  currencySymbol = "Rp",
}: VoucherPreviewProps) {
  const formatPrice = (price?: number) => {
    if (!price || !showPrice) return ""
    return `${currencySymbol} ${price.toLocaleString("id-ID")}`
  }

  const renderSimpleTemplate = () => (
    <div className="w-64 h-36 bg-white border-2 border-gray-300 border-dashed p-3 font-mono text-sm">
      <div className="text-center mb-2">
        <div className="font-bold text-gray-800 text-xs">{companyInfo?.name || "WiFi Voucher"}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-600 mb-1">Kode Voucher</div>
        <div className="text-lg font-bold bg-gray-100 p-1 border mb-2">{voucher.code}</div>
      </div>
      <div className="text-xs text-gray-500 text-center space-y-1">
        <div>{voucher.profile}</div>
        <div>{voucher.validity || "24h"}</div>
        {showPrice && voucher.sellingPrice && (
          <div className="font-bold text-gray-800">{formatPrice(voucher.sellingPrice)}</div>
        )}
      </div>
    </div>
  )

  const renderCardTemplate = () => (
    <div className="w-72 h-44 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
      <div className="text-center mb-3">
        <div className="text-lg font-bold">{companyInfo?.name || "Internet Access"}</div>
        <div className="text-sm opacity-90">WiFi Voucher</div>
      </div>
      <div className="bg-white/20 rounded p-2 text-center mb-2">
        <div className="text-xs mb-1">Kode Voucher</div>
        <div className="text-xl font-bold font-mono">{voucher.code}</div>
      </div>
      <div className="text-xs text-center opacity-90 space-y-1">
        <div>
          {voucher.profile} • {voucher.validity || "24 hours"}
        </div>
        {showPrice && voucher.sellingPrice && (
          <div className="text-sm font-bold bg-white/20 rounded px-2 py-1 inline-block">
            {formatPrice(voucher.sellingPrice)}
          </div>
        )}
      </div>
    </div>
  )

  const renderMinimalTemplate = () => (
    <div className="w-60 h-28 bg-white border border-gray-400 p-2 text-center">
      <div className="text-sm font-bold text-gray-800 mb-1">{companyInfo?.name || "WiFi"}</div>
      <div className="text-xs text-gray-600 mb-1">Kode:</div>
      <div className="text-lg font-bold font-mono bg-gray-50 border px-2 py-1 mb-1">{voucher.code}</div>
      {showPrice && voucher.sellingPrice && (
        <div className="text-sm font-bold text-gray-800">{formatPrice(voucher.sellingPrice)}</div>
      )}
    </div>
  )

  const renderReceiptTemplate = () => (
    <div className="w-56 bg-white border border-gray-300 p-3 font-mono text-xs">
      <div className="text-center border-b border-dashed border-gray-300 pb-2 mb-2">
        <div className="font-bold">{companyInfo?.name || "WIFI VOUCHER"}</div>
        {companyInfo?.address && <div className="text-gray-600">{companyInfo.address}</div>}
        {companyInfo?.phone && <div className="text-gray-600">{companyInfo.phone}</div>}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Profile:</span>
          <span>{voucher.profile}</span>
        </div>
        <div className="flex justify-between">
          <span>Valid:</span>
          <span>{voucher.validity || "24h"}</span>
        </div>
        {showPrice && voucher.sellingPrice && (
          <div className="flex justify-between font-bold">
            <span>Harga:</span>
            <span>{formatPrice(voucher.sellingPrice)}</span>
          </div>
        )}
        <div className="border-t border-dashed border-gray-300 pt-2 mt-2">
          <div className="text-center">
            <div className="text-gray-600">Kode Voucher:</div>
            <div className="text-lg font-bold">{voucher.code}</div>
          </div>
        </div>
      </div>

      {showInstructions && voucher.instructions && (
        <div className="border-t border-dashed border-gray-300 pt-2 mt-2 text-gray-600">
          <div className="text-xs">{voucher.instructions}</div>
        </div>
      )}
    </div>
  )

  const templates = {
    simple: renderSimpleTemplate,
    card: renderCardTemplate,
    minimal: renderMinimalTemplate,
    receipt: renderReceiptTemplate,
  }

  return <div className="flex justify-center p-4">{templates[template]()}</div>
}
