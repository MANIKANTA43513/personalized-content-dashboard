import { CATEGORIES, type Category, type ContentItem, type NewsItem, type RecommendationItem, type SocialPost } from '@/types/content';

/**
 * Deterministic mock catalogue. The same ids/content are produced on every
 * call so pagination, favorites and ordering behave like a real backend.
 */

const HOUR = 3_600_000;

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface CategorySeed {
  subjects: string[];
  developments: string[];
  recs: { title: string; kind: 'movie' | 'music' | 'series'; blurb: string }[];
  takes: string[];
  tags: string[];
}

const SEEDS: Record<Category, CategorySeed> = {
  technology: {
    subjects: ['Open-source language model', 'Edge computing startup', 'Quantum error-correction lab', 'Browser engine team', 'Chip foundry', 'Robotics company', 'Cloud database vendor', 'Cybersecurity researchers'],
    developments: ['ships a faster release with half the memory use', 'publishes a benchmark that challenges industry claims', 'opens its roadmap to community voting', 'patches a critical flaw ahead of schedule', 'announces a partnership with university labs', 'cuts inference costs by a third', 'unveils developer tooling aimed at small teams', 'details how it rebuilt its stack in Rust'],
    recs: [
      { title: 'Signal Lost', kind: 'movie', blurb: 'A network engineer traces an outage back to something that was never meant to be found.' },
      { title: 'Compile Time', kind: 'series', blurb: 'Four developers race to ship a product before their startup runs out of runway.' },
      { title: 'Neon Protocol', kind: 'music', blurb: 'Synth-driven instrumentals for deep-focus coding sessions.' },
      { title: 'The Last Commit', kind: 'movie', blurb: 'A retiring maintainer decides who inherits the project the internet depends on.' },
      { title: 'Latency', kind: 'music', blurb: 'Glitchy, warm electronica built around field recordings from data centres.' },
      { title: 'Zero Day Diaries', kind: 'series', blurb: 'A docuseries following security researchers through a year of disclosures.' },
    ],
    takes: ['Just migrated our CI to run in under four minutes. Cache invalidation remains the hardest problem.', 'Hot take: the best developer tool is a README that is actually accurate.', 'Reading the new release notes so you do not have to: faster builds, fewer footguns.', 'Pair programming with a model is great until you realise you are reviewing a stranger\'s code.'],
    tags: ['#devlife', '#opensource', '#webdev', '#AI'],
  },
  sports: {
    subjects: ['The home side', 'A veteran striker', 'The national relay squad', 'A rookie quarterback', 'The league office', 'The defending champions', 'A young tennis prospect', 'The marathon organisers'],
    developments: ['seals a late comeback in front of a sell-out crowd', 'signs a long-term extension after a record season', 'revises its fixture schedule to cut travel', 'sets a personal best on a rain-soaked track', 'introduces new rules to speed up play', 'rests key players ahead of the knockout round', 'launches a community programme for local clubs', 'wins a tight final decided on the last possession'],
    recs: [
      { title: 'Final Whistle', kind: 'movie', blurb: 'A small-town club gets one season to prove it belongs in the top flight.' },
      { title: 'Split Times', kind: 'series', blurb: 'Behind the scenes with a middle-distance squad chasing national records.' },
      { title: 'Stadium Echoes', kind: 'music', blurb: 'Anthem-style tracks built for the walk from the tunnel to the pitch.' },
      { title: 'Overtime', kind: 'movie', blurb: 'Two rival coaches are forced to share one locker room.' },
      { title: 'Cadence', kind: 'music', blurb: 'Steady-tempo running mixes from 150 to 175 BPM.' },
      { title: 'The Long Game', kind: 'series', blurb: 'Golf, grudges and family legacy across one dramatic season.' },
    ],
    takes: ['That last-minute equaliser will be replayed for years. Absolute scenes.', 'Early morning run done. The first kilometre lies to you every single time.', 'Hot take: the fifth set tiebreak is the best format in sport.', 'Season ticket holders deserve better communication on fixture changes.'],
    tags: ['#matchday', '#running', '#teamwork', '#goal'],
  },
  finance: {
    subjects: ['Central bank officials', 'A regional lender', 'Index funds', 'The currency market', 'A fintech payments firm', 'Pension managers', 'Commodity traders', 'Retail investors'],
    developments: ['signal a cautious path on interest rates', 'report stronger-than-expected quarterly deposits', 'see record inflows as volatility eases', 'react to fresh inflation data with a narrow trading range', 'expand into three new markets after regulatory approval', 'shift allocation toward short-duration bonds', 'weigh supply forecasts as prices hold steady', 'turn to budgeting tools as living costs rise'],
    recs: [
      { title: 'Margin Call Mondays', kind: 'series', blurb: 'A dramatised look at one trading desk through a volatile quarter.' },
      { title: 'Compound', kind: 'movie', blurb: 'Two siblings inherit a failing brokerage and a very large secret.' },
      { title: 'Ticker Tape', kind: 'music', blurb: 'Minimal beats for reading earnings reports.' },
      { title: 'Soft Landing', kind: 'movie', blurb: 'An economist is asked to explain the unexplainable on live television.' },
      { title: 'The Float', kind: 'series', blurb: 'The inside story of a company going public against the odds.' },
      { title: 'Basis Points', kind: 'music', blurb: 'Jazz trio sessions recorded in the quiet hours after market close.' },
    ],
    takes: ['Reminder: diversification is the only free lunch, and it is still on the menu.', 'Paid off the last card this month. Boring finance wins.', 'Reading the rate decision statement twice and still unsure what they meant.', 'Index funds, automatic contributions, patience. That is the whole post.'],
    tags: ['#markets', '#investing', '#personalfinance', '#money'],
  },
  entertainment: {
    subjects: ['A festival headliner', 'The streaming platform', 'An indie studio', 'A celebrated director', 'The awards committee', 'A debut novelist', 'The late-night host', 'A touring orchestra'],
    developments: ['announces a surprise album alongside a global tour', 'greenlights a second season after record viewership', 'premieres its new feature to a standing ovation', 'reveals the shortlist after a record number of submissions', 'brings its stage production to a wider audience', 'releases a behind-the-scenes documentary', 'adds extra dates after tickets sell out in minutes', 'returns to its roots with a low-budget thriller'],
    recs: [
      { title: 'Paper Lanterns', kind: 'movie', blurb: 'A quiet drama about three generations preparing a festival dinner.' },
      { title: 'Understudy', kind: 'series', blurb: 'A backstage comedy about the person who never gets the spotlight.' },
      { title: 'Golden Hour Sessions', kind: 'music', blurb: 'Acoustic live recordings captured just before sunset.' },
      { title: 'Cold Open', kind: 'movie', blurb: 'A sketch-show writer discovers her jokes are coming true.' },
      { title: 'Velvet Static', kind: 'music', blurb: 'Dream-pop with a vintage tape sound.' },
      { title: 'Curtain Call', kind: 'series', blurb: 'Eight episodes, one theatre, and a last season nobody wants to end.' },
    ],
    takes: ['That finale was perfect. I need a week to recover.', 'Rewatching old favourites hits different when you notice the details.', 'Queueing up the soundtrack for the third time today. No regrets.', 'If you only watch one thing this month, make it the quiet one.'],
    tags: ['#nowwatching', '#newmusic', '#film', '#binge'],
  },
  business: {
    subjects: ['A logistics group', 'The retail chain', 'An energy utility', 'A mid-size manufacturer', 'Founders of a climate startup', 'The airline', 'A global consultancy', 'The housing developer'],
    developments: ['restructures regional operations to cut delivery times', 'reports a profit rebound after a difficult year', 'announces a hiring drive for new engineering hubs', 'agrees to acquire a smaller rival for an undisclosed sum', 'moves to a four-day week trial across all offices', 'secures new funding to scale production', 'responds to supply-chain delays with local sourcing', 'unveils a leadership change effective next quarter'],
    recs: [
      { title: 'The Pivot', kind: 'movie', blurb: 'A failing startup has seventy-two hours to reinvent itself.' },
      { title: 'Open Plan', kind: 'series', blurb: 'A workplace comedy about the most efficient office in the world.' },
      { title: 'Boardroom Beats', kind: 'music', blurb: 'Light instrumental tracks for long planning days.' },
      { title: 'Due Diligence', kind: 'movie', blurb: 'An acquisition goes sideways when the books do not balance.' },
      { title: 'Scale', kind: 'series', blurb: 'Follow ten founders through their first serious year of growth.' },
      { title: 'Supply & Demand', kind: 'music', blurb: 'Mellow lo-fi grooves for inbox-zero afternoons.' },
    ],
    takes: ['Meetings that could have been a document: a thread.', 'Customer interviews beat dashboards for finding what to build next.', 'Our small team shipped more by deleting half the roadmap.', 'The best onboarding doc is the one a new hire helped write.'],
    tags: ['#startup', '#leadership', '#strategy', '#work'],
  },
  science: {
    subjects: ['Astronomers', 'A marine biology team', 'Climate modellers', 'Materials scientists', 'Neuroscience researchers', 'A deep-space probe', 'Geologists', 'Particle physicists'],
    developments: ['detect a faint signal from a distant exoplanet', 'catalogue dozens of previously unknown deep-sea species', 'refine projections for regional rainfall patterns', 'develop a battery coating that lasts three times longer', 'map how memory forms during sleep', 'send back its sharpest images of an icy moon', 'trace an ancient volcanic event through ice cores', 'report a result that tightens limits on dark matter models'],
    recs: [
      { title: 'Event Horizon Hours', kind: 'series', blurb: 'A narrated tour of the biggest unanswered questions in physics.' },
      { title: 'Deep Blue Silence', kind: 'movie', blurb: 'A research submersible loses contact at the bottom of the ocean.' },
      { title: 'Spectrum', kind: 'music', blurb: 'Ambient textures inspired by radio-telescope recordings.' },
      { title: 'The Long Winter Core', kind: 'movie', blurb: 'A glaciologist reads the planet\'s memory frozen in ice.' },
      { title: 'Half-Life', kind: 'music', blurb: 'Slow, decaying piano loops for late-night reading.' },
      { title: 'Field Notes', kind: 'series', blurb: 'Ten short films following scientists in remote research stations.' },
    ],
    takes: ['New preprint just dropped and the figures are gorgeous. Reading closely.', 'Peer review is slow because careful is slow. Both are fine.', 'Looked up at the night sky and felt very small in a good way.', 'Shout-out to the grad students who ran the overnight observations.'],
    tags: ['#science', '#space', '#research', '#climate'],
  },
  health: {
    subjects: ['Sleep researchers', 'A public-health agency', 'Nutrition scientists', 'The hospital network', 'Physiotherapists', 'A large cohort study', 'Mental-health charities', 'Cardiologists'],
    developments: ['link consistent bedtimes to better daytime focus', 'launch a vaccination reminder service for families', 'find modest gains from a Mediterranean-style diet', 'cut waiting times with a new triage approach', 'recommend short walking breaks for desk workers', 'follow 40,000 adults to understand long-term outcomes', 'expand free counselling in schools and workplaces', 'update guidance on blood-pressure checks at home'],
    recs: [
      { title: 'Vital Signs', kind: 'series', blurb: 'A documentary series inside a busy city hospital.' },
      { title: 'Breathe Out', kind: 'movie', blurb: 'A marathon runner rebuilds her life after a diagnosis.' },
      { title: 'Slow Pulse', kind: 'music', blurb: 'Gentle 60 BPM playlists for winding down.' },
      { title: 'The Waiting Room', kind: 'movie', blurb: 'Six strangers, one delayed clinic, and a lot of honesty.' },
      { title: 'Rest Day', kind: 'music', blurb: 'Soft acoustic guitar for stretching and recovery.' },
      { title: 'Small Habits', kind: 'series', blurb: 'Experts test whether tiny daily changes really add up.' },
    ],
    takes: ['Ten-minute walk after lunch is the cheapest productivity hack I know.', 'Hydration check. Go drink some water. You are welcome.', 'Sleep is not a luxury. Close the laptop.', 'Therapy is maintenance, not emergency repair. Normalise it.'],
    tags: ['#wellness', '#sleep', '#mentalhealth', '#fitness'],
  },
};

