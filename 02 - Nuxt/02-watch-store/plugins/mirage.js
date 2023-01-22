import { makeServer } from '@/miragejs/server';

if (process.env.NODE_ENV === 'development') {
  makeServer();
}
