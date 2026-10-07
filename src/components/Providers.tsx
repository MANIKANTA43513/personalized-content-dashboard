'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from '@/store';
import { hydrate } from '@/store/hydrate';
import { loadPersisted, savePersisted, selectPersisted } from '@/store/persist';
import { setHydrated } from '@/store/slices/uiSlice';
import i18n from '@/i18n';
import { useAppSelector } from '@/store/hooks';

/** Applies theme + language side-effects from Redux to the document. */
function DocumentSync() {
  const mode = useAppSelector((s) => s.theme.mode);
  const language = useAppSelector((s) => s.preferences.language);
  const hydrated = useAppSelector((s) => s.ui.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode, hydrated]);

  useEffect(() => {
    void i18n.changeLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) storeRef.current = makeStore();
  const store = storeRef.current;

  useEffect(() => {
    // Restore persisted state AFTER first render so server and client markup match (no hydration errors).
    const persisted = loadPersisted() ?? {};
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    store.dispatch(hydrate({ ...persisted, theme: persisted.theme ?? (prefersDark ? 'dark' : 'light') }));
    store.dispatch(setHydrated());

    let last = JSON.stringify(selectPersisted(store.getState()));
    const unsubscribe = store.subscribe(() => {
      if (!store.getState().ui.hydrated) return;
      const next = JSON.stringify(selectPersisted(store.getState()));
      if (next !== last) {
        last = next;
        savePersisted(store.getState());
      }
    });
    // Save once so first-visit theme/defaults are stored too.
    savePersisted(store.getState());
    return unsubscribe;
  }, [store]);

  return (
    <Provider store={store}>
      <DocumentSync />
      {children}
    </Provider>
  );
}
