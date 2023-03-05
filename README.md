
# Welcome to Broadcstr!
## What is Broadcstr?

Broadcstr is the social media that you control and define the boundaries.  

#### You can experience it right now! Already deployed in https://www.broadcstr.com !

It is built using **Nostr**: A simple, open protocol that enables a truly censorship-resistant and global social network.  

## Why Broadcstr?

Because it is like your social network, but:  

- **Private**: Your account doesn't require e-mails or phone numbers. Start just with your pair of keys;
- **Decentralized**: Censorship resistance means no Big Techs! You control where your consume and post information;
- **Value4Value**: Reward your favorite content with Bitcoin Lightning Network! Tip and stack sats;
- **Encrypted**: Content are signed with the private key that only you have! And direct messages are encrypted with the same key. No one will ever get into your messages without your authorization. Ever;

## Version info:

**Version 0.3 - Updates and fixes!**
- ⚡ ZAPS! First implementation of zaps! Show total zaps of notes and zap others;
- Localization: Localization structure and preparation;
- Likes/Replies/Zaps: Showing like/replies/zaps amount in feeds (still experimental);
- Anonymous navigation: Navigation without a npub/nsec/extension (with limited options);
- Reviewed cache: Changed how state is stored and loaded from/to cache;
- Fixes: Minor fixes and adjustments;

**Version 0.2 - Updates and fixes!**
- New Welcome/Account/Login flow: Cleaner and simpler login and new account flow to reduce complexity for the new user;
- New "For You" feed, to improve content diversity on the home screen;
- Latest profile information: Fixed a bug where old profile information was replacing newer profile information;
- Image view: Added a feature to expand image clicking on it for better readability;
- Searching for nip-05: Querying domains in nip-05 search for faster return;
- Longer notes: Automatic collapsing longer content and allowing to expand/collapse it;
- Pagination fixes: Improved pagination on some views;
- Small fixes: And other small fixes;

**Version 0.1.2!**

- Fixed profile view not showing reposts;
- Improved UX and feedback on reposts;
- Fixed topbar icons breaking line on some phones;
- Reviewed note rendering to better support links and line breaks;
- Browser extension login fix for some users;

**Version 0.1.1!**

- Implemented login and event signing with extension (nos2x);

**Version 0.1.0 - First Release!**

#### Main features/nips implemented on this version:

- Basic Navigation: Following feed, Profiles, Note details and replies;
- Basic interaction: Like notes, reply to notes, repost notes;
- Account Settings: Manage session and your keys;
- Profile editing: Update your profile details and publish on the network;
- Relay preferences: Manage relays and which of them you want to read/write;
- Basic Search: Search for users using handles/username or NIP-05 and search content with #hashtags;
- And, of course, Dark Mode! Cause we can't live without dark mode;

### Suported / To be supported NIPs: (refer to https://github.com/nostr-protocol/nips):

- [x] NIP-01: Basic protocol flow description;
- [x] NIP-02: Contact List and Petnames;
- [ ] NIP-03: OpenTimestamps Attestations for Events;
- [ ] NIP-03: NIP-04: Encrypted Direct Message;
- [x] NIP-05: Mapping Nostr keys to DNS-based internet identifiers;
- [ ] NIP-06: Basic key derivation from mnemonic seed phrase;
- [x] NIP-07: window.nostr capability for web browsers;
- [x] NIP-08: Handling Mentions;
- [ ] NIP-09: Event Deletion;
- [ ] NIP-10: Conventions for clients' use of e and p tags in text events;
- [ ] NIP-12: Generic Tag Queries (partial);
- [ ] NIP-13: Proof of Work;
- [ ] NIP-14: Subject tag in text events.;
- [ ] NIP-15: End of Stored Events Notice;
- [ ] NIP-16: Event Treatment;
- [x] NIP-19: bech32-encoded entities;
- [ ] NIP-20: Command Results (partial);
- [ ] NIP-21: nostr: URL scheme;
- [ ] NIP-22: Event created_at Limits;
- [ ] NIP-23: Long-form Content;
- [x] NIP-25: Reactions;
- [x] NIP-25: Reactions;
- [ ] NIP-26: Delegated Event Signing;
- [ ] NIP-28: Public Chat;
- [ ] NIP-33: Parameterized Replaceable Events;
- [ ] NIP-36: Sensitive Content;
- [ ] NIP-40: Expiration Timestamp;
- [ ] NIP-42: Authentication of clients to relays;
- [ ] NIP-46: Nostr Connect;
- [ ] NIP-50: Keywords filter (partial);
- [ ] NIP-56: Reporting;
- [x] NIP-57: Lightning Zaps
- [ ] NIP-58: Badges;
- [ ] NIP-65: Relay List Metadata;
- [ ] NIP-78: Application-specific data;

### More info:

#### Creator:

**Fábio Luiz**
Github: https://github.com/fluizsp

### Support development:

Wants to support development? Send me some Sats :) ⚡fluizsp@getalby.com

Released under MIT license.

About Nostr!

Want to know more about Nostr? Start here

### Stack
Broadcstr was built using React.js with create-react-app and Chakra-ui.

Using https://github.com/nbd-wtf/nostr-tools for nostr requests/websocket connectivity.

Improving code each release. Still in Alpha.

### Available Scripts

  

In the project directory, you can run:

  

#### `npm start`

  

Runs the app in production/optimized mode, using the app on the build folder.<br  />

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

  

The page will reload if you make edits.<br  />

You will also see any lint errors in the console.

  

#### `npm run dev`

  

Runs the app in the development mode.<br  />

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

  

The page will reload if you make edits.<br  />

You will also see any lint errors in the console.

  

#### `npm test`

  

Launches the test runner in the interactive watch mode.<br  />

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

  

#### `npm run build`

  

Builds the app for production to the `build` folder.<br  />

It correctly bundles React in production mode and optimizes the build for the best performance.

  

The build is minified and the filenames include the hashes.<br  />

Your app is ready to be deployed!

  

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

  

### `npm run eject`

  

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

  

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

  

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

  

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
