import { portfolioApi } from './api';

afterEach(() => { delete process.env.REACT_APP_CONTENT_PREVIEW; jest.restoreAllMocks(); });
test('preview blocks authentication and writes before making requests', async () => {
  process.env.REACT_APP_CONTENT_PREVIEW = 'true';
  const original = global.fetch;
  const fetch = jest.fn();
  global.fetch = fetch;
  try {
    await expect(portfolioApi.saveContent({}, 'token')).rejects.toThrow('read-only');
    await expect(portfolioApi.loginWithGoogle('credential')).rejects.toThrow('read-only');
    await expect(portfolioApi.getSession('token')).rejects.toThrow('read-only');
    expect(fetch).not.toHaveBeenCalled();
  } finally { global.fetch = original; }
});
