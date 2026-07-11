"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { QrCode, Camera, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import api from '@/lib/api';
import { toast } from 'sonner';
import DocumentDetailModal from '@/components/views/documents/DocumentDetailModal';
import FolderDetailModal from '@/components/views/storage/FolderDetailModal';
import { Document, Folder } from '@/types/prisma-mapped';

export default function QRScannerView() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  
  const [scannedDocument, setScannedDocument] = useState<Document | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  const [scannedFolder, setScannedFolder] = useState<any | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5Qrcode("qr-reader");
      
      scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().then(() => {
              setIsScanning(false);
              handleCodeSubmit(decodedText);
            }).catch(err => console.error(err));
          }
        },
        (errorMessage) => {
          // ignore scan errors (they happen every frame that no QR is found)
        }
      ).catch(err => {
        toast.error("ບໍ່ສາມາດເປີດກ້ອງໄດ້: " + err);
        setIsScanning(false);
      });
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  const handleCodeSubmit = async (code: string) => {
    if (!code) {
      toast.error('ກະລຸນາປ້ອນລະຫັດ QR');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await api.get(`/search/qr?code=${code}`);
      
      if (res.data?.type === 'folder') {
        toast.success('ພົບຂໍ້ມູນແຟ້ມເອກະສານ');
        setScannedFolder(res.data.data);
        setIsFolderModalOpen(true);
      } else if (res.data?.type === 'document') {
        toast.success('ພົບຂໍ້ມູນເອກະສານ');
        setScannedDocument(res.data.data as Document);
        setIsDocumentModalOpen(true);
      } else {
        toast.error('ບໍ່ພົບຂໍ້ມູນຈາກລະຫັດນີ້');
      }
    } catch (err: any) {
      // api interceptor will handle error toast
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 items-center justify-center min-h-[70vh]">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">ສະແກນ QR Code</h1>
        <p className="text-[#737373] text-sm mt-1">ສະແກນ QR ຂອງເອກະສານ ຫຼື ແຟ້ມເອກະສານ ເພື່ອເບິ່ງລາຍລະອຽດ.</p>
      </div>

      {/* Level 1 Glass - Scanner Container */}
      <div className="w-full bg-white/40 backdrop-blur-2xl border border-white/60 p-8 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col items-center">
        
        {/* Scanner Window */}
        <div className="relative w-full max-w-sm aspect-square bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-inner mb-8 flex items-center justify-center">
          
          <div id="qr-reader" className="w-full h-full object-cover" style={{ display: isScanning ? 'block' : 'none' }}></div>
          
          {isScanning ? (
            <div className="absolute inset-0 border-4 border-[#185C4D]/50 rounded-3xl animate-pulse pointer-events-none">
              <div className="w-full h-1 bg-[#185C4D] shadow-[0_0_15px_#185C4D] animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-3 pointer-events-none z-10">
              <Camera size={48} />
              <p className="font-medium">ກ້ອງປິດຢູ່</p>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-3 z-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#185C4D]" />
              <p className="font-bold text-sm">ກຳລັງຄົ້ນຫາຂໍ້ມູນ...</p>
            </div>
          )}
        </div>

        <Button 
          type="primary" 
          size="large"
          className="w-full max-w-sm h-14 text-base font-bold tracking-wide rounded-xl shadow-[0_4px_20px_rgba(24,92,77,0.35)] hover:shadow-[0_6px_28px_rgba(24,92,77,0.5)] transition-all"
          onClick={() => setIsScanning(!isScanning)}
          icon={isScanning ? <FileText size={20} /> : <QrCode size={20} />}
          disabled={isLoading}
        >
          {isScanning ? 'ຢຸດສະແກນ' : 'ເລີ່ມສະແກນ'}
        </Button>
      </div>

      {/* Manual Entry - Level 1 Glass */}
      <div className="w-full max-w-sm bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[24px] shadow-sm flex flex-col items-center gap-3 mt-4">
        <p className="text-sm font-medium text-[#737373]">ຫຼື ປ້ອນລະຫັດ QR ດ້ວຍຕົນເອງ</p>
        <div className="flex w-full gap-2">
          <input 
            type="text" 
            placeholder="ເຊັ່ນ: 008/001/001" 
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCodeSubmit(manualCode);
              }
            }}
            className="flex-1 bg-white/60 border border-white/80 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185C4D]/50 transition-all text-[#1C1C1E] font-medium"
            disabled={isLoading || isScanning}
          />
          <Button 
            type="primary" 
            className="h-full rounded-xl aspect-square p-0 flex items-center justify-center shadow-sm"
            onClick={() => handleCodeSubmit(manualCode)}
            disabled={isLoading || isScanning || !manualCode}
          >
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>

      <DocumentDetailModal 
        isOpen={isDocumentModalOpen}
        onClose={() => {
            setIsDocumentModalOpen(false);
            setScannedDocument(null);
        }}
        document={scannedDocument}
      />

      <FolderDetailModal 
        isOpen={isFolderModalOpen}
        onClose={() => {
            setIsFolderModalOpen(false);
            setScannedFolder(null);
        }}
        folder={scannedFolder}
      />
    </div>
  );
}
