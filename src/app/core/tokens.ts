import { InjectionToken, inject } from '@angular/core';

// 1. The Base URL Token
// This token will be used to inject the base URL for the API, allowing us to easily change it in one place if needed.
export const API_URL = new InjectionToken<string>('API_URL');
