export interface Photo {
  id: string;
  image_url: string;
  verification_status: 'pending' | 'approved' | 'rejected' | 'not_applied';
  rejection_reason: string | null;
  created_at: string;
  likes_count: number;
  user: {
    id: string;
    email: string;
    nickname: string;
  };
}

export interface ModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (photoId: string) => Promise<void>;
  onReject: (photoId: string, reason: string) => Promise<void>;
}

export interface RejectionFormProps {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}
