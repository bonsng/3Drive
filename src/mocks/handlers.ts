import { http, HttpResponse } from 'msw';
import { mockBackendResponse } from './data';

export const handlers = [
  http.get('/api/files', () => {
    return HttpResponse.json(mockBackendResponse);
  }),
];
