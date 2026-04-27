export default function Toast({ type = "success", message }) {
  const styles = {
    success: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div className={`fixed bottom-4 right-4 p-4 border rounded-md shadow-lg ${styles[type]}`}>
      {message}
    </div>
  );
}
