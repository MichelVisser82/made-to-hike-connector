import ReferralModal from './ReferralModal';

interface GuideReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export default function GuideReferralModal(props: GuideReferralModalProps) {
  return <ReferralModal {...props} userType="guide" />;
}
