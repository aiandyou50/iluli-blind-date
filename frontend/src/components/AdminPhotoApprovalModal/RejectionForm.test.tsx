import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RejectionForm from './RejectionForm';

describe('RejectionForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Validation and Button Activation', () => {
    it('should disable submit button when reason is empty', () => {
      render(
        <RejectionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const submitButton = screen.getByText('거절 확인');
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when reason is less than 10 characters', async () => {
      const user = userEvent.setup();

      render(
        <RejectionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const textarea = screen.getByLabelText(/거절 사유/);
      await user.type(textarea, '짧은이유');

      const submitButton = screen.getByText('거절 확인');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when reason is 10 or more characters', async () => {
      const user = userEvent.setup();

      render(
        <RejectionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const textarea = screen.getByLabelText(/거절 사유/);
      await user.type(textarea, '이것은 충분히 긴 거절 사유입니다');

      await waitFor(() => {
        const submitButton = screen.getByText('거절 확인');
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should show remaining character count when input is less than 10 characters', async () => {
      const user = userEvent.setup();

      render(
        <RejectionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const textarea = screen.getByLabelText(/거절 사유/);
      await user.type(textarea, '12345'); // 5 characters

      expect(screen.getByText('5자 더 입력해주세요')).toBeInTheDocument();
    });

    it('should not show remaining character count when input is 10 or more characters', async () => {
      const user = userEvent.setup();

      render(
        <RejectionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const textarea = screen.getByLabelText(/거절 사유/);
      await user.type(textarea, '1234567890'); // 10 characters

      expect(screen.queryByText(/자 더 입력해주세요/)).not.toBeInTheDocument();
    });

    it('should call onSubmit with trimmed reason when form is submitted', async () => {
      const user = userEvent.setup();

      render(
        <RejectionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const textarea = screen.getByLabelText(/거절 사유/);
      await user.type(textarea, '  이것은 충분히 긴 거절 사유입니다  ');

      const submitButton = screen.getByText('거절 확인');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('이것은 충분히 긴 거절 사유입니다');
    });

    it('should not call onSubmit when reason is less than 10 characters', async () => {
      const user = userEvent.setup();

      render(
        <RejectionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const textarea = screen.getByLabelText(/거절 사유/);
      await user.type(textarea, '짧은이유');

      const submitButton = screen.getByText('거절 확인');
      // Button should be disabled, but try to click anyway
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <RejectionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const cancelButton = screen.getByText('취소');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should disable all inputs and buttons when isSubmitting is true', () => {
      render(
        <RejectionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={true}
        />
      );

      const textarea = screen.getByLabelText(/거절 사유/);
      const submitButton = screen.getByText('처리 중...');
      const cancelButton = screen.getByText('취소');

      expect(textarea).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <RejectionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const textarea = screen.getByLabelText(/거절 사유/);
      expect(textarea).toHaveAttribute('aria-required', 'true');
      expect(textarea).toHaveAttribute('aria-describedby', 'rejection-reason-hint');
    });

    it('should mark textarea as invalid when input exists but is less than 10 characters', async () => {
      const user = userEvent.setup();

      render(
        <RejectionForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const textarea = screen.getByLabelText(/거절 사유/);
      await user.type(textarea, 'short');

      await waitFor(() => {
        expect(textarea).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
