import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface FolderTagPrintProps {
  logoUrl?: string;
  companyName?: string;
  departmentName: string;
  folderName: string;
  qrData: string;
  code: string;
  locationRef: string;
}

export default function FolderTagPrint({
  logoUrl = '/images/logo/logo.png',
  companyName = 'Electricite Du Laos',
  departmentName,
  folderName,
  qrData,
  code,
  locationRef,
}: FolderTagPrintProps) {
  const [qrUrl, setQrUrl] = React.useState<string>('');

  React.useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || '';
    setQrUrl(`${baseUrl}/dashboard/scan?code=${encodeURIComponent(qrData)}`);
  }, [qrData]);

  return (
    <div
      className="folder-tag-print-container bg-white text-black"
      style={{
        width: '5.5cm',
        height: '19cm',
        border: '1px solid black',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        margin: '0 0 0 auto', // Align to right
        overflow: 'hidden',
      }}
    >
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .folder-tag-print-container {
            page-break-after: always;
            box-shadow: none !important;
            margin: 0 0 0 auto !important; /* Align to right */
          }
        }
      `}</style>
      
      {/* 1. Logo & Company Name Section */}
      <div
        style={{
          borderBottom: '1px solid black',
          padding: '12px 4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={logoUrl}
          alt="Logo"
          style={{
            width: '2.8cm',
            height: '2.5cm',
            objectFit: 'contain',
            marginBottom: '8px',
          }}
        />
        <div
          style={{
            fontFamily: '"Times New Roman", Times, serif',
            fontWeight: 'bold',
            fontSize: '18px',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          {companyName}
        </div>
      </div>

      {/* 2. Department Section */}
      <div
        style={{
          borderBottom: '1px solid black',
          padding: '12px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: '"Noto Sans Lao", sans-serif',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {departmentName}
        </div>
      </div>

      {/* 3. Folder Name Section */}
      <div
        style={{
          borderBottom: '1px solid black',
          padding: '12px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1, // Takes remaining space
        }}
      >
        <div
          style={{
            fontFamily: '"Noto Sans Lao", sans-serif',
            fontWeight: 'bold',
            fontSize: folderName.length > 60 ? '14px' : folderName.length > 40 ? '16px' : folderName.length > 25 ? '19px' : '22px',
            textAlign: 'center',
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          {folderName}
        </div>
      </div>

      {/* 4. QR Code Section */}
      <div
        style={{
          borderBottom: '1px solid black',
          padding: '12px 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <QRCodeSVG
          value={qrUrl}
          style={{ width: '4.4cm', height: '4.4cm' }}
          level="M"
        />
      </div>

      {/* 5. Folder Code Section */}
      <div
        style={{
          padding: '14px 6px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '2.5cm',
          gap: '4px',
        }}
      >
        <div
          style={{
            fontFamily: '"Times New Roman", Times, serif',
            fontWeight: 'bold',
            fontSize: '16px',
            textAlign: 'center',
            wordBreak: 'break-all',
            letterSpacing: '0.5px',
          }}
        >
          {locationRef}
        </div>
        <div
          style={{
            fontFamily: '"Times New Roman", Times, serif',
            fontWeight: 'bold',
            fontSize: '16px',
            textAlign: 'center',
            wordBreak: 'break-all',
            letterSpacing: '0.5px',
          }}
        >
          {code}
        </div>
      </div>
    </div>
  );
}
