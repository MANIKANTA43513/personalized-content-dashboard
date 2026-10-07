import { describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchView, SEARCH_DEBOUNCE_MS } from '@/components/search/SearchView';
import { json, mockApi, news, rec, renderWithStore, social } from '../utils';
import type { SearchResult } from '@/types/content';

vi.mock('next/navigation', () => ({ usePathname: () => '/search', useRouter: () => ({ push: vi.fn() }) }));

const result = (q: string, over: Partial<SearchResult> = {}): SearchResult => ({
  query: q, mode: 'mock', total: 3,
  groups: { news: [news()], recommendation: [rec()], social: [social()] }, ...over,
});

const searchCalls = (fn: ReturnType<typeof mockApi>) => fn.mock.calls.filter(([r]) => String(r instanceof Request ? r.url : r).includes('/api/search'));

function App() {
  return (<><SearchBar /><SearchView /></>);
}

describe('Search integration', () => {
  it('debounces: typing "react" fires ONE request for the final query, not five', async () => {
    const fetchMock = mockApi({ search: (url) => json(result(url.searchParams.get('q') ?? '')) });
    renderWithStore(<App />);
    await userEvent.type(screen.getByTestId('search-input'), 'react', { delay: 30 });
    expect(searchCalls(fetchMock)).toHaveLength(0); // still inside the debounce window
    await screen.findByTestId('results-news', undefined, { timeout: SEARCH_DEBOUNCE_MS + 2000 });
    const calls = searchCalls(fetchMock);
    expect(calls).toHaveLength(1);
    expect(new URL((calls[0][0] as Request).url).searchParams.get('q')).toBe('react');
  });

  it('groups results by content type', async () => {
    mockApi({ search: (url) => json(result(url.searchParams.get('q') ?? '')) });
    renderWithStore(<App />);
    await userEvent.type(screen.getByTestId('search-input'), 'ci');
    expect(await screen.findByTestId('results-news')).toBeInTheDocument();
    expect(screen.getByTestId('results-recommendation')).toBeInTheDocument();
    expect(screen.getByTestId('results-social')).toBeInTheDocument();
  });

  it('shows an empty state with the query for no results', async () => {
    mockApi({ search: (url) => json(result(url.searchParams.get('q') ?? '', { total: 0, groups: { news: [], recommendation: [], social: [] } })) });
    renderWithStore(<App />);
    await userEvent.type(screen.getByTestId('search-input'), 'zzzz');
    expect(await screen.findByTestId('search-empty')).toHaveTextContent('zzzz');
  });

  it('shows an error state and retries successfully', async () => {
    let fail = true;
    mockApi({ search: (url) => (fail ? json({ error: { code: 'rate_limit', message: 'Too many searches. Wait a moment.' } }, 429) : json(result(url.searchParams.get('q') ?? ''))) });
    renderWithStore(<App />);
    await userEvent.type(screen.getByTestId('search-input'), 'react');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Too many searches');
    fail = false;
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByTestId('results-news')).toBeInTheDocument();
  });

  it('asks for at least 2 characters and does not call the API for 1', async () => {
    const fetchMock = mockApi({ search: () => json(result('a')) });
    renderWithStore(<App />);
    await userEvent.type(screen.getByTestId('search-input'), 'a');
    expect(screen.getByTestId('search-hint')).toBeInTheDocument();
    await act(async () => { await new Promise((r) => setTimeout(r, SEARCH_DEBOUNCE_MS + 100)); });
    expect(searchCalls(fetchMock)).toHaveLength(0);
  });

  it('clears the query and returns to the prompt', async () => {
    mockApi({ search: (url) => json(result(url.searchParams.get('q') ?? '')) });
    const { store } = renderWithStore(<App />);
    await userEvent.type(screen.getByTestId('search-input'), 'react');
    await userEvent.click(screen.getByTestId('search-clear'));
    expect(store.getState().search.query).toBe('');
    expect(screen.getByTestId('search-input')).toHaveValue('');
    expect(screen.getByTestId('search-prompt')).toBeInTheDocument();
  });

  it('filters visible groups by content type', async () => {
    mockApi({ search: (url) => json(result(url.searchParams.get('q') ?? '')) });
    renderWithStore(<App />);
    await userEvent.type(screen.getByTestId('search-input'), 'ci');
    await screen.findByTestId('results-news');
    await userEvent.click(screen.getByRole('button', { name: /social/i }));
    expect(screen.queryByTestId('results-news')).toBeNull();
    expect(screen.getByTestId('results-social')).toBeInTheDocument();
  });
});
