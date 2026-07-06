import { differenceInYears } from 'date-fns';

export type RetentionStatus = 'DESTROYABLE' | 'HOLD_CONTRACT' | 'STRICT_RETENTION';

export interface DocumentInfo {  
  createdAt: Date | string;  
  hasActiveContract: boolean;  
}

export function getRetentionStatus(doc: DocumentInfo): { status: RetentionStatus, colorProfile: 'success' | 'warning' | 'danger' } {  
  const docDate = new Date(doc.createdAt);  
  const yearsOld = differenceInYears(new Date(), docDate);

  if (yearsOld >= 10) {  
    if (doc.hasActiveContract) {  
      // ครบ 10 ปี แต่ติดสัญญา (Warning)  
      return { status: 'HOLD_CONTRACT', colorProfile: 'warning' };  
    }  
    // ครบ 10 ปี ทำลายได้ (Success)  
    return { status: 'DESTROYABLE', colorProfile: 'success' };  
  }  
    
  // ยังไม่ครบ 10 ปี (Danger)  
  return { status: 'STRICT_RETENTION', colorProfile: 'danger' };  
}
