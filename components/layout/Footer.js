export default function Footer() {
  return (
    <footer className="bg-brown text-cream p-6 text-center mt-auto">
      <p className="text-lg font-bold text-gold">Tap N' Brew</p>
      <p className="text-sm">123 Coffee Street, Metro Manila</p>
      <p className="text-sm mt-2">&copy; {new Date().getFullYear()} Tap N' Brew. All rights reserved.</p>
    </footer>
  );
}
