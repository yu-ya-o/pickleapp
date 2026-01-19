import { Menu } from 'lucide-react';
import { useDrawer } from '@/components/layout/MainLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import type { BreadcrumbItem } from '@/components/Breadcrumb';

interface PageHeaderProps {
  title?: string;
  breadcrumbItems?: BreadcrumbItem[];
  rightElement?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbItems, rightElement }: PageHeaderProps) {
  const { openDrawer } = useDrawer();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
      }}
    >
      {/* Top row: Hamburger | PickleHub | Right element */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
        }}
        className="md:hidden"
      >
        <button
          onClick={openDrawer}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            marginLeft: '-8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="メニューを開く"
        >
          <Menu size={24} style={{ color: '#1a1a2e' }} />
        </button>
        <h1
          style={{
            fontSize: '20px',
            fontWeight: 900,
            fontStyle: 'italic',
            color: '#1a1a2e',
          }}
        >
          PickleHub
        </h1>
        <div style={{ width: '40px', display: 'flex', justifyContent: 'flex-end' }}>
          {rightElement}
        </div>
      </div>

      {/* Breadcrumb row */}
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <div style={{ padding: '8px 16px' }}>
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}

      {/* Title row (optional) */}
      {title && (
        <div style={{ padding: '0 16px 12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e' }}>{title}</h2>
        </div>
      )}
    </header>
  );
}
