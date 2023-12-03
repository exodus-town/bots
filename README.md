# bots

To install dependencies:

```bash
bun install
```

To generate the OAuth token (this needs to be done once or whenever the token expires)

```bash
bun run login
```

To run the bot

```bash
bun run twitter
```

The bot is run every hour by a GitHub action, and when it detects that an auction has been settled, it posts a tweet with the details of the auction (winner, bid amount, parcel, and the treasury).
