import { VoucherTemplate } from "@/types/generate-voucher";

export const VOUCHER_TEMPLATES: VoucherTemplate[] = [
	{
		id: "classic",
		name: "Classic",
		description: "Template klasik dengan border hitam dan layout sederhana",
		columns: 4,
		cardStyle: "classic",
	},
	{
		id: "modern",
		name: "Modern",
		description: "Template modern dengan gradien dan shadow",
		columns: 3,
		cardStyle: "modern",
	},
	{
		id: "compact",
		name: "Compact",
		description: "Template kompak untuk menghemat kertas",
		columns: 6,
		cardStyle: "compact",
	},
	{
		id: "elegant",
		name: "Elegant",
		description: "Template elegan dengan typography yang indah",
		columns: 2,
		cardStyle: "elegant",
	},
	{
		id: "colorful",
		name: "Colorful",
		description: "Template warna-warni untuk menarik perhatian",
		columns: 3,
		cardStyle: "colorful",
	},
];

export const getTemplateById = (id: string): VoucherTemplate | undefined => {
	return VOUCHER_TEMPLATES.find((template) => template.id === id);
};
