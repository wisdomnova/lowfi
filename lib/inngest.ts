import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'lowfi',
  name: 'Lowfi Campaign System',
  retryPolicy: {
    initialDelayMs: 500,
    maxAttempts: 3,
    multiplier: 2,
  },
});

export default inngest;
