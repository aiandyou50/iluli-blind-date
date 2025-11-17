import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPhotoApprovalModal from './AdminPhotoApprovalModal';
import type { Photo } from './types';

const mockPhoto: Photo = {
  id: 'test-photo-1',
  image_url: 'https://example.com/photo.jpg',
  verification_status: 'pending',
  rejection_reason: null,
  created_at: new Date().toISOString(),
  likes_count: 10,
  user: {
    id: 'user-1',
    email: 'test@example.com',
    nickname: '테스트유저',
  },
};

describe('AdminPhotoApprovalModal', () => {
  const mockOnClose = vi.fn();
  const mockOnApprove = vi.fn();
  const mockOnReject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Open/Close and Focus Trap', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <AdminPhotoApprovalModal
          photo={mockPhoto}
          isOpen={true}
          onClose={mockOnClose}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      );

      expect(screen.getByText('사진 승인 관리')).toBeInTheDocument();
      expect(screen.getByText('테스트유저')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(
        <AdminPhotoApprovalModal
          photo={mockPhoto}
          isOpen={false}
          onClose={mockOnClose}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      );

      expect(screen.queryByText('사진 승인 관리')).not.toBeInTheDocument();
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <AdminPhotoApprovalModal
          photo={mockPhoto}
          isOpen={true}
          onClose={mockOnClose}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      );

      const closeButton = screen.getByLabelText('모달 닫기');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close modal when ESC key is pressed', async () => {
      const user = userEvent.setup();
      
      render(
        <AdminPhotoApprovalModal
          photo={mockPhoto}
          isOpen={true}
          onClose={mockOnClose}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      );

      await user.keyboard('{Escape}');

      // HeadlessUI may call onClose multiple times, so we just check it was called
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <AdminPhotoApprovalModal
          photo={mockPhoto}
          isOpen={true}
          onClose={mockOnClose}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      );

      const title = screen.getByText('사진 승인 관리');
      expect(title).toHaveAttribute('id', 'modal-title');
      
      const description = screen.getByText('사진 승인 또는 거절을 처리할 수 있는 모달입니다.');
      expect(description).toHaveAttribute('id', 'modal-description');
    });

    it('should prevent closing when processing', async () => {
      const user = userEvent.setup();
      mockOnApprove.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <AdminPhotoApprovalModal
          photo={mockPhoto}
          isOpen={true}
          onClose={mockOnClose}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      );

      const approveButton = screen.getByLabelText('사진 승인');
      await user.click(approveButton);

      // Try to close while processing
      await user.keyboard('{Escape}');
      
      // Should not close during processing
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Approve Action', () => {
    it('should call onApprove and close modal when approve button is clicked', async () => {
      const user = userEvent.setup();
      mockOnApprove.mockResolvedValue(undefined);

      render(
        <AdminPhotoApprovalModal
          photo={mockPhoto}
          isOpen={true}
          onClose={mockOnClose}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      );

      const approveButton = screen.getByLabelText('사진 승인');
      await user.click(approveButton);

      await waitFor(() => {
        expect(mockOnApprove).toHaveBeenCalledWith(mockPhoto.id);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should disable buttons while processing approval', async () => {
      const user = userEvent.setup();
      mockOnApprove.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <AdminPhotoApprovalModal
          photo={mockPhoto}
          isOpen={true}
          onClose={mockOnClose}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      );

      const approveButton = screen.getByLabelText('사진 승인');
      const rejectButton = screen.getByLabelText('사진 거절');

      await user.click(approveButton);

      expect(approveButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
    });
  });

  describe('Photo Information Display', () => {
    it('should display photo information correctly', () => {
      render(
        <AdminPhotoApprovalModal
          photo={mockPhoto}
          isOpen={true}
          onClose={mockOnClose}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      );

      expect(screen.getByText('테스트유저')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('좋아요')).toBeInTheDocument();
    });

    it('should display rejection reason when photo is rejected', () => {
      const rejectedPhoto = {
        ...mockPhoto,
        verification_status: 'rejected' as const,
        rejection_reason: '사진이 부적절합니다.',
      };

      render(
        <AdminPhotoApprovalModal
          photo={rejectedPhoto}
          isOpen={true}
          onClose={mockOnClose}
          onApprove={mockOnApprove}
          onReject={mockOnReject}
        />
      );

      expect(screen.getByText(/거절 사유:/)).toBeInTheDocument();
      expect(screen.getByText(/사진이 부적절합니다./)).toBeInTheDocument();
    });
  });
});
