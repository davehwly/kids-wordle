# kids-wordle

## Release / testing governance

- Before deploy: `npm run lint` and `npm run build`
- Manual smoke test:
  - green/yellow/gray scoring correct
  - on-screen keyboard updates
  - play again works
  - mobile layout OK
  - no console errors
- Only then: `npx vercel --prod --yes --token $VERCEL_TOKEN`
