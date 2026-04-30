import './globals.css';

export const metadata = {
  title: 'Bolei — Fantasy Futebol',
  description: 'Fantasy futebol com snake draft, leilões e trades.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