const NEWS_SOURCES = ['The Daily Ledger', 'Meridian Wire', 'Northline Report', 'Harbor Courier', 'Atlas Press'];
const AUTHORS = ['Priya Nair', 'Marcus Webb', 'Elena Rossi', 'Tomás Herrera', 'Aiko Tanaka', 'Samuel Okoye', 'Leah Brandt'];
const HANDLES = ['@nova.codes', '@raya_runs', '@ledgerlily', '@frame_by_frame', '@opsonmondays', '@stargazer_k', '@wellwithwen', '@tinkerpat', '@kickoff_kai', '@pennywise_p'];
const MUSIC_SOURCES = ['Resonance', 'Tidewave', 'Open Air Records'];
const VIDEO_SOURCES = ['Lumen+', 'Cinema Archive', 'Northlight TV'];

const COUNT_PER_CATEGORY = 36;
/** Anchor so timestamps are stable relative to "now" but items keep consistent spacing. */
function publishedAt(index: number, salt: number, now: number): string {
  const spread = (index * 5 + (salt % 4)) * HOUR + (salt % 50) * 60_000;
  return new Date(now - spread).toISOString();
}

function placeholder(category: Category, seed: string, kind: string): string {
  return `/api/placeholder?c=${category}&s=${encodeURIComponent(seed)}&k=${kind}`;
}

