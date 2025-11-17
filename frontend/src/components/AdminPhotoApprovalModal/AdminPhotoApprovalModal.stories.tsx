import type { Meta, StoryObj } from '@storybook/react-vite';
import AdminPhotoApprovalModal from './AdminPhotoApprovalModal';
import type { Photo } from './types';

const mockPhoto: Photo = {
  id: '1',
  image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  verification_status: 'pending',
  rejection_reason: null,
  created_at: new Date().toISOString(),
  likes_count: 42,
  user: {
    id: 'user-1',
    email: 'user@example.com',
    nickname: '김철수',
  },
};

const mockApprovedPhoto: Photo = {
  ...mockPhoto,
  id: '2',
  verification_status: 'approved',
};

const mockRejectedPhoto: Photo = {
  ...mockPhoto,
  id: '3',
  verification_status: 'rejected',
  rejection_reason: '사진이 흐릿하거나 얼굴이 명확하게 보이지 않습니다.',
};

const meta = {
  title: 'Components/AdminPhotoApprovalModal',
  component: AdminPhotoApprovalModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Admin Photo Approval Modal component for reviewing and approving user photos.

## Features
- **Accessibility**: Full ARIA support, focus trap, keyboard navigation
- **Responsive**: Mobile, tablet, and desktop layouts
- **Dark Mode**: Class-based dark mode support
- **Validation**: 10-character minimum for rejection reasons
- **Actions**: Approve (immediate) or Reject (shows form)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls modal visibility',
    },
    photo: {
      description: 'Photo object to display and manage',
    },
    onClose: {
      description: 'Callback when modal is closed',
      action: 'closed',
    },
    onApprove: {
      description: 'Callback when photo is approved',
      action: 'approved',
    },
    onReject: {
      description: 'Callback when photo is rejected with reason',
      action: 'rejected',
    },
  },
} satisfies Meta<typeof AdminPhotoApprovalModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    photo: mockPhoto,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onApprove: async (photoId) => {
      console.log('Approved photo:', photoId);
      return Promise.resolve();
    },
    onReject: async (photoId, reason) => {
      console.log('Rejected photo:', photoId, 'Reason:', reason);
      return Promise.resolve();
    },
  },
};

export const ApprovedPhoto: Story = {
  args: {
    ...Default.args,
    photo: mockApprovedPhoto,
  },
};

export const RejectedPhoto: Story = {
  args: {
    ...Default.args,
    photo: mockRejectedPhoto,
  },
};

export const WithHighLikes: Story = {
  args: {
    ...Default.args,
    photo: {
      ...mockPhoto,
      likes_count: 999,
    },
  },
};

export const DarkMode: Story = {
  args: Default.args,
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
  globals: {
    backgrounds: {
      value: "dark"
    }
  },
};

export const MobileView: Story = {
  args: Default.args,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const TabletView: Story = {
  args: Default.args,
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
