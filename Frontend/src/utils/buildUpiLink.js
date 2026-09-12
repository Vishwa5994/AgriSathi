/**
 * Generates an official UPI payment link according to standard UPI URL specification.
 * Format: upi://pay?pa={upi_id}&pn={farmer_name}&am={amount}&cu=INR&tn=Order-{order_id}
 */
export const buildUpiLink = ({ upi_id, farmer_name, amount, order_id }) => {
  const cleanUpiId = (upi_id || 'farmer@upi').trim();
  const cleanName = encodeURIComponent(farmer_name || 'Farmer Produce');
  const cleanAmount = (amount || 0).toString();
  const note = encodeURIComponent(`Order-${order_id || 'PAY'}`);

  return `upi://pay?pa=${cleanUpiId}&pn=${cleanName}&am=${cleanAmount}&cu=INR&tn=${note}`;
};