function buildNews(category: Category, now: number): NewsItem[] {
  const seed = SEEDS[category];
  const items: NewsItem[] = [];
  for (let i = 0; i < COUNT_PER_CATEGORY; i++) {
    const subject = seed.subjects[i % seed.subjects.length];
    const dev = seed.developments[(Math.floor(i / seed.subjects.length) + i * 3) % seed.developments.length];
    const id = `news:${category}-${i}`;
    const h = hash(id);
    items.push({
      id,
      type: 'news',
      title: `${subject} ${dev}`,
      description: `${subject} ${dev}. Analysts say the move reflects wider ${category} trends, with more detail expected in the coming weeks.`,
      image: placeholder(category, id, 'news'),
      category,
      source: NEWS_SOURCES[h % NEWS_SOURCES.length],
      author: AUTHORS[(h >> 3) % AUTHORS.length],
      url: `https://example.com/news/${category}/${i}`,
      publishedAt: publishedAt(i, h, now),
      trendScore: 40 + (h % 60),
    });
  }
  return items;
}

function buildRecommendations(category: Category, now: number): RecommendationItem[] {
  const seed = SEEDS[category];
  const items: RecommendationItem[] = [];
  for (let i = 0; i < COUNT_PER_CATEGORY; i++) {
    const base = seed.recs[i % seed.recs.length];
    const volume = Math.floor(i / seed.recs.length);
    const id = `recommendation:${category}-${i}`;
    const h = hash(id);
    const title = volume === 0 ? base.title : `${base.title}${volume === 1 ? ': Director\'s Cut' : ` ${volume + 1}`}`;
    items.push({
      id,
      type: 'recommendation',
      mediaKind: base.kind,
      title,
      description: base.blurb,
      image: placeholder(category, id, 'rec'),
      category,
      source: base.kind === 'music' ? MUSIC_SOURCES[h % MUSIC_SOURCES.length] : VIDEO_SOURCES[h % VIDEO_SOURCES.length],
      url: `https://example.com/watch/${category}/${i}`,
      publishedAt: publishedAt(i, h, now),
      rating: Math.round((6 + (h % 35) / 10) * 10) / 10,
      trendScore: 35 + (h % 65),
    });
  }
  return items;
}

