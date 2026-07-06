import { Button } from 'antd';
import { Printer } from 'lucide-react';

interface PrintQRButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function PrintQRButton({ onClick, disabled }: PrintQRButtonProps) {
  return (
    <Button
      type="primary"
      icon={<Printer size={16} />}
      onClick={onClick}
      disabled={disabled}
      className="bg-[#185C4D] hover:bg-[#14483C]"
    >
      Print QR Code
    </Button>
  );
}
