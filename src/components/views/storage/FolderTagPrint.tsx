import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface FolderTagPrintData {
  id?: string | number;
  departmentName: string;
  folderName: string;
  qrData: string;
  code: string;
  locationRef: string;
}

interface FolderTagPrintProps {
  items?: FolderTagPrintData[];
  // Single tag fallback props for backward compatibility
  logoUrl?: string;
  companyName?: string;
  departmentName?: string;
  folderName?: string;
  qrData?: string;
  code?: string;
  locationRef?: string;
}

export default function FolderTagPrint({
  items,
  logoUrl = '/images/logo/logo.png',
  companyName = 'Electricite Du Laos',
  departmentName = '',
  folderName = '',
  qrData = '',
  code = '',
  locationRef = '',
}: FolderTagPrintProps) {
  const [baseUrl, setBaseUrl] = React.useState<string>('');

  React.useEffect(() => {
    setBaseUrl(typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || '');
  }, []);

  // Format data into list of tag objects
  const tagList: FolderTagPrintData[] = React.useMemo(() => {
    if (items && items.length > 0) {
      return items;
    }
    if (folderName || code || qrData) {
      return [
        {
          departmentName: departmentName || 'ຝ່າຍບັນຊີ',
          folderName,
          qrData,
          code,
          locationRef,
        },
      ];
    }
    return [];
  }, [items, departmentName, folderName, qrData, code, locationRef]);

  // Chunk tags into pages of 4 tags each
  const pages = React.useMemo(() => {
    const chunkSize = 4;
    const result: FolderTagPrintData[][] = [];
    for (let i = 0; i < tagList.length; i += chunkSize) {
      result.push(tagList.slice(i, i + chunkSize));
    }
    return result;
  }, [tagList]);

  if (tagList.length === 0) {
    return null;
  }

  return (
    <div className="folder-tag-print-wrapper bg-slate-100 print:bg-white print:p-0 p-4">
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .folder-tag-print-wrapper {
            padding: 0 !important;
            background: white !important;
          }
          .a4-print-page {
            width: 297mm !important;
            height: 210mm !important;
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            margin: 0 !important;
            border: none !important;
            padding: 6mm 8mm !important;
            box-sizing: border-box !important;
          }
          .a4-print-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>

      {pages.map((pageItems, pageIdx) => (
        <div
          key={pageIdx}
          className="a4-print-page bg-white shadow-lg print:shadow-none mx-auto mb-8 print:mb-0 flex flex-row items-center justify-center gap-[6mm] p-[6mm] box-sizing-border relative border border-slate-300 print:border-none"
          style={{
            width: '29.7cm',
            height: '21.0cm',
            boxSizing: 'border-box',
          }}
        >
          {pageItems.map((item, itemIdx) => {
            const qrUrl = item.qrData
              ? `${baseUrl}/dashboard/scan?code=${encodeURIComponent(item.qrData)}`
              : baseUrl;

            return (
              <div
                key={itemIdx}
                className="folder-tag-card relative bg-white text-black flex flex-col box-sizing-border overflow-hidden"
                style={{
                  width: '5.5cm',
                  height: '19cm',
                  border: '1.5px solid black',
                  boxSizing: 'border-box',
                }}
              >
                {/* Visual Cut Indicator Line on right side if not last tag on page */}
                {itemIdx < pageItems.length - 1 && (
                  <div
                    className="absolute -right-[3.5mm] top-0 bottom-0 border-r border-dashed border-slate-400 print:border-slate-400 z-10 pointer-events-none"
                    style={{ height: '100%' }}
                  />
                )}

                {/* 1. Logo & Company Name Section */}
                <div
                  style={{
                    borderBottom: '1.5px solid black',
                    padding: '10px 4px',
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
                      height: '2.4cm',
                      objectFit: 'contain',
                      marginBottom: '6px',
                    }}
                  />
                  <div
                    style={{
                      fontFamily: '"Times New Roman", Times, serif',
                      fontWeight: 'bold',
                      fontSize: '17px',
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
                    borderBottom: '1.5px solid black',
                    padding: '10px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-noto-sans-lao), "Phetsarath OT", sans-serif',
                      textAlign: 'center',
                      fontSize: '15px',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.departmentName || 'ຝ່າຍບັນຊີ'}
                  </div>
                </div>

                {/* 3. Folder Name Section */}
                <div
                  style={{
                    borderBottom: '1.5px solid black',
                    padding: '10px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1, // Takes remaining space
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-noto-sans-lao), "Phetsarath OT", sans-serif',
                      fontWeight: 'bold',
                      fontSize:
                        item.folderName.length > 60
                          ? '13px'
                          : item.folderName.length > 40
                            ? '15px'
                            : item.folderName.length > 25
                              ? '18px'
                              : '21px',
                      textAlign: 'center',
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.folderName}
                  </div>
                </div>

                {/* 4. QR Code Section */}
                <div
                  style={{
                    borderBottom: '1.5px solid black',
                    padding: '10px 0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <QRCodeSVG
                    value={qrUrl}
                    style={{ width: '4.5cm', height: '4.5cm' }}
                    level="M"
                  />
                </div>

                {/* 5. Folder Code Section */}
                <div
                  style={{
                    padding: '12px 6px',
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
                      fontSize:
                        item.locationRef.length > 20
                          ? '12px'
                          : item.locationRef.length > 15
                            ? '14px'
                            : item.locationRef.length > 10
                              ? '17px'
                              : '19px',
                      textAlign: 'center',
                      wordBreak: 'break-all',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {item.locationRef}
                  </div>
                  <div
                    style={{
                      fontFamily: '"Times New Roman", Times, serif',
                      fontWeight: 'bold',
                      fontSize: '19px',
                      textAlign: 'center',
                      wordBreak: 'break-all',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {item.code}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
