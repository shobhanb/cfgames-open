# AI Coding Agent Instructions for cfgames-open/frontend

You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project Architecture & Data Flow
- This is a modern Angular app using **standalone components** and **signals** for state management. No NgModules are used.
- All business logic and data access is handled via services in `src/app/services/` and `src/app/api/services/`.
- API models are defined in `src/app/api/models/` and are used for strict typing throughout the app.
- The app is organized by feature folders (e.g. `tabs/`, `pages/`, `services/`, `guards/`).
- Routing is configured for lazy loading and feature isolation. Guards use signals and inject for state.
- Environment variables (year, affiliateId, etc.) are accessed via `src/environments/environment.ts`.
- External dependencies: Ionic (UI), RxJS (API calls), Firebase (auth), Ionicons (icons).

## Developer Workflows
- **Build:** Use `ng build` for production builds. For local dev, use `ng serve`.
- **Test:** Run `ng test` for unit tests. Most tests are in `*.spec.ts` files alongside code.
- **Debug:** Use browser devtools and Angular signals for tracing state. Use `console.log` for quick inspection.
- **API:** All API calls use generated services in `src/app/api/services/`. Models are strictly typed.
- **Modal Usage:** For Angular standalone components, use `setInput` to pass signal-based inputs to modals. Do not use `componentProps` for signal inputs.

## Project-Specific Conventions
- **Signals:** All local and shared state uses Angular signals. Use `computed()` for derived state.
- **Inputs/Outputs:** Use `input()` and `output()` functions for component communication, not decorators.
- **Templates:** Use native control flow (`@if`, `@for`, `@switch`) instead of structural directives. Keep templates simple.
- **Change Detection:** Always set `ChangeDetectionStrategy.OnPush` in components.
- **Forms:** Prefer Reactive forms. Avoid template-driven forms.
- **Styling:** Use class and style bindings, not `ngClass` or `ngStyle`.
- **Images:** Use `NgOptimizedImage` for all static images.
- **API Models:** Always use strict types from `src/app/api/models/`.
- **Sorting:** Sort lists by year and ordinal for event-based data.
- **Environment:** Use `environment.year` and `environment.affiliateId` for context-aware features.

## Integration & Communication Patterns
- **Services:** Singleton services use `providedIn: 'root'` and `inject()` for dependency injection.
- **Guards:** Use signals and inject for route protection. See `src/app/guards/` for examples.
- **Modals:** Use `ModalController` and `setInput` for passing data to modals. Do not use `componentProps` for signal-based inputs.
- **API:** All backend communication is via generated API services. Never use raw HTTP calls.

## Examples
- See `src/app/tabs/me-tab/appreciation/appreciation.page.ts` for signal-based state, API usage, and modal patterns.
- See `src/app/services/event.service.ts` for event data management and environment usage.
- See `src/app/tabs/admin-tab/edit-teams/edit-teams.page.ts` for feature folder structure and service integration.

---

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Don't use explicit `standalone: true` (it is implied by default)
- Use signals for state management
- Implement lazy loading for feature routes
- Use `NgOptimizedImage` for all static images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- DO NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
