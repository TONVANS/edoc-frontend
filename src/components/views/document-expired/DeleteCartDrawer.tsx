'use client';

import React, { useState } from 'react';
import { Button, Drawer, Popconfirm, Modal, DatePicker, Upload, message } from 'antd';
import { Trash2, UploadCloud } from 'lucide-react';
import dayjs from 'dayjs';
import { useDeleteCartStore } from '@/store/useDeleteCartStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import api from '@/lib/api';

interface DeleteCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteCartDrawer({ isOpen, onClose }: DeleteCartDrawerProps) {
  const { items: deleteCart, removeItem, clearCart } = useDeleteCartStore();
  const { expiredDocuments, destroyedDocuments, documents, fetchExpiredDocuments, fetchDocuments } = useDocumentStore();
  const [messageApi, contextHolder] = message.useMessage();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteFile, setDeleteFile] = useState<File | null>(null);
  const [destroyedDate, setDestroyedDate] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (deleteCart.length === 0) {
      messageApi.error('ກະລຸນາເລືອກເອກະສານທີ່ຕ້ອງການລຶບ');
      return;
    }
    if (!destroyedDate) {
      messageApi.error('ກະລຸນາເລືອກວັນທີທຳລາຍເອກະສານ');
      return;
    }
    if (!deleteFile) {
      messageApi.error('ກະລຸນາແນບເອກະສານອ້າງອີງການທຳລາຍ (PDF)');
      return;
    }

    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append('file', deleteFile);
      formData.append('destroyedDate', destroyedDate);
      
      deleteCart.forEach(id => {
        formData.append('ids', id);
      });
      
      await api.delete('/documents/:id', {
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      messageApi.success('ລຶບເອກະສານສຳເລັດ');
      setDeleteModalVisible(false);
      onClose();
      clearCart();
      setDeleteFile(null);
      setDestroyedDate(null);
      
      fetchExpiredDocuments();
      fetchDocuments({ page: 1, limit: 10, retentionStatus: 'EXPIRED' });
    } catch (error) {
      messageApi.error('ບໍ່ສາມາດລຶບເອກະສານໄດ້');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Drawer
        title={
          <div className="flex items-center justify-between font-lao py-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 shadow-xs">
                <Trash2 size={20} className="text-rose-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-lg">ກະຕ່າລຶບເອກະສານ</span>
                <span className="text-xs text-slate-500 font-medium">
                  {deleteCart.length > 0
                    ? `ລວມ ${deleteCart.length} ລາຍການ`
                    : 'ບໍ່ມີລາຍການ'}
                </span>
              </div>
            </div>

            {deleteCart.length > 0 && (
              <Popconfirm
                title="ຢືນຢັນການລຶບ"
                description="ທ່ານຕ້ອງການລ້າງກະຕ່າລຶບທັງໝົດບໍ່?"
                onConfirm={() => {
                  clearCart();
                  onClose();
                }}
                okText="ລ້າງທັງໝົດ"
                cancelText="ຍົກເລີກ"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<Trash2 size={15} />}
                  className="rounded-xl flex items-center gap-1 font-medium hover:bg-rose-50"
                >
                  ລ້າງທັງໝົດ
                </Button>
              </Popconfirm>
            )}
          </div>
        }
        placement="right"
        styles={{ wrapper: { width: 450, maxWidth: '100vw' } }}
        onClose={onClose}
        open={isOpen}
        className="font-lao [&_.ant-drawer-header]:border-b [&_.ant-drawer-header]:border-slate-100 [&_.ant-drawer-body]:p-4"
        footer={
          deleteCart.length > 0 ? (
            <div className="flex items-center justify-end gap-2 p-2 font-lao bg-slate-50 rounded-2xl border border-slate-200/60">
              <Button
                onClick={onClose}
                className="rounded-xl h-11 px-5 border-slate-200 hover:bg-slate-100 font-medium"
              >
                ປິດ
              </Button>
              <Button
                type="primary"
                danger
                icon={<Trash2 size={18} />}
                onClick={() => {
                  setDeleteFile(null);
                  setDestroyedDate(null);
                  setDeleteModalVisible(true);
                }}
                className="rounded-xl h-11 px-6 font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                ດຳເນີນການລຶບ ({deleteCart.length})
              </Button>
            </div>
          ) : null
        }
      >
        {deleteCart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center font-lao">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4 text-slate-300 border border-slate-200/50">
              <Trash2 size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-slate-700 font-bold text-lg mb-1">ຍັງບໍ່ມີເອກະສານໃນກະຕ່າ</h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
              ທ່ານສາມາດເລືອກເອກະສານທີ່ໝົດອາຍຸ ຈາກຕາຕະລາງເພື່ອລຶບພ້ອມກັນ
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-3 font-lao overflow-y-auto pr-1">
            {deleteCart.map((id, idx) => {
              const item = [...expiredDocuments, ...destroyedDocuments, ...documents].find(d => d.id === id);
              if (!item) return null;
              
              const docTypeName = item.documentType?.name || 'ບໍ່ລະບຸ';

              return (
                <div
                  key={id}
                  className="group bg-white border border-slate-200/80 hover:border-rose-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-100">
                      {idx + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100/60">
                          {item.docNo}
                        </span>
                        <span className="font-bold text-slate-800 text-sm truncate">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 truncate">
                        <span>{docTypeName}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="text"
                    danger
                    icon={<Trash2 size={16} />}
                    onClick={() => {
                      removeItem(id);
                      if (deleteCart.length === 1) {
                        onClose();
                      }
                    }}
                    className="rounded-xl opacity-70 group-hover:opacity-100 hover:bg-rose-50 shrink-0"
                  />
                </div>
              );
            })}
          </div>
        )}
      </Drawer>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Trash2 className="text-rose-500" size={20} />
            <span className="text-rose-500">ຢືນຢັນການລຶບເອກະສານ</span>
          </div>
        }
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDeleteConfirm}
        confirmLoading={isDeleting}
        okText={`ຢືນຢັນລຶບ ${deleteCart.length} ລາຍການ`}
        cancelText="ຍົກເລີກ"
        okButtonProps={{ danger: true }}
        centered
      >
        <div className="py-4 flex flex-col gap-4">
          <p className="text-slate-600 font-medium text-sm">
            ກະລຸນາເລືອກວັນທີ ແລະ ແນບເອກະສານອ້າງອີງການອະນຸມັດທຳລາຍເອກະສານ (PDF) ເພື່ອຢືນຢັນການລຶບ {deleteCart.length} ລາຍການທີ່ເລືອກໄວ້.
          </p>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-700">ວັນທີອະນຸມັດການທຳລາຍເອກະສານ <span className="text-rose-500">*</span></span>
            <DatePicker 
              className="h-11 rounded-xl w-full" 
              placeholder="ເລືອກວັນທີອະນຸມັດການທຳລາຍເອກະສານ"
              value={destroyedDate ? dayjs(destroyedDate) : null}
              onChange={(date) => {
                setDestroyedDate(date ? date.format('YYYY-MM-DD') : null);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-slate-700">ເອກະສານອ້າງອີງການອະນຸມັດການທຳລາຍເອກະສານ (PDF) <span className="text-rose-500">*</span></span>
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                const isPdf = file.type === 'application/pdf';
                if (!isPdf) {
                  messageApi.error('ອະນຸຍາດສະເພາະໄຟລ໌ PDF ເທົ່ານັ້ນ!');
                  return Upload.LIST_IGNORE;
                }
                setDeleteFile(file);
                return false;
              }}
              onRemove={() => setDeleteFile(null)}
              accept=".pdf"
            >
              <Button icon={<UploadCloud size={16} />}>ອັບໂຫຼດເອກະສານອ້າງອີງ</Button>
            </Upload>
          </div>
        </div>
      </Modal>
    </>
  );
}
