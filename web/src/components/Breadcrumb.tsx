import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: '#888888',
        flexWrap: 'wrap'
      }}
    >
      {/* Home icon */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          color: '#65A30D',
          textDecoration: 'none'
        }}
      >
        <Home size={16} />
      </Link>

      {items.map((item, index) => (
        <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChevronRight size={14} style={{ color: '#CCCCCC' }} />
          {item.href ? (
            <Link
              to={item.href}
              style={{
                color: '#65A30D',
                textDecoration: 'none'
              }}
            >
              {item.label}
            </Link>
          ) : (
            <span style={{ color: '#1a1a2e', fontWeight: 500 }}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
