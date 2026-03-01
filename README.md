This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Elasticsearch Product Search

Product search (`/api/products`) and autocomplete (`/api/products/autocomplete`) can use Elasticsearch when configured.

Set these environment variables:

- `ELASTICSEARCH_URL` (required to enable Elasticsearch)
- `ELASTICSEARCH_INDEX` (optional, defaults to `products`)
- `ELASTICSEARCH_API_KEY` (optional)
- `ELASTICSEARCH_USERNAME` and `ELASTICSEARCH_PASSWORD` (optional alternative to API key)

If Elasticsearch is not configured (or unavailable), the API automatically falls back to PostgreSQL-based search.

### Self-hosted free setup (production)

This project can use self-hosted Elasticsearch on the free Basic tier.

1. Create your Elasticsearch env file:

```bash
cp .env.elasticsearch.example .env.elasticsearch
```

2. Edit `.env.elasticsearch` and set a strong `ELASTIC_PASSWORD`.

3. Start Elasticsearch:

```bash
docker compose --env-file .env.elasticsearch -f docker-compose.elasticsearch.yml up -d
```

4. Configure app env (`.env` / `.env.production`):

```env
ELASTICSEARCH_URL=http://127.0.0.1:9200
ELASTICSEARCH_INDEX=products
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your_strong_password
```

5. Reindex products:

```bash
npm run es:reindex
```

6. Verify:

```bash
curl -u elastic:your_strong_password http://127.0.0.1:9200/_cluster/health?pretty
```

Production notes:
- Keep port `9200` private (VPN/VPC/firewall); do not expose publicly.
- Use HTTPS/TLS if Elasticsearch is accessed across hosts/networks.
- Keep backups via snapshots (`es_snapshots` volume is mounted for repository path).

### Reindex products into Elasticsearch

After setting Elasticsearch env vars, run:

```bash
npm run es:reindex
```

This script will:
- create the Elasticsearch index (if it does not exist)
- read products from PostgreSQL
- bulk index them into Elasticsearch
