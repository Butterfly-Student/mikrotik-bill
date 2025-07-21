// types/system-config.ts or lib/types.ts

export interface SystemConfig {
  id?: number | null | undefined;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  currency?: string;
  timezone?: string;
  mikrotik_host?: string;
  mikrotik_username?: string;
  mikrotik_password?: string;
  mikrotik_port?: number;
  mikrotik_ssl?: boolean;
  mikrotik_timeout?: number; // Ubah tipe menjadi number
  setup_completed?: boolean;
  [key: string]: any; // Tambahkan properti fleksibel
}; 

export interface SystemConfigResponse {
	success: boolean;
	data: SystemConfig | null;
	setupRequired?: boolean;
	message?: string;
	error?: string;
	mikrotikConnected?: boolean;
}
