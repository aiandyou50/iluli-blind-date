import type { Meta, StoryObj } from '@storybook/react-vite';
import PhotoCard from './PhotoCard';

/**
 * PhotoCard is a unified component for displaying photos with consistent styling.
 * It supports different aspect ratios, like buttons, verification badges, and loading states.
 */
const meta = {
  title: 'Components/PhotoCard',
  component: PhotoCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    aspectRatio: {
      control: 'select',
      options: ['1/1', '3/4', '4/3', '16/9'],
    },
    onClick: { action: 'clicked' },
    onLike: { action: 'liked' },
    onUserClick: { action: 'user clicked' },
  },
} satisfies Meta<typeof PhotoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic photo card with all features enabled
 */
export const Default: Story = {
  args: {
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
    alt: 'Sample photo',
    nickname: 'Jane Doe',
    school: 'Seoul National University',
    likesCount: 42,
    isLiked: false,
    isVerified: false,
    aspectRatio: '3/4',
    showUserInfo: true,
    showLikeButton: true,
  },
};

/**
 * Photo card with verification badge
 */
export const Verified: Story = {
  args: {
    ...Default.args,
    isVerified: true,
  },
};

/**
 * Photo card with liked state
 */
export const Liked: Story = {
  args: {
    ...Default.args,
    isLiked: true,
    likesCount: 43,
  },
};

/**
 * Photo card in loading state
 */
export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
};

/**
 * Photo card without user info (photo only)
 */
export const PhotoOnly: Story = {
  args: {
    ...Default.args,
    showUserInfo: false,
  },
};

/**
 * Photo card without like button
 */
export const NoLikeButton: Story = {
  args: {
    ...Default.args,
    showLikeButton: false,
  },
};

/**
 * Square aspect ratio (1:1)
 */
export const SquareAspectRatio: Story = {
  args: {
    ...Default.args,
    aspectRatio: '1/1',
  },
};

/**
 * Landscape aspect ratio (16:9)
 */
export const LandscapeAspectRatio: Story = {
  args: {
    ...Default.args,
    aspectRatio: '16/9',
  },
};

/**
 * Grid layout example with multiple cards
 */
export const GridLayout: Story = {
  args: Default.args,
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      <PhotoCard
        imageUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop"
        alt="Photo 1"
        nickname="Alice"
        school="Harvard University"
        likesCount={25}
        isLiked={false}
        isVerified={true}
        aspectRatio="3/4"
      />
      <PhotoCard
        imageUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop"
        alt="Photo 2"
        nickname="Bob"
        school="MIT"
        likesCount={38}
        isLiked={true}
        isVerified={false}
        aspectRatio="3/4"
      />
      <PhotoCard
        imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
        alt="Photo 3"
        nickname="Charlie"
        school="Stanford University"
        likesCount={52}
        isLiked={false}
        isVerified={true}
        aspectRatio="3/4"
      />
    </div>
  ),
};

/**
 * Dark mode example
 */
export const DarkMode: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <div className="bg-gray-900 p-8">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Error state (image load failure)
 */
export const ErrorState: Story = {
  args: {
    ...Default.args,
    imageUrl: 'https://invalid-url-that-will-fail.com/image.jpg',
  },
};
