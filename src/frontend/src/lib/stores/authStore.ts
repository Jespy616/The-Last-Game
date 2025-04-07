import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface AuthState {
  token: string | null;
}

const initialToken = browser ? localStorage.getItem('token') : null;

export const authStore = writable<AuthState>({
  token: initialToken
});

authStore.subscribe((value) => {
  if (browser) {
    if (value?.token) {
      localStorage.setItem('token', value.token);
    } else {
      localStorage.removeItem('token');
    }
  }
});
