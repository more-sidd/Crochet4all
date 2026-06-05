export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <span>© {new Date().getFullYear()} crochet4all · by <a href="https://instagram.com/mochiguk" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>@mochiguk</a> · built with Claude</span>
        <span style={{ color: 'var(--border-strong)' }}>a cozy crochet commons</span>
      </div>
    </footer>
  );
}