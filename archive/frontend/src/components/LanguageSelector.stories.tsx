import type { Meta, StoryObj } from '@storybook/react-vite';
import LanguageSelector from './LanguageSelector';

/**
 * LanguageSelector allows users to switch between different languages.
 * It uses HeadlessUI Menu component for accessible dropdown behavior.
 */
const meta = {
  title: 'Components/LanguageSelector',
  component: LanguageSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LanguageSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default language selector in light mode
 */
export const Default: Story = {};

/**
 * Language selector in dark mode
 */
export const DarkMode: Story = {
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
 * Language selector with menu open (for visual testing)
 */
export const MenuOpen: Story = {
  // Note: Menu opening would require user interaction in actual tests
};
