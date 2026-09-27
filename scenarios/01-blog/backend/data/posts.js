export const posts = [
  // John's posts (primary user)
  {
    title: 'Getting Started with React Hooks',
    content: `React Hooks changed the way we write components. Before Hooks, sharing stateful logic between components meant higher-order components or render props, both of which made component trees harder to read.

## Why Hooks?

Hooks let you use state and other React features without writing a class. The two you will reach for most often are \`useState\` and \`useEffect\`.

\`\`\`js
const [count, setCount] = useState(0);

useEffect(() => {
  document.title = \`You clicked \${count} times\`;
}, [count]);
\`\`\`

## Rules of Hooks

There are two rules you must follow:

- Only call Hooks at the top level. Never call them inside loops, conditions, or nested functions.
- Only call Hooks from React function components or from custom Hooks.

## Building a Custom Hook

Custom Hooks are just functions whose names start with \`use\`. They let you extract component logic into reusable functions. A \`useFetch\` hook, for example, can wrap the loading, error, and data states that every data-fetching component needs.

Start small: convert one class component to a function component with Hooks, and you will quickly see how much boilerplate disappears.`,
    excerpt: 'React Hooks changed the way we write components. Learn useState, useEffect, and how to build your own custom Hooks.',
    category: 'Technology',
    tags: ['React', 'JavaScript', 'Web Development', 'Hooks'],
    readTime: 8,
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-01-15T09:00:00.000Z'
  },
  {
    title: 'The Future of Web Development',
    content: `The web platform is evolving faster than at any point in the last decade. Three forces are shaping where it goes next: AI-assisted development, WebAssembly, and the return of the server.

## AI in the Developer Workflow

Code assistants have moved from autocomplete toys to genuine pair programmers. The developers who benefit most are the ones who treat suggestions as drafts to review, not answers to accept.

## WebAssembly Grows Up

WebAssembly started as a way to run C++ in the browser. Today it powers photo editors, CAD tools, and entire language runtimes. With the component model maturing, Wasm is becoming a universal plugin format that runs anywhere.

## The Server Strikes Back

After years of shipping ever-larger JavaScript bundles, frameworks are moving rendering back to the server. Islands, streaming, and server components all share one goal: send less JavaScript to the client.

## What Should You Learn?

Fundamentals age slowly. HTTP, accessibility, and the DOM will outlive every framework on this list. Learn one framework deeply, and let the fundamentals transfer.`,
    excerpt: 'AI-assisted development, WebAssembly, and server-first frameworks are reshaping how we build for the web.',
    category: 'Technology',
    tags: ['Web Development', 'AI', 'Future Tech', 'WebAssembly'],
    readTime: 10,
    createdAt: '2024-03-02T10:30:00.000Z',
    updatedAt: '2024-03-02T10:30:00.000Z'
  },
  {
    title: 'Building Scalable Microservices',
    content: `Microservices promise independent deployment and scaling, but they trade code complexity for operational complexity. Here is what actually matters when you split a monolith.

## Start with the Data

The hardest part of microservices is not the services, it is the data. Each service must own its data completely. If two services write to the same table, you have a distributed monolith.

## Communication Patterns

- **Synchronous (REST, gRPC):** simple to reason about, but couples availability. If service B is down, service A fails too.
- **Asynchronous (queues, events):** decouples availability and smooths load spikes, at the cost of eventual consistency.

A good rule: commands can be synchronous, notifications should be asynchronous.

## Observability is Not Optional

With one service, a stack trace tells the story. With thirty, you need distributed tracing, structured logs with correlation IDs, and dashboards per service. Build this in from day one.

## When Not to Use Microservices

A small team shipping a young product almost always moves faster with a well-modularised monolith. Split when team boundaries, not technology preferences, demand it.`,
    excerpt: 'Microservices trade code complexity for operational complexity. Data ownership, communication patterns, and observability decide whether the trade pays off.',
    category: 'Technology',
    tags: ['Microservices', 'Architecture', 'Backend', 'Scalability'],
    readTime: 12,
    createdAt: '2024-04-18T14:15:00.000Z',
    updatedAt: '2024-04-18T14:15:00.000Z'
  },
  // Sarah's posts
  {
    title: 'Hidden Gems of Southeast Asia',
    content: `Everyone knows Bangkok, Bali, and Ha Long Bay. After six months of slow travel through the region, these are the places I keep telling friends about instead.

## Kampot, Cambodia

A sleepy riverside town famous for its pepper farms. Rent a scooter, ride into the Bokor hills in the morning, and watch the fishing boats come home at sunset. The salt fields at golden hour are unforgettable.

## Hpa-An, Myanmar

Limestone karsts rise straight out of the rice paddies. The caves around town hide thousand-year-old Buddha carvings, and the sunrise from Mount Zwegabin is worth the 2 a.m. alarm.

## Siquijor, Philippines

The locals call it the island of witches. What you will actually find: empty white beaches, waterfalls with rope swings, and the friendliest homestays in the country.

## Practical Tips

- Travel in shoulder season (May–June or September–October) for fewer crowds and better prices.
- Book nothing more than two days ahead. The best recommendations come from other travellers at breakfast.
- Learn ten words of the local language. It changes every interaction.`,
    excerpt: 'Skip the tourist trail. Kampot, Hpa-An, and Siquijor are the Southeast Asian stops I recommend to every traveller.',
    category: 'Travel',
    tags: ['Travel', 'Southeast Asia', 'Adventure', 'Backpacking'],
    readTime: 7,
    createdAt: '2024-02-10T08:45:00.000Z',
    updatedAt: '2024-02-10T08:45:00.000Z'
  },
  {
    title: 'Solo Travel: Self-Discovery',
    content: `I booked my first solo trip after a difficult year, expecting loneliness. What I found instead was the most useful education I have ever had.

## You Learn to Trust Yourself

When there is nobody else to read the map, negotiate the taxi fare, or decide whether the street food stall looks safe, you discover you are far more capable than you thought. Every small decision builds evidence.

## Discomfort is the Point

The nights that went wrong — the missed bus in Laos, the flooded guesthouse in Vietnam — are the stories I tell most often. Comfort teaches nothing. A manageable amount of chaos teaches everything.

## Solitude is Not Loneliness

Eating dinner alone felt awkward for exactly two days. Then it became a luxury: nobody else's schedule, nobody else's preferences, a book and a bowl of noodles and nowhere to be.

## Practical Advice for First-Timers

- Start with a country where solo travel is common: Thailand, Portugal, Japan.
- Stay in guesthouses or hostels with common areas. Company is always available when you want it.
- Tell someone at home your rough route, then let the route change.

You do not find yourself on the road. You build yourself, one decision at a time.`,
    excerpt: 'Solo travel is not about finding yourself. It is about building yourself, one small decision at a time.',
    category: 'Travel',
    tags: ['Travel', 'Adventure', 'Personal Growth', 'Tips'],
    readTime: 6,
    createdAt: '2024-05-06T16:20:00.000Z',
    updatedAt: '2024-05-06T16:20:00.000Z'
  },
  // Mike's posts
  {
    title: 'The Art of Perfect Pasta',
    content: `After a decade of reviewing Italian restaurants and three trips to Bologna, I am convinced most home cooks are two small changes away from restaurant-quality pasta.

## Salt the Water Properly

The water should taste like the sea — roughly one tablespoon of salt per litre. It is your only chance to season the pasta itself, and it is the difference between bland and balanced.

## Undercook, Then Finish in the Sauce

Pull the pasta two minutes before the packet says. Transfer it to the sauce with a cup of the starchy cooking water and finish it there. The starch emulsifies the sauce so it clings instead of pooling.

## Match the Shape to the Sauce

- **Long and thin (spaghetti, linguine):** oil-based and light tomato sauces.
- **Ribbons (tagliatelle, pappardelle):** rich ragùs that drape over the strands.
- **Tubes and shells (rigatoni, orecchiette):** chunky sauces that hide inside.

## The Cheese Rule

Grate it fresh, add it off the heat, and never on seafood pasta. A Bolognese nonna once watched me reach for parmesan over vongole and simply took the bowl away.

Perfect pasta is not about fancy ingredients. It is about respecting the few you have.`,
    excerpt: 'Two small changes — properly salted water and finishing pasta in the sauce — separate home cooking from restaurant quality.',
    category: 'Food',
    tags: ['Food', 'Cooking', 'Italian', 'Pasta'],
    readTime: 9,
    createdAt: '2024-03-21T12:00:00.000Z',
    updatedAt: '2024-03-21T12:00:00.000Z'
  },
  {
    title: 'Street Food Adventures in Bangkok',
    content: `Bangkok's best kitchen has no walls. Over two weeks I ate a hundred street meals across the city, and these are the stalls and dishes worth crossing town for.

## Where to Go

- **Yaowarat (Chinatown) after dark:** the neon-lit heart of Bangkok street food. Follow the longest queue; it is always right.
- **Or Tor Kor market:** technically a market, spiritually a temple to Thai produce. The mango sticky rice here ruined every other version for me.
- **Wang Lang, across the river:** where students and hospital staff eat. Half the price of tourist areas, twice the chilli.

## What to Order

Start with the classics done properly: pad kra pao with a crispy egg, boat noodles rich with star anise, and som tam pounded to order. Then get adventurous — grilled river prawns, khao soi from the northern stalls, durian if you dare.

## Street Food Rules

- Eat where the turnover is high. Busy stalls mean fresh ingredients.
- Point at what someone else is having. Menus are optional; curiosity is not.
- Carry small notes. A 1000-baht bill at a 40-baht noodle stall helps nobody.

The best meal of my trip cost 60 baht and was served on a plastic stool beside a motorway. That is Bangkok.`,
    excerpt: 'A hundred street meals across Bangkok, distilled: where to go, what to order, and the unwritten rules of eating on plastic stools.',
    category: 'Food',
    tags: ['Food', 'Travel', 'Street Food', 'Thailand'],
    readTime: 6,
    createdAt: '2024-06-12T18:30:00.000Z',
    updatedAt: '2024-06-12T18:30:00.000Z'
  },
  // Emma's posts
  {
    title: 'Morning Routines for a Productive Day',
    content: `The first hour of your day sets the tone for the other twenty-three. After testing a dozen morning routines over two years, here is what actually survived contact with real life.

## Win Before Your Phone Does

The single highest-impact change: no phone for the first thirty minutes. The moment you open a notification, you are reacting to someone else's priorities instead of setting your own.

## The 3-3-3 Framework

My mornings now follow three blocks of roughly three activities:

- **Body:** a glass of water, five minutes of stretching, daylight on your face.
- **Mind:** three lines of journalling, one page of reading, a look at today's top task.
- **Momentum:** make the bed, tidy one surface, start the most important task before checking email.

## Consistency Beats Intensity

A 5 a.m. ice bath routine you abandon after nine days is worth less than a gentle twenty-minute routine you keep for a year. Design for your worst morning, not your best.

## When It Falls Apart

It will. Travel, sick kids, late nights. The routine is not the streak; it is the default you return to. Missing a day is data, not failure.`,
    excerpt: 'No phone for thirty minutes, the 3-3-3 framework, and designing for your worst morning instead of your best.',
    category: 'Lifestyle',
    tags: ['Lifestyle', 'Productivity', 'Wellness', 'Habits'],
    readTime: 5,
    createdAt: '2024-04-30T07:10:00.000Z',
    updatedAt: '2024-04-30T07:10:00.000Z'
  },
  {
    title: 'Digital Minimalism: Reclaiming Your Attention',
    content: `I deleted every social app from my phone for thirty days. This is a draft of what I learned, and the system I am building to keep the benefits without becoming a hermit.

## The Experiment

Week one felt like phantom limb syndrome — I reached for apps that were not there dozens of times a day. By week three, my average screen time had dropped from five hours to ninety minutes, and I had read four books.

## What I Actually Missed

Almost nothing. Two group chats and my sister's photos. That was the honest total. The other four hours a day were algorithmic filler I did not choose and could not remember.

## The System I Am Keeping

- Social apps live on the laptop only, behind a bookmark, not an icon.
- The phone home screen holds exactly six tools: camera, maps, messages, music, notes, bank.
- One "open scroll" session on Sunday evenings, with a timer.

## Still Working On

Boredom tolerance. The urge to fill every queue and lift ride with input runs deep. Sitting with an unstimulated mind for five minutes is still genuinely hard, which is probably the strongest argument for practising it.`,
    excerpt: 'Thirty days without social apps: screen time down from five hours to ninety minutes, four books read, and a system for keeping it that way.',
    category: 'Lifestyle',
    tags: ['Lifestyle', 'Minimalism', 'Technology', 'Mindfulness'],
    readTime: 7,
    published: false,
    createdAt: '2024-07-08T20:00:00.000Z',
    updatedAt: '2024-07-08T20:00:00.000Z'
  }
];