function buildSocial(category: Category, now: number): SocialPost[] {
  const seed = SEEDS[category];
  const items: SocialPost[] = [];
  for (let i = 0; i < COUNT_PER_CATEGORY; i++) {
    const id = `social:${category}-${i}`;
    const h = hash(id);
    const take = seed.takes[i % seed.takes.length];
    const tags = [seed.tags[i % seed.tags.length], seed.tags[(i + 1) % seed.tags.length]];
    const handle = HANDLES[h % HANDLES.length];
    items.push({
      id,
      type: 'social',
      title: take,
      description: `${tags.join(' ')} • ${handle}`,
      image: i % 3 === 0 ? placeholder(category, id, 'social') : null,
      category,
      source: 'Chirp',
      handle,
      hashtags: tags,
      likes: 20 + (h % 9800),
      url: `https://example.com/post/${category}/${i}`,
      publishedAt: publishedAt(i, h, now),
      trendScore: 30 + (h % 70),
    });
  }
  return items;
}

const cache = new Map<string, ContentItem[]>();

/** Full, newest-first catalogue for one type across the given categories. */
export function getCatalogue(type: ContentItem['type'], categories: Category[], now = Date.now()): ContentItem[] {
  // Bucket "now" to the hour so ids/timestamps stay stable across requests.
  const bucket = Math.floor(now / HOUR) * HOUR;
  const cats = categories.length ? categories : [...CATEGORIES];
  const all: ContentItem[] = [];
  for (const category of cats) {
    const key = `${type}:${category}:${bucket}`;
    let built = cache.get(key);
    if (!built) {
      built = type === 'news' ? buildNews(category, bucket) : type === 'recommendation' ? buildRecommendations(category, bucket) : buildSocial(category, bucket);
      cache.set(key, built);
      if (cache.size > 120) cache.delete(cache.keys().next().value as string);
    }
    all.push(...built);
  }
  return all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/**
 * Simulates a live stream: one fresh item per type per time window, created on demand.
 * Item ids are stable inside a window, so repeated polls dedupe correctly.
 */
export function getLiveItems(categories: Category[], now = Date.now(), windowMs = 30_000): ContentItem[] {
  const cats = categories.length ? categories : [...CATEGORIES];
  const bucket = Math.floor(now / windowMs);
  const category = cats[bucket % cats.length];
  const seed = SEEDS[category];
  const stamp = new Date(bucket * windowMs).toISOString();
  const h = hash(`live-${bucket}`);
  const post: SocialPost = {
    id: `social:live-${bucket}`,
    type: 'social',
    title: seed.takes[h % seed.takes.length],
    description: `${seed.tags[0]} • ${HANDLES[h % HANDLES.length]}`,
    image: null,
    category,
    source: 'Chirp',
    handle: HANDLES[h % HANDLES.length],
    hashtags: [seed.tags[0], seed.tags[1]],
    likes: h % 300,
    url: `https://example.com/post/${category}/live-${bucket}`,
    publishedAt: stamp,
    trendScore: 55,
  };
  return [post];
}

export function matchesQuery(item: ContentItem, q: string): boolean {
  const needle = q.toLowerCase();
  const hay = [item.title, item.description, item.category, item.source, item.type === 'social' ? item.hashtags.join(' ') : ''].join(' ').toLowerCase();
  return needle.split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
}
