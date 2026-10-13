// Shows the product photo when `image` is set, otherwise an illustrated placeholder.
const GLYPHS = {
  journal: (a, b) => (<>
    <rect x="22" y="12" width="56" height="76" rx="4" fill={a} /><rect x="22" y="12" width="9" height="76" fill="#000" opacity=".18" />
    <rect x="40" y="34" width="28" height="3" rx="1.5" fill={b} /><rect x="44" y="41" width="20" height="2" rx="1" fill={b} opacity=".7" />
    <circle cx="54" cy="62" r="7" fill="none" stroke={b} strokeWidth="2" /><rect x="68" y="12" width="4" height="22" fill={b} />
  </>),
  candle: (a, b) => (<>
    <path d="M50 14c5 6 4 11 0 14-4-3-5-8 0-14z" fill={b} /><rect x="49" y="27" width="2" height="7" fill="#333" />
    <rect x="26" y="34" width="48" height="54" rx="8" fill="#a6602a" opacity=".9" /><rect x="26" y="34" width="48" height="10" rx="5" fill={a} />
    <rect x="34" y="56" width="32" height="16" rx="2" fill={a} />
  </>),
  mug: (a, b) => (<>
    <path d="M24 30h44v46a10 10 0 01-10 10H34a10 10 0 01-10-10z" fill={a} /><path d="M68 40h6a10 10 0 010 20h-6" fill="none" stroke={a} strokeWidth="6" />
    <rect x="24" y="30" width="44" height="6" fill={b} opacity=".7" />
    <path d="M38 20c-3 4 3 5 0 9M48 18c-3 4 3 5 0 9" stroke={a} strokeWidth="2" fill="none" opacity=".6" />
  </>),
  tee: (a, b) => (<>
    <path d="M36 16l-20 12 8 14 8-4v48h36V38l8 4 8-14-20-12c-2 6-7 9-14 9s-12-3-14-9z" fill={a} />
    <circle cx="50" cy="52" r="8" fill="none" stroke={b} strokeWidth="2.5" /><path d="M50 46c2 2 2 5 0 10-2-5-2-8 0-10z" fill={b} />
  </>),
  hoodie: (a, b) => (<>
    <path d="M38 18c0-6 24-6 24 0l18 10 6 56H70V40v46H30V40v44H14l6-56z" fill={a} />
    <path d="M40 18c2 10 18 10 20 0" fill="none" stroke="#000" strokeOpacity=".2" strokeWidth="3" />
    <rect x="38" y="62" width="24" height="14" rx="3" fill="#000" opacity=".15" /><path d="M46 28v12M54 28v12" stroke={b} strokeWidth="2" />
  </>),
  bottle: (a, b) => (<>
    <rect x="44" y="10" width="12" height="14" rx="2" fill="#2a2a2a" /><rect x="40" y="22" width="20" height="6" fill="#2a2a2a" />
    <path d="M36 30h28v52a6 6 0 01-6 6H42a6 6 0 01-6-6z" fill={a} /><rect x="40" y="46" width="20" height="26" rx="2" fill={b} />
    <rect x="44" y="54" width="12" height="2" fill={a} /><rect x="44" y="60" width="8" height="2" fill={a} />
  </>),
  tea: (a, b) => (<>
    <path d="M30 22h40l4 66H26z" fill={a} /><path d="M30 22l6-8h28l6 8z" fill="#000" opacity=".2" />
    <circle cx="50" cy="54" r="12" fill={b} /><path d="M50 46c4 4 4 9 0 16-4-7-4-12 0-16z" fill={a} />
  </>),
  cards: (a, b) => (<>
    <rect x="20" y="26" width="40" height="58" rx="4" fill={a} transform="rotate(-10 40 55)" opacity=".7" />
    <rect x="34" y="18" width="40" height="58" rx="4" fill={a} /><rect x="38" y="22" width="32" height="50" rx="2" fill="none" stroke={b} strokeWidth="1.5" />
    <circle cx="54" cy="47" r="9" fill={b} />
  </>),
  tote: (a, b) => (<>
    <path d="M38 38V24a12 12 0 0124 0v14" fill="none" stroke={b} strokeWidth="3" /><rect x="22" y="36" width="56" height="52" rx="2" fill={a} />
    <text x="50" y="66" textAnchor="middle" fontFamily="Gloock, Georgia, serif" fontSize="9" fill={b}>carry light</text>
  </>),
  box: (a, b) => (<>
    <rect x="18" y="40" width="64" height="46" rx="3" fill={a} /><rect x="14" y="32" width="72" height="12" rx="2" fill={a} />
    <rect x="46" y="32" width="8" height="54" fill={b} /><path d="M50 32c-10-14-22-6-12 0zM50 32c10-14 22-6 12 0z" fill={b} />
  </>),
  cushion: (a, b) => (<>
    <ellipse cx="50" cy="60" rx="38" ry="22" fill={a} /><ellipse cx="50" cy="52" rx="38" ry="18" fill={a} />
    <ellipse cx="50" cy="52" rx="30" ry="12" fill="none" stroke={b} strokeWidth="2" strokeDasharray="4 4" />
    <circle cx="50" cy="52" r="4" fill={b} /><path d="M14 56q36 14 72 0" stroke={b} strokeWidth="1.5" fill="none" opacity=".6" />
  </>),
};

export default function ProductArt({ product }) {
  if (product.image) {
    return <img className="photo" src={product.image} alt={product.name} loading="lazy" />;
  }
  return (
    <svg className="prod" viewBox="0 0 100 100" aria-hidden="true">
      {GLYPHS[product.glyph](product.c1, product.c2)}
    </svg>
  );
}
