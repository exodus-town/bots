# Exodus Town - Bots

To install dependencies:

```bash
bun install
```

### Twitter

To generate the initial access token and refresh token (this needs to be done once or whenever the tokens expire):

```bash
bun run login
```

To run the bot:

```bash
bun run twitter
```

The bot is ran every hour by a GitHub action to refresh its access tokens, and when it detects that an auction has been settled, it posts a tweet with the details of the auction (winner, bid amount, parcel, and the treasury).
