import ReferralModal from './ReferralModal';

interface HikerReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export default function HikerReferralModal(props: HikerReferralModalProps) {
  return <ReferralModal {...props} userType="hiker" />;
}
