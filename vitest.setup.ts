import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const mockSessionResponse = {
  user: null,
  expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
};

const mockLogResponse = { ok: true };

vi.stubGlobal('fetch', vi.fn(async (url: string | URL | Request) => {
  const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
  if (urlStr.includes('/api/auth/session')) {
    return new Response(JSON.stringify(mockSessionResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (urlStr.includes('/api/auth/_log')) {
    return new Response(JSON.stringify(mockLogResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(null, { status: 404 });
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    message: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
    custom: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}));

if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  }

  if (!window.ResizeObserver) {
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.ResizeObserver = ResizeObserver as unknown as typeof ResizeObserver;
  }
}

if (typeof Element !== 'undefined') {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
}
