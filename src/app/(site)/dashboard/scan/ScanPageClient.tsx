"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import QRScannerView from '@/components/views/storage/QRScannerView';
import DocumentDetailView from '@/components/views/documents/DocumentDetailView';
import FolderDetailView from '@/components/views/storage/FolderDetailView';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function ScanPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code');

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [type, setType] = useState<'document' | 'folder' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (codeParam) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await api.get(`/search/qr?code=${codeParam}`);
          if (res.data?.type === 'folder') {
            setType('folder');
            setData(res.data.data);
          } else if (res.data?.type === 'document') {
            setType('document');
            setData(res.data.data);
          } else {
            setError('ບໍ່ພົບຂໍ້ມູນຈາກລະຫັດນີ້');
          }
        } catch (err: any) {
          setError(err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການຄົ້ນຫາ');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      setData(null);
      setType(null);
    }
  }, [codeParam]);

  if (!codeParam) {
    return <QRScannerView />;
  }

  const handleBack = () => {
    setData(null);
    setType(null);
    setError(null);
    router.replace('/dashboard/scan');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#185C4D]" />
        <p className="text-slate-500 font-bold">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="bg-rose-50 text-rose-500 px-6 py-4 rounded-2xl border border-rose-100 text-center shadow-sm">
          <p className="font-bold text-lg mb-1">ຂໍອະໄພ</p>
          <p>{error}</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-bold shadow-sm cursor-pointer"
          >
            ກັບຄືນ
          </button>
        </div>
      </div>
    );
  }

  if (type === 'folder' && data) {
    return <FolderDetailView folder={data} onBack={handleBack} />;
  }

  if (type === 'document' && data) {
    return <DocumentDetailView document={data} onBack={handleBack} />;
  }

  return null;
}
