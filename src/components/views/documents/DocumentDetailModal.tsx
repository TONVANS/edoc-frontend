"use client";
import React, { useState } from 'react';
import { Modal, Button, Divider } from 'antd';
import { Document } from '@/types/prisma-mapped';
import { useFolderStore } from '@/store/useFolderStore';
import { useDocumentTypeStore } from '@/store/useDocumentTypeStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useSubDocumentStore } from '@/store/useSubDocumentStore';
import { QRCodeSVG } from 'qrcode.react';
import {
  FileText,
  X,
  Calendar,
  Paperclip,
  FolderOpen,
  Scale,
  Download,
  Info,
  QrCode,
  Layers,
  ShieldAlert,
  ArrowDownToLine,
  MapPin,
  User,
  Briefcase,
  Eye,
  Loader2,
  FilePlus,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { DatePicker, Input, Form, message, Popconfirm } from 'antd';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export default function DocumentDetailModal({
  isOpen,
  onClose,
  document: doc,
}: DocumentDetailModalProps) {
  const { folders } = useFolderStore();
  const { documentTypes } = useDocumentTypeStore();
  const { downloadAttachment, viewAttachment } = useDocumentStore();
  const { subDocuments, isLoading: isSubDocsLoading, fetchSubDocuments, createSubDocument, deleteSubDocument } = useSubDocumentStore();
  const [messageApi, contextHolder] = message.useMessage();

  const [loadingViewId, setLoadingViewId] = useState<string | null>(null);
  const [loadingDownloadId, setLoadingDownloadId] = useState<string | null>(null);

  const [showAddSubDoc, setShowAddSubDoc] = useState(false);
  const [subDocForm] = Form.useForm();

  React.useEffect(() => {
    if (isOpen && doc?.id) {
      fetchSubDocuments(doc.id);
      setShowAddSubDoc(false);
    }
  }, [isOpen, doc?.id, fetchSubDocuments]);

  const handleView = async (id: string) => {
    setLoadingViewId(id);
    await viewAttachment(id);
    setLoadingViewId(null);
  };

  const handleDownload = async (id: string, fileName: string) => {
    setLoadingDownloadId(id);
    await downloadAttachment(id, fileName);
    setLoadingDownloadId(null);
  };

  const handleAddSubDoc = async (values: any) => {
    if (!doc?.id) return;
    const success = await createSubDocument(doc.id, [{
      subDocNo: values.subDocNo,
      subDocDate: values.subDocDate.format('YYYY-MM-DD'),
    }]);
    if (success) {
      messageApi.success('ເພີ່ມເອກະສານຍ່ອຍສຳເລັດແລ້ວ');
      subDocForm.resetFields();
      setShowAddSubDoc(false);
      fetchSubDocuments(doc.id);
    }
  };

  const handleDeleteSubDoc = async (subDocId: string) => {
    if (!doc?.id) return;
    const success = await deleteSubDocument(doc.id, subDocId);
    if (success) {
      messageApi.success('ລຶບເອກະສານຍ່ອຍສຳເລັດແລ້ວ');
      fetchSubDocuments(doc.id);
    }
  };

  if (!doc) return null;

  const docTypeName = doc.documentType?.name || documentTypes.find(t => t.id === doc.documentTypeId)?.name || 'ບໍ່ລະບຸ';
  const folderName = doc.folder?.name || folders.find(f => f.id === doc.folderId)?.name || folders.find(f => f.id === doc.folderId)?.code || 'ບໍ່ລະບຸ';

  const creatorName = doc.user ? `${doc.user.firstNameLa} ${doc.user.lastNameLa}` : 'ບໍ່ລະບຸ';
  const departmentName = doc.department?.name || 'ບໍ່ລະບຸ';
  const divisionName = doc.division?.name || 'ບໍ່ລະບຸ';

  const storageLocation = [
    doc.department?.name,
    doc.division?.name,
    doc.warehouse?.name,
    doc.locker?.name,
    doc.shelf?.name
  ].filter(Boolean).join(' > ') || 'ບໍ່ລະບຸສະຖານທີ່ຈັດເກັບ';

  const getRetentionLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { text: '10ປີ ສາມາດທຳລາຍໄດ້', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' };
      case 'DESTROYABLE':
        return { text: 'ສາມາດທຳລາຍໄດ້', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' };
      case 'DESTROYABLE_HOLD':
        return { text: '10ປີ ຫ້າມທຳລາຍ', color: 'text-rose-600 bg-rose-500/10 border-rose-500/20' };
      case 'EXPIRED':
        return { text: 'ໝົດອາຍຸ ເຖິງກຳນົດທຳລາຍ', color: 'text-rose-600 bg-rose-500/10 border-rose-500/20' };
      default:
        return { text: status, color: 'text-slate-600 bg-slate-500/10 border-slate-500/20' };
    }
  };

  const retention = getRetentionLabel(doc.retentionStatus);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={750}
      centered
      title={null}
      closable={false}
      className={cn(
        '[&_.ant-modal-content]:p-0',
        '[&_.ant-modal-content]:bg-transparent',
        '[&_.ant-modal-content]:shadow-none',
        '[&_.ant-modal-content]:rounded-[32px]'
      )}
      wrapClassName="backdrop-blur-md"
    >
      {contextHolder}
      <div className="bg-white/75 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.12)] border border-white/60 relative flex flex-col max-h-[90vh]">

        {/* ══ HEADER ══════════════════════════════════════════ */}
        <header className="relative px-10 pt-10 pb-14 overflow-hidden bg-linear-to-br from-[#185C4D] via-[#1c6958] to-[#257c66] shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px]" />

          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 z-20 active:scale-90 cursor-pointer"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl shadow-black/5">
              <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="inline-flex items-center font-mono font-bold text-[12px] text-emerald-200 bg-white/10 border border-white/15 px-3 py-1 rounded-lg shadow-sm mb-2">
                {doc.docNo}
              </span>
              <h2 className="text-white font-black text-2xl tracking-tight leading-tight truncate max-w-[450px]" title={doc.title}>
                {doc.title}
              </h2>
            </div>
          </div>
        </header>

        {/* ══ BODY ════════════════════════════════════════════ */}
        <main className="px-10 py-8 -mt-8 bg-white/85 backdrop-blur-2xl rounded-t-[32px] border-t border-white shadow-[0_-12px_40px_rgba(0,0,0,0.03)] relative z-10 overflow-y-auto flex-1">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Left Column: Metadata details (2 cols) */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="flex items-center gap-2 text-[#185C4D] font-bold text-[14px] mb-3 border-b border-slate-100 pb-1.5">
                  <Info size={15} /> ລາຍລະອຽດເອກະສານ
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ຊື່ຫຍໍ້ເອກະສານ</span>
                    <span className="text-slate-700 font-bold text-[14px]">{doc.shortName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ວັນທີເອກະສານ</span>
                    <span className="text-slate-700 font-bold text-[14px] flex items-center gap-1">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(doc.docDate).toLocaleDateString('lo-LA')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ຜູກພັນສັນຍາ (Contract Bound)</span>
                    <span className={cn("text-[14px] font-bold flex items-center gap-1 mt-0.5", doc.isContractBound ? "text-emerald-600" : "text-slate-500")}>
                      <Scale size={14} className={doc.isContractBound ? "text-emerald-600" : "text-slate-400"} />
                      {doc.isContractBound ? 'ແມ່ນ' : 'ບໍ່'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ວັນທີໝົດອາຍຸ</span>
                    <span className={cn("font-bold text-[14px] flex items-center gap-1 mt-0.5", doc.docExpire ? "text-rose-500" : "text-slate-700")}>
                      <Calendar size={14} className={doc.docExpire ? "text-rose-500" : "text-slate-400"} />
                      {doc.docExpire ? new Date(doc.docExpire).toLocaleDateString('lo-LA') : 'ບໍ່ມີວັນໝົດອາຍຸ'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ຄຳອະທິບາຍ/ລາຍລະອຽດ</span>
                    <p className="text-slate-600 font-medium text-[13.5px] mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100/50 leading-relaxed whitespace-pre-wrap">
                      {doc.description || 'ບໍ່ມີລາຍລະອຽດເພີ່ມເຕີມ'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-[#185C4D] font-bold text-[14px] mb-3 border-b border-slate-100 pb-1.5">
                  <FolderOpen size={15} /> ໝວດໝູ່ ແລະ ບ່ອນຈັດເກັບ
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ພາກສ່ວນ/ກົມ</span>
                    <span className="text-slate-700 font-bold text-[14px] flex items-center gap-1.5 mt-1">
                      <Briefcase size={14} className="text-[#185C4D]" /> {departmentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ພະແນກ</span>
                    <span className="text-slate-700 font-bold text-[14px] mt-1 block truncate">
                      {divisionName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ຜູ້ສ້າງເອກະສານ</span>
                    <span className="text-slate-700 font-bold text-[14px] flex items-center gap-1.5 mt-1">
                      <User size={14} className="text-[#185C4D]" /> {creatorName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ປະເພດເອກະສານ</span>
                    <span className="text-slate-700 font-bold text-[14px] flex items-center gap-1.5 mt-1">
                      <Layers size={14} className="text-[#185C4D]" /> {docTypeName}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ສະຖານທີ່ຈັດເກັບ (ສາງ/ຕູ້/ຊັ້ນ)</span>
                    <span className="text-slate-700 font-bold text-[14px] flex items-center gap-1.5 mt-1">
                      <MapPin size={14} className="text-[#185C4D]" /> {storageLocation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ແຟ້ມເອກະສານຈັດເກັບ</span>
                    <span className="text-slate-700 font-bold text-[14px] flex items-center gap-1.5 mt-1">
                      <FolderOpen size={14} className="text-[#185C4D]" /> {folderName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">ສະຖານະການເກັບຮັກສາ</span>
                    <span className={cn("inline-block font-bold text-[12px] px-2.5 py-0.5 rounded-full border mt-1.5", retention.color)}>
                      {retention.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: QR Code & Attachments (1 col) */}
            <div className="space-y-6">
              {/* QR Code Container */}
              <div className="bg-white/60 border border-white p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                <h4 className="text-[12px] font-bold text-slate-400 flex items-center gap-1 mb-3 uppercase">
                  <QrCode size={13} /> QR Code
                </h4>

                {/* Dynamically Generate QR Code containing the Document code or ID */}
                <div className="bg-white p-3.5 rounded-2xl shadow-soft border border-slate-100">
                  <QRCodeSVG
                    value={typeof window !== 'undefined' ? `${window.location.origin}/dashboard/scan?code=${encodeURIComponent(doc.qrCode || `EDOC-DOC-${doc.id}`)}` : `${process.env.NEXT_PUBLIC_BASE_URL || ''}/dashboard/scan?code=${encodeURIComponent(doc.qrCode || `EDOC-DOC-${doc.id}`)}`}
                    size={110}
                    bgColor="#ffffff"
                    fgColor="#185C4D"
                    level="Q"
                  />
                </div>
                <span className="text-[12px] font-bold font-mono text-slate-500 mt-3 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/30">
                  {doc.qrCode || `REF-${doc.docNo}`}
                </span>
              </div>

              {/* Sub-documents list */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-[13px] font-bold text-[#185C4D] flex items-center gap-1.5">
                    <Layers size={14} /> ເອກະສານຍ່ອຍ ({subDocuments?.length || 0})
                  </h4>
                  <button
                    onClick={() => {
                      if (showAddSubDoc) subDocForm.resetFields();
                      setShowAddSubDoc(!showAddSubDoc);
                    }}
                    className="p-1 rounded-md text-[#185C4D] hover:bg-[#185C4D]/10 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                  >
                    <FilePlus size={14} /> ເພີ່ມ
                  </button>
                </div>

                {showAddSubDoc && (
                  <div className="mb-3 bg-white/80 border border-emerald-100 p-3 rounded-xl shadow-sm">
                    <Form form={subDocForm} layout="vertical" onFinish={handleAddSubDoc}>
                      <Form.Item name="subDocNo" label={<span className="text-[11px] font-bold text-slate-500">ເລກທີເອກະສານຍ່ອຍ</span>} rules={[{ required: true }]} className="mb-2">
                        <Input size="small" placeholder="ເລກທີ" />
                      </Form.Item>
                      <Form.Item name="subDocDate" label={<span className="text-[11px] font-bold text-slate-500">ວັນທີ</span>} rules={[{ required: true }]} className="mb-2">
                        <DatePicker size="small" className="w-full" format="YYYY-MM-DD" />
                      </Form.Item>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button size="small" onClick={() => {
                          subDocForm.resetFields();
                          setShowAddSubDoc(false);
                        }}>ຍົກເລີກ</Button>
                        <Button size="small" type="primary" htmlType="submit" className="bg-[#185C4D]">ບັນທຶກ</Button>
                      </div>
                    </Form>
                  </div>
                )}

                {isSubDocsLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : subDocuments && subDocuments.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1 mb-4">
                    {subDocuments.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between bg-white/70 border border-slate-100 p-2.5 rounded-xl text-slate-600">
                        <div>
                          <div className="text-[12px] font-bold text-slate-700">{sub.subDocNo}</div>
                          <div className="text-[11px] text-slate-500">{new Date(sub.subDocDate).toLocaleDateString('lo-LA')}</div>
                        </div>
                        <Popconfirm
                          title="ຢືນຢັນການລຶບ"
                          onConfirm={() => handleDeleteSubDoc(sub.id)}
                          okText="ລຶບ"
                          cancelText="ຍົກເລີກ"
                        >
                          <button className="p-1.5 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </Popconfirm>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-[12px] font-semibold mb-4">
                    ບໍ່ມີເອກະສານຍ່ອຍ
                  </div>
                )}
              </div>

              {/* Attachments list */}
              <div>
                <h4 className="text-[13px] font-bold text-[#185C4D] flex items-center gap-1.5 mb-2.5">
                  <Paperclip size={14} /> ເອກະສານຄັດຕິດ ({doc.attachments?.length || 0})
                </h4>

                {doc.attachments && doc.attachments.length > 0 ? (
                  <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {doc.attachments.map(att => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between bg-white/70 hover:bg-white border border-slate-100 hover:border-[#185C4D]/30 p-2.5 rounded-xl shadow-xs transition-all text-slate-600 group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden min-w-0">
                          <FileText size={15} className="text-slate-400 group-hover:text-[#185C4D]" />
                          <span className="text-[12px] font-semibold truncate" title={att.fileName}>
                            {att.fileName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            onClick={() => handleView(att.id)}
                            disabled={loadingViewId === att.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="ເບິ່ງ"
                          >
                            {loadingViewId === att.id ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                          </button>
                          <button
                            onClick={() => handleDownload(att.id, att.fileName)}
                            disabled={loadingDownloadId === att.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#185C4D] hover:bg-[#185C4D]/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="ດາວໂຫຼດ"
                          >
                            {loadingDownloadId === att.id ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-[12px] font-semibold">
                    ບໍ່ມີໄຟລ໌ຄັດຕິດ
                  </div>
                )}
              </div>
            </div>
          </div>

          <Divider className="my-6 border-slate-100" />

          {/* Action controls */}
          <footer className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="primary"
              onClick={onClose}
              className="h-11 px-8 rounded-2xl bg-linear-to-r from-[#185C4D] to-[#206E5B] border-none font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              ປິດໜ້າຕ່າງ
            </Button>
          </footer>

        </main>
      </div>
    </Modal>
  );
}
