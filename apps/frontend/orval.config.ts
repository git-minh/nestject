import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: 'http://localhost:3001/api-json',
    output: {
      mode: 'tags-split',
      target: 'src/lib/api/generated.ts',
      schemas: 'src/lib/api/model',
      client: 'react-query',
      prettier: true,
    },
  },
});
