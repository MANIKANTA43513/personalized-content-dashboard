import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentCard } from '@/components/content/ContentCard';
import { FavoriteButton } from '@/components/content/FavoriteButton';
import { PreferencesPanel } from '@/components/settings/PreferencesPanel';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { FeedSkeleton, SectionSkeleton } from '@/components/common/Skeletons';
import { news, rec, renderWithStore, social } from '../utils';

describe('ContentCard', () => {
  it('renders a news card with headline, description, source, category and a Read CTA', () => {
    renderWithStore(<ContentCard item={news()} />);
    expect(screen.getByRole('heading', { name: /Open-source model/ })).toBeInTheDocument();
    expect(screen.getByText('A short description of the story.')).toBeInTheDocument();
    expect(screen.getByText('Daily Ledger')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /Read/i });
    expect(cta).toHaveAttribute('href', 'https://example.com/a');
    expect(cta).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
  it('uses a content-type-specific CTA', () => {
    const { unmount } = renderWithStore(<ContentCard item={social()} />);
    expect(screen.getByRole('link', { name: /View post/i })).toBeInTheDocument();
    expect(screen.getByText('@nova.codes')).toBeInTheDocument();
    unmount();
    renderWithStore(<ContentCard item={rec({ mediaKind: 'music' })} />);
    expect(screen.getByRole('link', { name: /Play/i })).toBeInTheDocument();
  });
  it('shows the rank on trending cards', () => {
    renderWithStore(<ContentCard item={news()} rank={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
  it('marks decorative images with empty alt text', () => {
    renderWithStore(<ContentCard item={news()} />);
    expect(document.querySelector('article img')).toHaveAttribute('alt', '');
  });
});

describe('FavoriteButton', () => {
  it('toggles favorite state in Redux and updates aria-pressed', async () => {
    const { store } = renderWithStore(<FavoriteButton item={news()} />);
    const btn = screen.getByTestId('favorite-button');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(store.getState().favorites.byId['news:t-1']).toBeDefined();
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(store.getState().favorites.byId['news:t-1']).toBeUndefined();
  });
  it('keeps two buttons for the same item in sync (e.g. Feed + Trending)', async () => {
    renderWithStore(<><FavoriteButton item={news()} /><FavoriteButton item={news()} /></>);
    const [a, b] = screen.getAllByTestId('favorite-button');
    await userEvent.click(a);
    expect(b).toHaveAttribute('aria-pressed', 'true');
  });
  it('is operable with the keyboard', async () => {
    renderWithStore(<FavoriteButton item={news()} />);
    const btn = screen.getByTestId('favorite-button');
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('PreferencesPanel', () => {
  it('lists every category as a checkbox and reflects the store', () => {
    renderWithStore(<PreferencesPanel />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(7);
    expect(screen.getByTestId('category-technology')).toBeChecked();
    expect(screen.getByTestId('category-finance')).not.toBeChecked();
  });
  it('supports multi-select, select all and clear all', async () => {
    const { store } = renderWithStore(<PreferencesPanel />);
    await userEvent.click(screen.getByTestId('category-finance'));
    await userEvent.click(screen.getByTestId('category-sports'));
    expect(store.getState().preferences.categories).toEqual(expect.arrayContaining(['finance', 'sports', 'technology']));
    await userEvent.click(screen.getByRole('button', { name: /select all/i }));
    expect(store.getState().preferences.categories).toHaveLength(7);
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(store.getState().preferences.categories).toEqual([]);
  });
});

describe('ThemeToggle', () => {
  it('toggles the theme mode and aria-pressed', async () => {
    const { store } = renderWithStore(<ThemeToggle />);
    const btn = screen.getByTestId('theme-toggle');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(btn);
    expect(store.getState().theme.mode).toBe('dark');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('state components', () => {
  it('EmptyState shows title, description and actions', () => {
    renderWithStore(<EmptyState icon={<span />} title="Nothing here" description="Try something else" actions={<button>Do it</button>} />);
    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument();
    expect(screen.getByText('Try something else')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument();
  });
  it('ErrorState is an alert and calls onRetry', () => {
    let calls = 0;
    renderWithStore(<ErrorState message="Server unreachable" onRetry={() => { calls += 1; }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Server unreachable');
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(calls).toBe(1);
  });
  it('ErrorState hides the retry button when no handler is given', () => {
    renderWithStore(<ErrorState />);
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('skeletons expose an accessible loading status', () => {
    renderWithStore(<><FeedSkeleton label="Loading feed" count={2} /><SectionSkeleton label="Loading section" /></>);
    expect(screen.getByRole('status', { name: 'Loading feed' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading section' })).toBeInTheDocument();
  });
});
