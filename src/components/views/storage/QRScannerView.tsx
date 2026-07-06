"use client";
import React, { useState } from 'react';
import { Button } from 'antd';
import { QrCode, Camera, FileText, ArrowRight } from 'lucide-react';

export default function QRScannerView() {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 items-center justify-center min-h-[70vh]">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">Scan QR Code</h1>
        <p className="text-[#737373] text-sm mt-1">Point your camera at a Kono or Document QR code to open details.</p>
      </div>

      {/* Level 1 Glass - Scanner Container */}
      <div className="w-full bg-white/40 backdrop-blur-2xl border border-white/60 p-8 rounded-[32px] shadow-[0_8px_32px_rgba(31,38,135,0.04)] flex flex-col items-center">
        
        {/* Scanner Window */}
        <div className="relative w-full max-w-sm aspect-square bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-inner mb-8 flex items-center justify-center">
          {isScanning ? (
            <div className="absolute inset-0 border-4 border-[#185C4D]/50 rounded-3xl animate-pulse">
              <div className="w-full h-1 bg-[#185C4D] shadow-[0_0_15px_#185C4D] animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          ) : (
            <div className="text-white/40 flex flex-col items-center gap-3">
              <Camera size={48} />
              <p className="font-medium">Camera is inactive</p>
            </div>
          )}
        </div>

        <Button 
          type="primary" 
          size="large"
          className="w-full max-w-sm h-14 text-base font-bold tracking-wide rounded-xl shadow-[0_4px_20px_rgba(24,92,77,0.35)] hover:shadow-[0_6px_28px_rgba(24,92,77,0.5)] transition-all"
          onClick={() => setIsScanning(!isScanning)}
          icon={isScanning ? <FileText size={20} /> : <QrCode size={20} />}
        >
          {isScanning ? 'Stop Scanning' : 'Start Scanning'}
        </Button>
      </div>

      {/* Manual Entry - Level 1 Glass */}
      <div className="w-full max-w-sm bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[24px] shadow-sm flex flex-col items-center gap-3 mt-4">
        <p className="text-sm font-medium text-[#737373]">Or enter Voucher / Kono ID manually</p>
        <div className="flex w-full gap-2">
          <input 
            type="text" 
            placeholder="e.g. KONO-2024-001" 
            className="flex-1 bg-white/60 border border-white/80 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#185C4D]/50 transition-all text-[#1C1C1E] font-medium"
          />
          <Button type="primary" className="h-full rounded-xl aspect-square p-0 flex items-center justify-center shadow-sm">
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
