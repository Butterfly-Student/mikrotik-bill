import { fetchPrint } from "./services/voucher-print/print";

const printVouchers = async () => {
  const vouchers = await fetchPrint
  console.log(vouchers);
}

printVouchers()