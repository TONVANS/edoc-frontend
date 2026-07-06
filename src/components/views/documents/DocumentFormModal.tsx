"use client";
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, DatePicker, Select, Switch, Upload, Tag } from 'antd';
import { Document, Folder, DocumentType } from '@/types/prisma-mapped';
import { useFolderStore } from '@/store/useFolderStore';
import { useDocumentTypeStore } from '@/store/useDocumentTypeStore';
import { useDepartmentStore } from '@/store/useDepartmentStore';
import dayjs from 'dayjs';
import { 
  FileText, 
  X, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Paperclip, 
  Tag as TagIcon, 
  FolderOpen, 
  Scale, 
  UploadCloud, 
  Info,
  Layers,
  Trash2,
  Download,
  Building2,
  GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any, newFiles: File[]) => void;
  isLoading: boolean;
  initialData?: Document | null;
  defaultFolderId?: string;
}

export default function DocumentFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
  defaultFolderId,
}: DocumentFormModalProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const { folders, fetchFolders } = useFolderStore();
  const { documentTypes, fetchDocumentTypes } = useDocumentTypeStore();

  useEffect(() => {
    if (folders.length === 0) fetchFolders({ limit: 100 });
    if (documentTypes.length === 0) fetchDocumentTypes({ limit: 100 });
  }, [folders.length, documentTypes.length, fetchFolders, fetchDocumentTypes]);

  useEffect(() => {
    if (isOpen) {
      setFileList([]);
      if (initialData) {
        form.setFieldsValue({
          docNo: initialData.docNo,
          shortName: initialData.shortName || undefined,
          docDate: initialData.docDate ? dayjs(initialData.docDate) : undefined,
          subDocNo: initialData.subDocNo || undefined,
          subDocDate: initialData.subDocDate ? dayjs(initialData.subDocDate) : undefined,
          title: initialData.title,
          description: initialData.description || undefined,
          docExpire: initialData.docExpire ? dayjs(initialData.docExpire) : undefined,
          qrCode: initialData.qrCode || undefined,
          folderId: initialData.folderId,
          documentTypeId: initialData.documentTypeId,
          departmentId: (initialData as any).departmentId,
          divisionId: (initialData as any).divisionId || undefined,
          isContractBound: initialData.isContractBound,
          retentionStatus: initialData.retentionStatus,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          isContractBound: false,
          retentionStatus: 'ACTIVE',
          docDate: dayjs(), // Default today
          ...(defaultFolderId ? { folderId: defaultFolderId } : {}),
        });
      }
    }
  }, [isOpen, initialData, form]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      docDate: values.docDate ? values.docDate.toISOString() : undefined,
      docExpire: values.docExpire ? values.docExpire.toISOString() : undefined,
      subDocDate: values.subDocDate ? values.subDocDate.toISOString() : undefined,
    };

    // Extract raw File objects from Ant Design Upload component list
    const newFiles = fileList.map(f => f.originFileObj || f).filter(Boolean);
    onSubmit(formattedValues, newFiles);
  };

  const uploadProps = {
    onRemove: (file: any) => {
      setFileList(prev => prev.filter(f => f.uid !== file.uid));
    },
    beforeUpload: (file: any) => {
      setFileList(prev => [...prev, file]);
      return false; // Stop auto upload
    },
    fileList,
    multiple: true,
  };

  const getAttachmentDownloadUrl = (attachmentId: string) => {
    const baseUrl = api.defaults.baseURL || 'http://localhost:3000/api';
    return `${baseUrl}/documents/attachments/${attachmentId}`;
  };

  const inputCls =
    'rounded-2xl bg-white/40 backdrop-blur-md border-white/60 shadow-sm transition-all duration-300 hover:bg-white/60 hover:border-[#185C4D]/50 focus:bg-white focus:border-[#185C4D] focus:shadow-[0_0_0_4px_rgba(24,92,77,0.1)] text-slate-800 font-medium px-5 h-12 w-full';

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      title={null}
      closable={false}
      mask={{ closable: !isLoading }}
      className={cn(
        '[&_.ant-modal-content]:p-0',
        '[&_.ant-modal-content]:bg-transparent',
        '[&_.ant-modal-content]:shadow-none',
        '[&_.ant-modal-content]:rounded-[32px]'
      )}
      wrapClassName="backdrop-blur-md"
    >
      <div className="bg-white/70 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.12)] border border-white/60 relative flex flex-col max-h-[90vh]">
        
        {/* ══ HEADER ══════════════════════════════════════════ */}
        <header className="relative px-10 pt-10 pb-14 overflow-hidden bg-linear-to-br from-[#185C4D] via-[#1c6958] to-[#257c66] shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[20px_20px]" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />

          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 z-20 active:scale-90 cursor-pointer"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-xl shadow-black/5">
              <FileText className="w-8 h-8 text-white" strokeWidth={2.5} />
              <Sparkles className="w-5 h-5 text-emerald-200 absolute -top-1.5 -right-1.5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-white font-black text-2xl tracking-tight leading-tight">
                {initialData ? 'ແກ້ໄຂຂໍ້ມູນເອກະສານ' : 'ເພີ່ມເອກະສານໃໝ່'}
              </h2>
              <p className="text-emerald-50/80 text-[14px] mt-1.5 font-medium max-w-[500px]">
                {initialData ? 'ອັບເດດລາຍລະອຽດ, ສະຖານະການຈັດເກັບ ແລະ ໄຟລ໌ຄັດຕິດຂອງເອກະສານ' : 'ລະບຸຂໍ້ມູນເອກະສານ ແລະ ແນບໄຟລ໌ເພື່ອບັນທຶກເຂົ້າໃນລະບົບ'}
              </p>
            </div>
          </div>
        </header>

        {/* ══ BODY ════════════════════════════════════════════ */}
        <main className="px-10 py-8 -mt-8 bg-white/85 backdrop-blur-2xl rounded-t-[32px] border-t border-white shadow-[0_-12px_40px_rgba(0,0,0,0.03)] relative z-10 overflow-y-auto flex-1">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            requiredMark={false}
            className="space-y-8"
          >
            {/* ── Section 1: Basic Information ── */}
            <div>
              <h3 className="flex items-center gap-2 text-[#185C4D] font-bold text-[15px] mb-4 border-b border-slate-100 pb-2">
                <Info size={16} /> ຂໍ້ມູນທົ່ວໄປຂອງເອກະສານ
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1">ຫົວຂໍ້ເອກະສານ <span className="text-rose-500">*</span></span>}
                  name="title"
                  rules={[{ required: true, message: 'ກະລຸນາປ້ອນຫົວຂໍ້ເອກະສານ!' }]}
                  className="md:col-span-2"
                >
                  <Input placeholder="ຕົວຢ່າງ: ສັນຍາຊື້-ຂາຍ ປະຈຳປີ 2026" className={inputCls} />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1">ເລກທີເອກະສານ <span className="text-rose-500">*</span></span>}
                  name="docNo"
                  rules={[{ required: true, message: 'ກະລຸນາປ້ອນເລກທີເອກະສານ!' }]}
                >
                  <Input placeholder="ເຊັ່ນ: EDL-2026-001" className={inputCls} />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1">ຊື່ຫຍໍ້ເອກະສານ</span>}
                  name="shortName"
                >
                  <Input placeholder="ເຊັ່ນ: Contract-26" className={inputCls} disabled={!!initialData} />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> ວັນທີເອກະສານ <span className="text-rose-500">*</span></span>}
                  name="docDate"
                  rules={[{ required: true, message: 'ກະລຸນາເລືອກວັນທີເອກະສານ!' }]}
                >
                  <DatePicker className={inputCls} placeholder="ເລືອກວັນທີ" format="YYYY-MM-DD" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> ວັນທີໝົດອາຍຸ <span className="text-rose-500">*</span></span>}
                  name="docExpire"
                  rules={[{ required: true, message: 'ກະລຸນາເລືອກວັນທີໝົດອາຍຸ!' }]}
                >
                  <DatePicker className={inputCls} placeholder="ເລືອກວັນທີ" format="YYYY-MM-DD" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1">ເລກທີເອກະສານຍ່ອຍ (Sub Doc No)</span>}
                  name="subDocNo"
                >
                  <Input placeholder="ເຊັ່ນ: SUB-01" className={inputCls} />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> ວັນທີເອກະສານຍ່ອຍ</span>}
                  name="subDocDate"
                >
                  <DatePicker className={inputCls} placeholder="ເລືອກວັນທີຍ່ອຍ" format="YYYY-MM-DD" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1">ລາຍລະອຽດ / ຄຳອະທິບາຍ</span>}
                  name="description"
                  className="md:col-span-2"
                >
                  <Input.TextArea placeholder="ລາຍລະອຽດເພີ່ມເຕີມ..." rows={3} className={cn(inputCls, 'h-auto py-3 resize-none')} />
                </Form.Item>
              </div>
            </div>

            {/* ── Section 2: Storage & Classification ── */}
            <div>
              <h3 className="flex items-center gap-2 text-[#185C4D] font-bold text-[15px] mb-4 border-b border-slate-100 pb-2">
                <FolderOpen size={16} /> ໝວດໝູ່ & ການຈັດເກັບ
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5"><Building2 size={14} className="text-slate-400" /> ກົມ/ພະແນກ <span className="text-rose-500">*</span></span>}
                  name="departmentId"
                  rules={[{ required: true, message: 'ກະລຸນາເລືອກກົມ/ພະແນກ!' }]}
                >
                  <DocumentDepartmentSelect />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5"><GitBranch size={14} className="text-slate-400" /> ພະແນກຍ່ອຍ/ສາຂາ</span>}
                  name="divisionId"
                >
                  <DocumentDivisionSelect form={form} />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1"><Layers size={14} className="text-slate-400" /> ປະເພດເອກະສານ <span className="text-rose-500">*</span></span>}
                  name="documentTypeId"
                  rules={[{ required: true, message: 'ກະລຸນາເລືອກປະເພດເອກະສານ!' }]}
                >
                  <Select placeholder="ເລືອກປະເພດເອກະສານ" className="w-full h-12 [&_.ant-select-selector]:rounded-2xl!" size="large">
                    {documentTypes.map(t => (
                      <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1"><FolderOpen size={14} className="text-slate-400" /> ແຟ້ມເອກະສານ <span className="text-rose-500">*</span></span>}
                  name="folderId"
                  rules={[{ required: true, message: 'ກະລຸນາເລືອກແຟ້ມເອກະສານ!' }]}
                >
                  <Select placeholder="ເລືອກແຟ້ມເອກະສານ" className="w-full h-12 [&_.ant-select-selector]:rounded-2xl!" size="large">
                    {folders.map(f => (
                      <Select.Option key={f.id} value={f.id}>{f.name || f.code}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {initialData && (
                  <Form.Item
                    label={<span className="text-[13px] font-bold text-slate-700 ml-1">ສະຖານະການເກັບຮັກສາ (Retention)</span>}
                    name="retentionStatus"
                  >
                    <Select className="w-full h-12 [&_.ant-select-selector]:rounded-2xl!" size="large" disabled>
                      <Select.Option value="ACTIVE">ເອກະສານທົ່ວໄປ</Select.Option>
                      <Select.Option value="DESTROYABLE">ສາມາດທຳລາຍໄດ້ (Destroyable)</Select.Option>
                      <Select.Option value="DESTROYABLE_HOLD">ຕິດສັນຍາ ຫ້າມທຳລາຍ (Destroyable Hold)</Select.Option>
                      <Select.Option value="EXPIRED">ໝົດອາຍຸ ເຖິງກຳນົດທຳລາຍ (Expired)</Select.Option>
                    </Select>
                  </Form.Item>
                )}

                <Form.Item
                  label={<span className="text-[13px] font-bold text-slate-700 ml-1 flex items-center gap-1.5"><Scale size={14} className="text-slate-400" /> ຜູກພັນສັນຍາ (Contract Bound)</span>}
                >
                  <div className="flex items-center gap-3 h-12 bg-white/40 border border-white/60 px-4 rounded-2xl shadow-xs">
                    <Form.Item name="isContractBound" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isContractBound !== curr.isContractBound}>
                      {() => (
                        <span className="text-slate-600 font-bold text-[14px]">
                          {form.getFieldValue('isContractBound') ? 'ແມ່ນ (ຜູກພັນສັນຍາ)' : 'ບໍ່ແມ່ນ (ທົ່ວໄປ)'}
                        </span>
                      )}
                    </Form.Item>
                  </div>
                </Form.Item>
              </div>
            </div>

            {/* ── Section 3: Attachments ── */}
            <div>
              <h3 className="flex items-center gap-2 text-[#185C4D] font-bold text-[15px] mb-4 border-b border-slate-100 pb-2">
                <Paperclip size={16} /> ໄຟລ໌ເອກະສານຄັດຕິດ
              </h3>

              {/* Show current attachments if editing */}
              {initialData && initialData.attachments && initialData.attachments.length > 0 && (
                <div className="mb-6 bg-white/40 border border-white/60 p-4 rounded-2xl shadow-xs">
                  <h4 className="text-[13px] font-black text-slate-700 mb-3">ໄຟລ໌ທີ່ມີໃນລະບົບ:</h4>
                  <div className="flex flex-col gap-2.5">
                    {initialData.attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between bg-white/80 border border-slate-100 px-4 py-2.5 rounded-xl shadow-xs">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText size={16} className="text-slate-400 shrink-0" />
                          <span className="text-[13px] font-semibold text-slate-700 truncate" title={att.fileName}>
                            {att.fileName}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 shrink-0">
                            ({(att.fileSize / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="text" 
                            size="small"
                            icon={<Download size={14} className="text-[#185C4D]" />}
                            href={getAttachmentDownloadUrl(att.id)}
                            target="_blank"
                            className="hover:bg-slate-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload new attachments */}
              <Form.Item>
                <Upload.Dragger {...uploadProps} className="bg-white/30 hover:bg-white/40 border-2 border-dashed border-slate-300 rounded-[24px] p-6 text-center cursor-pointer transition-all duration-300">
                  <p className="text-center text-3xl text-slate-400">
                    <UploadCloud className="mx-auto text-slate-400 w-10 h-10 mb-2" strokeWidth={1.5} />
                  </p>
                  <p className="ant-upload-text text-slate-700 font-bold text-sm">
                    ຄລິກ ຫຼື ລາກໄຟລ໌ມາວາງໃສ່ນີ້ ເພື່ອອັບໂຫຼດ
                  </p>
                  <p className="ant-upload-hint text-slate-400 text-xs mt-1 font-medium">
                    ຮອງຮັບໄຟລ໌ PDF, PNG, JPG ແລະ ອື່ນໆ
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </div>

            {/* Footer buttons */}
            <footer className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
              <Button onClick={onClose} disabled={isLoading} className="h-12 px-8 rounded-2xl border-white bg-white/50 text-slate-600 font-bold hover:bg-white transition-all cursor-pointer">ຍົກເລີກ</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="h-12 px-10 rounded-2xl bg-linear-to-r from-[#185C4D] to-[#206E5B] font-black shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-none flex items-center gap-2 cursor-pointer"
              >
                ບັນທຶກຂໍ້ມູນ <ArrowRight size={18} strokeWidth={2.5} />
              </Button>
            </footer>
          </Form>
        </main>
      </div>
    </Modal>
  );
}

function DocumentDepartmentSelect(props: any) {
  const { departments, fetchAll, isLoading } = useDepartmentStore();
  
  useEffect(() => {
    if (departments.length === 0) fetchAll();
  }, [departments.length, fetchAll]);

  return (
    <Select
      {...props}
      showSearch
      loading={isLoading}
      placeholder="ເລືອກກົມ/ພະແນກ"
      optionFilterProp="label"
      options={departments.map(d => ({ label: d.name, value: d.id }))}
      className="w-full h-12 [&_.ant-select-selector]:rounded-2xl!"
      size="large"
    />
  );
}

function DocumentDivisionSelect({ form, ...props }: any) {
  const departmentId = Form.useWatch('departmentId', form);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (departmentId) {
      const fetchDivisions = async () => {
        setIsLoading(true);
        try {
          const res = await api.get(`/divisions/dropdown?departmentId=${departmentId}`);
          setDivisions(Array.isArray(res.data) ? res.data : res.data?.data || []);
        } catch (error) {
          console.error('Failed to fetch divisions', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDivisions();
    } else {
      setDivisions([]);
      form.setFieldsValue({ divisionId: undefined });
    }
  }, [departmentId, form]);

  return (
    <Select
      {...props}
      showSearch
      allowClear
      loading={isLoading}
      disabled={!departmentId}
      placeholder={departmentId ? "ເລືອກພະແນກຍ່ອຍ/ສາຂາ" : "ກະລຸນາເລືອກກົມ/ພະແນກກ່ອນ"}
      optionFilterProp="label"
      options={divisions.map(d => ({ label: d.name, value: d.id }))}
      className="w-full h-12 [&_.ant-select-selector]:rounded-2xl!"
      size="large"
    />
  );
}
