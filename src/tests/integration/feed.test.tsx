import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedView } from '@/components/dashboard/FeedView';
import { FavoritesView } from '@/components/dashboard/FavoritesView';
import { makeStore } from '@/store';
import { setCategories } from '@/store/slices/preferencesSlice';
import { feedPage, json, mockApi, news, rec, renderWithStore, social } from '../utils';

const three = () => [news(), rec(), social()];

describe('Feed integration (Redux + RTK Query + UI)', () => {
  it('shows a skeleton, then a unified feed of news, recommendations and social posts', async () => {
    mockApi({ feed: () => json(feedPage(three())) });
    renderWithStore(<FeedView />);
    expect(screen.getByTestId('feed-skeleton')).toBeInTheDocument();
    const cards = await screen.findAllByTestId('content-card');
    expect(cards.map((c) => c.getAttribute('data-type')).sort()).toEqual(['news', 'recommendation', 'social']);
    expect(screen.getByTestId('end-of-feed')).toBeInTheDocument();
  });

  it('requests the categories chosen in preferences', async () => {
    const fetchMock = mockApi({ feed: () => json(feedPage(three())) });
    const store = makeStore();
    store.dispatch(setCategories(['finance', 'health']));
    renderWithStore(<FeedView />, { store });
    await screen.findAllByTestId('content-card');
    const url = new URL(fetchMock.mock.calls[0][0] instanceof Request ? (fetchMock.mock.calls[0][0] as Request).url : String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('categories')).toBe('finance,health');
  });

  it('shows the no-categories empty state and does not call the API', async () => {
    const fetchMock = mockApi({ feed: () => json(feedPage(three())) });
    const store = makeStore();
    store.dispatch(setCategories([]));
    renderWithStore(<FeedView />, { store });
    expect(await screen.findByText(/choose your topics/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows an empty state for an empty API response', async () => {
    mockApi({ feed: () => json(feedPage([])) });
    renderWithStore(<FeedView />);
    expect(await screen.findByTestId('empty-state')).toBeInTheDocument();
    expect(screen.queryByTestId('content-card')).toBeNull();
  });

  it('shows a friendly error (no stack trace) and recovers on retry', async () => {
    let fail = true;
    mockApi({
      feed: () => (fail ? json({ error: { code: 'upstream', message: 'The news service is down.' } }, 502) : json(feedPage(three()))),
    });
    renderWithStore(<FeedView />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The news service is down.');
    expect(alert.textContent).not.toMatch(/at \w+ \(|stack|TypeError/);
    fail = false;
    await userEvent.click(within(alert).getByRole('button', { name: /retry/i }));
    expect(await screen.findAllByTestId('content-card')).toHaveLength(3);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('surfaces partial source failures while still rendering the rest', async () => {
    mockApi({ feed: () => json(feedPage([news()], { errors: { social: 'rate limited' } })) });
    renderWithStore(<FeedView />);
    expect(await screen.findByTestId('partial-error')).toBeInTheDocument();
    expect(screen.getAllByTestId('content-card')).toHaveLength(1);
  });

  it('loads the next page, de-duplicates, and reaches the end', async () => {
    const fetchMock = mockApi({
      feed: (url) =>
        url.searchParams.get('page') === '2'
          ? json(feedPage([news({ id: 'news:t-1' }), news({ id: 'news:t-2', title: 'Second page story' })], { page: 2, hasMore: false }))
          : json(feedPage([news()], { page: 1, hasMore: true, total: 2 })),
    });
    renderWithStore(<FeedView />);
    await screen.findAllByTestId('content-card');
    await userEvent.click(await screen.findByTestId('load-more'));
    await screen.findByText('Second page story');
    expect(screen.getAllByTestId('content-card')).toHaveLength(2); // news:t-1 was not duplicated
    expect(await screen.findByTestId('end-of-feed')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('Favorites integration', () => {
  it('shows an empty state, then lists items favorited from the feed (shared store)', async () => {
    mockApi({ feed: () => json(feedPage(three())) });
    const store = makeStore();
    const feed = renderWithStore(<FeedView />, { store });
    const first = (await screen.findAllByTestId('favorite-button'))[0];
    await userEvent.click(first);
    feed.unmount();

    renderWithStore(<FavoritesView />, { store });
    await waitFor(() => expect(screen.getAllByTestId('content-card')).toHaveLength(1));
    expect(screen.queryByTestId('favorites-empty')).toBeNull();
  });

  it('renders the empty state with calls to action when there are no favorites', async () => {
    renderWithStore(<FavoritesView />);
    expect(await screen.findByTestId('favorites-empty')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /feed/i })).toHaveAttribute('href', '/feed');
  });

  it('clears all favorites after confirming in the modal', async () => {
    mockApi({});
    const store = makeStore();
    store.dispatch({ type: 'favorites/toggleFavorite', payload: news() });
    renderWithStore(<FavoritesView />, { store });
    await userEvent.click(await screen.findByTestId('clear-favorites'));
    await userEvent.click(await screen.findByTestId('confirm-clear'));
    expect(await screen.findByTestId('favorites-empty')).toBeInTheDocument();
    expect(store.getState().favorites.ids).toEqual([]);
  });
});
