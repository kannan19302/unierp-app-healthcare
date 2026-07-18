## Summary

Closes #

## Checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm bundle:validate` passes
- [ ] `pnpm test:contract` passes
- [ ] Endpoint changes stay within the `/api/v1/ext/healthcare/*` contract (tenant-context token honored)
- [ ] Prisma migration added if the schema changed, and `prisma:deploy` verified
- [ ] Bundle manifest version bumped if the marketplace-facing bundle changed

## How was this tested?
