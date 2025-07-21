import { getWhatsAppConfig } from "@/lib/db/system";

export interface WhatsAppMessage {
	to: string;
	message: string;
	type?: "text" | "image" | "document";
}

export interface WhatsAppResponse {
	success: boolean;
	messageId?: string;
	error?: string;
}

export class WhatsAppAPI {
	private apiUrl: string | null = null;
	private token: string | null = null;
	private enabled = false;

	constructor() {
		this.initialize();
	}

	private async initialize() {
		const config = await getWhatsAppConfig();
		if (config) {
			this.apiUrl = config.apiUrl;
			this.token = config.token;
			this.enabled = config.enabled || false;
		}
	}

	async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
		try {
			if (!this.enabled) {
				return { success: false, error: "WhatsApp integration is disabled" };
			}

			if (!this.apiUrl || !this.token) {
				return {
					success: false,
					error: "WhatsApp configuration is incomplete",
				};
			}

			const response = await fetch(`${this.apiUrl}/send-message`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					to: message.to,
					message: message.message,
					type: message.type || "text",
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				return {
					success: false,
					error: errorData.message || `HTTP ${response.status}`,
				};
			}

			const data = await response.json();
			return {
				success: true,
				messageId: data.messageId,
			};
		} catch (error) {
			console.error("WhatsApp send message error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	async sendBulkMessages(
		messages: WhatsAppMessage[]
	): Promise<WhatsAppResponse[]> {
		const results: WhatsAppResponse[] = [];

		for (const message of messages) {
			const result = await this.sendMessage(message);
			results.push(result);

			// Add delay between messages to avoid rate limiting
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		return results;
	}

	async getStatus(): Promise<{ connected: boolean; error?: string }> {
		try {
			if (!this.enabled) {
				return { connected: false, error: "WhatsApp integration is disabled" };
			}

			if (!this.apiUrl || !this.token) {
				return {
					connected: false,
					error: "WhatsApp configuration is incomplete",
				};
			}

			const response = await fetch(`${this.apiUrl}/status`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${this.token}`,
					"Content-Type": "application/json",
				},
				signal: AbortSignal.timeout(10000),
			});

			if (response.ok) {
				return { connected: true };
			} else {
				return { connected: false, error: `HTTP ${response.status}` };
			}
		} catch (error) {
			console.error("WhatsApp status check error:", error);
			return {
				connected: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	async sendVoucherNotification(
		phoneNumber: string,
		voucher: {
			username: string;
			password: string;
			profile: string;
			validUntil?: string;
		}
	): Promise<WhatsAppResponse> {
		const message = `
🎫 *Voucher Internet Anda*

👤 Username: ${voucher.username}
🔐 Password: ${voucher.password}
📊 Paket: ${voucher.profile}
${voucher.validUntil ? `⏰ Berlaku sampai: ${voucher.validUntil}` : ""}

Terima kasih telah menggunakan layanan kami!
    `.trim();

		return await this.sendMessage({
			to: phoneNumber,
			message,
			type: "text",
		});
	}

	async sendPaymentReminder(
		phoneNumber: string,
		user: {
			name: string;
			amount: number;
			dueDate: string;
		}
	): Promise<WhatsAppResponse> {
		const message = `
💰 *Pengingat Pembayaran*

Halo ${user.name},

Tagihan Anda sebesar Rp ${user.amount.toLocaleString(
			"id-ID"
		)} akan jatuh tempo pada ${user.dueDate}.

Mohon segera lakukan pembayaran untuk menghindari pemutusan layanan.

Terima kasih!
    `.trim();

		return await this.sendMessage({
			to: phoneNumber,
			message,
			type: "text",
		});
	}
}

// Singleton instance
let whatsappInstance: WhatsAppAPI | null = null;

export function getWhatsAppInstance(): WhatsAppAPI {
	if (!whatsappInstance) {
		whatsappInstance = new WhatsAppAPI();
	}
	return whatsappInstance;
}

export async function sendWhatsAppMessage(
	message: WhatsAppMessage
): Promise<WhatsAppResponse> {
	const whatsapp = getWhatsAppInstance();
	return await whatsapp.sendMessage(message);
}

export async function checkWhatsAppStatus(): Promise<{
	connected: boolean;
	error?: string;
}> {
	const whatsapp = getWhatsAppInstance();
	return await whatsapp.getStatus();
}
