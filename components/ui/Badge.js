export default function Badge({ text, status = "default" }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border bg-opacity-70",
    preparing: "bg-blue-100 text-blue-800 border bg-opacity-70",
    out_for_delivery: "bg-purple-100 text-purple-800 border bg-opacity-70",
    delivered: "bg-green-100 text-green-800 border bg-opacity-70",
    cancelled: "bg-red-100 text-red-800 border bg-opacity-70",
    ready_for_pickup: "bg-teal-100 text-teal-800 border bg-opacity-70",
    picked_up: "bg-green-100 text-green-800 border bg-opacity-70",
    default: "bg-gray-100 text-gray-800 border bg-opacity-70",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${styles[status] || styles.default}`}>
      {text}
    </span>
  );
}
