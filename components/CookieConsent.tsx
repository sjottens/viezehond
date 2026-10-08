'use client';
import { GoogleAnalytics } from '@next/third-parties/google';
import { useEffect, useState } from 'react';

// Vraagt toestemming voor analytische cookies. Google Analytics laadt pas na "Prima".
// De keuze staat in de browser (localStorage); via "Cookies" in de footer kun je hem wijzigen.
const KEY = 'viezehond-cookies';
export const OPEN_COOKIE_SETTINGS = 'viezehond:cookie-instellingen';

type Choice = 'granted' | 'denied';

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

// Weigeren na eerder akkoord: de GA-cookies weer opruimen
function removeGaCookies() {
  const host = location.hostname;
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  for (const name of document.cookie.split(';').map((c) => c.split('=')[0].trim())) {
    if (name !== '_ga' && !name.startsWith('_ga_')) continue;
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`;
  }
}

export function CookieConsent({ gaId }: { gaId: string | null }) {
  const [{ choice, open }, setState] = useState<{ choice: Choice | null; open: boolean }>({ choice: null, open: false });

  useEffect(() => {
    const saved = readChoice();
    setState({ choice: saved, open: saved === null }); // eslint-disable-line react-hooks/set-state-in-effect -- localStorage bestaat pas in de browser
    const reopen = () => setState((s) => ({ ...s, open: true }));
    window.addEventListener(OPEN_COOKIE_SETTINGS, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, reopen);
  }, []);

  function choose(next: Choice) {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Opslaan lukt niet (privévenster): de keuze geldt dan alleen voor dit bezoek
    }
    if (next === 'denied' && choice === 'granted') {
      removeGaCookies();
      location.reload(); // het al geladen GA-script weer uit de pagina halen
      return;
    }
    setState({ choice: next, open: false });
  }

  return (
    <>
      {gaId && choice === 'granted' && <GoogleAnalytics gaId={gaId} />}
      {open && (
        <section className="cookie-consent" role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-text">
          <span className="cookie-biscuit" aria-hidden="true">🍪</span>
          <h2 id="cookie-title">Koekje?</h2>
          <p id="cookie-text">
            We gebruiken alleen cookies om te zien hoe de site gebruikt wordt, zodat we hem beter kunnen maken
            (Google Analytics). Geen advertenties, en we verkopen niets door.
          </p>
          <div className="cookie-actions">
            <button type="button" className="btn btn-small" onClick={() => choose('granted')}>Prima</button>
            <button type="button" className="btn btn-small btn-ghost" onClick={() => choose('denied')}>Liever niet</button>
          </div>
        </section>
      )}
    </>
  );
}

/** Knop voor in de footer om de keuze later te wijzigen. */
export function CookieSettingsButton() {
  return (
    <button type="button" className="link-button" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))}>
      Cookies
    </button>
  );
}
