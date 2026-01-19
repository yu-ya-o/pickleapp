import { Menu } from 'lucide-react';
import { useDrawer } from '@/contexts/DrawerContext';

interface PageHeaderProps {
  rightElement?: React.ReactNode;
}

export function PageHeader({ rightElement }: PageHeaderProps) {
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
        }}
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
    </header>
  );
}
