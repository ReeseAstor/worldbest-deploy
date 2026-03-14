# Data Flow Patterns

<cite>
**Referenced Files in This Document**
- [api.ts](file://src/lib/api.ts)
- [providers.tsx](file://src/app/providers.tsx)
- [providers.tsx](file://src/components/providers.tsx)
- [websocket-provider.tsx](file://src/components/websocket/websocket-provider.tsx)
- [auth-provider.tsx](file://src/components/auth/auth-provider.tsx)
- [auth-context.tsx](file://src/contexts/auth-context.tsx)
- [layout.tsx](file://src/app/layout.tsx)
- [dashboard/page.tsx](file://src/app/dashboard/page.tsx)
- [projects/[id]/write/page.tsx](file://src/app/projects/[id]/write/page.tsx)
- [api.ts](file://packages/shared-types/src/api.ts)
- [use-toast.ts](file://packages/ui-components/src/hooks/use-toast.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the data flow patterns across the WorldBest application. It covers:
- The request-response lifecycle from UI components through API clients to backend services, including authentication interceptors and error handling.
- Real-time data via WebSocket connections for collaborative editing, including event-driven updates and presence indicators.
- Caching and synchronization using React Query, including cache invalidation, background updates, and optimistic UI patterns.
- Practical examples of data fetching, mutation handling, and synchronization between local state and remote data.
- Performance considerations such as debouncing, throttling, and efficient re-rendering strategies.

## Project Structure
The application initializes providers at the root level to wire up global state, caching, theming, authentication, and WebSocket connectivity. UI pages consume these providers to fetch and mutate data, render collaborative features, and manage real-time updates.

```mermaid
graph TB
Root["Root Layout<br/>Providers"] --> QC["React Query Provider"]
Root --> Theme["Theme Provider"]
Root --> Auth["Auth Provider"]
Root --> WS["WebSocket Provider"]
Auth --> API["Axios API Client"]
QC --> UI["UI Pages"]
WS --> UI
API --> Backend["Backend Services"]
```

**Diagram sources**
- [layout.tsx](file://src/app/layout.tsx#L83-L101)
- [providers.tsx](file://src/components/providers.tsx#L10-L54)
- [providers.tsx](file://src/app/providers.tsx#L9-L36)

**Section sources**
- [layout.tsx](file://src/app/layout.tsx#L83-L101)
- [providers.tsx](file://src/components/providers.tsx#L10-L54)
- [providers.tsx](file://src/app/providers.tsx#L9-L36)

## Core Components
- Axios API client with request/response interceptors for authentication and token refresh.
- React Query provider with default caching and retry policies.
- Authentication providers managing session state, cookies/tokens, and periodic refresh.
- WebSocket provider for real-time collaboration and presence updates.
- Shared types for API responses and WebSocket messages.

**Section sources**
- [api.ts](file://src/lib/api.ts#L1-L67)
- [providers.tsx](file://src/components/providers.tsx#L10-L54)
- [providers.tsx](file://src/app/providers.tsx#L9-L36)
- [auth-provider.tsx](file://src/components/auth/auth-provider.tsx#L20-L165)
- [auth-context.tsx](file://src/contexts/auth-context.tsx#L30-L154)
- [websocket-provider.tsx](file://src/components/websocket/websocket-provider.tsx#L17-L138)
- [api.ts](file://packages/shared-types/src/api.ts#L77-L121)

## Architecture Overview
The request-response cycle integrates authentication, caching, and error handling. Real-time collaboration leverages WebSocket events for live updates and presence.

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant Auth as "Auth Provider"
participant API as "Axios API Client"
participant Inter as "Interceptors"
participant BE as "Backend"
UI->>Auth : "login/signup/logout"
Auth->>BE : "HTTP requests"
BE-->>Auth : "responses"
Auth-->>UI : "user state updates"
UI->>API : "authenticated request"
API->>Inter : "request interceptor adds token"
Inter->>BE : "HTTP request"
BE-->>Inter : "HTTP response"
Inter->>API : "response interceptor handles refresh"
API-->>UI : "data or error"
```

**Diagram sources**
- [auth-provider.tsx](file://src/components/auth/auth-provider.tsx#L67-L141)
- [api.ts](file://src/lib/api.ts#L10-L65)

## Detailed Component Analysis

### Authentication and Token Management
- Cookie-based authentication is initialized on app load by reading a session cookie and validating it against a profile endpoint.
- Periodic token refresh keeps sessions alive without prompting the user.
- Logout clears the session cookie and navigates to the home page.
- Axios interceptors attach Authorization headers and automatically refresh tokens on 401 responses.

```mermaid
flowchart TD
Start(["App Start"]) --> ReadCookie["Read Session Cookie"]
ReadCookie --> HasCookie{"Cookie Present?"}
HasCookie --> |No| InitDone["Initialize Without User"]
HasCookie --> |Yes| FetchProfile["Fetch /auth/me"]
FetchProfile --> ProfileOK{"Profile OK?"}
ProfileOK --> |Yes| SetUser["Set User State"]
ProfileOK --> |No| ClearCookie["Clear Cookie"]
SetUser --> InitDone
ClearCookie --> InitDone
```

**Diagram sources**
- [auth-provider.tsx](file://src/components/auth/auth-provider.tsx#L27-L49)

**Section sources**
- [auth-provider.tsx](file://src/components/auth/auth-provider.tsx#L20-L165)
- [auth-context.tsx](file://src/contexts/auth-context.tsx#L30-L154)
- [api.ts](file://src/lib/api.ts#L10-L65)

### API Client and Interceptors
- Base URL and JSON headers are configured globally.
- Request interceptor attaches Bearer tokens from storage.
- Response interceptor handles 401 Unauthorized by refreshing tokens via a dedicated endpoint and retrying the original request.
- On refresh failure, tokens are removed and the user is redirected to login.

```mermaid
flowchart TD
Req["Outgoing Request"] --> AddAuth["Add Authorization Header"]
AddAuth --> Send["Send to Backend"]
Send --> Resp["Incoming Response"]
Resp --> Status{"Status"}
Status --> |2xx| Done["Resolve Promise"]
Status --> |401| Retry{"Already Retried?"}
Retry --> |No| Refresh["POST /auth/refresh"]
Refresh --> StoreTokens["Store New Tokens"]
StoreTokens --> RetryReq["Retry Original Request"]
Retry --> |Yes| Fail["Reject with Error"]
RetryReq --> Done
```

**Diagram sources**
- [api.ts](file://src/lib/api.ts#L10-L65)

**Section sources**
- [api.ts](file://src/lib/api.ts#L1-L67)

### React Query Caching and Mutations
- Global QueryClient configured with default staleTime and retry policies.
- Queries avoid refetching on window focus; mutations retry based on HTTP status.
- Devtools are included for debugging cache behavior.

```mermaid
flowchart TD
UI["UI Component"] --> Query["useQuery Hook"]
Query --> QC["QueryClient Cache"]
QC --> Hit{"Cache Hit?"}
Hit --> |Yes| Return["Return Cached Data"]
Hit --> |No| Fetch["Fetch from API"]
Fetch --> Store["Store in Cache"]
Store --> Return
```

**Diagram sources**
- [providers.tsx](file://src/components/providers.tsx#L10-L36)
- [providers.tsx](file://src/app/providers.tsx#L9-L36)

**Section sources**
- [providers.tsx](file://src/components/providers.tsx#L10-L54)
- [providers.tsx](file://src/app/providers.tsx#L9-L36)

### WebSocket Real-Time Collaboration
- WebSocketProvider connects when a user exists, authenticating via a cookie token.
- Auto-reconnect with exponential backoff; disconnect reasons are handled gracefully.
- Emits and listens for typed events; exposes emit/on/off helpers.
- Shared WebSocket message types define collaboration, presence, notifications, and AI-related events.

```mermaid
sequenceDiagram
participant UI as "UI Component"
participant WS as "WebSocketProvider"
participant SIO as "Socket.IO Client"
participant BE as "Collaboration Server"
UI->>WS : "emit('content_update', payload)"
WS->>SIO : "emit()"
SIO->>BE : "WebSocket Message"
BE-->>SIO : "broadcast('subscription_update')"
SIO-->>WS : "on('subscription_update')"
WS-->>UI : "invoke callbacks"
```

**Diagram sources**
- [websocket-provider.tsx](file://src/components/websocket/websocket-provider.tsx#L17-L138)
- [api.ts](file://packages/shared-types/src/api.ts#L77-L121)

**Section sources**
- [websocket-provider.tsx](file://src/components/websocket/websocket-provider.tsx#L17-L138)
- [api.ts](file://packages/shared-types/src/api.ts#L77-L121)

### UI Data Fetching and Local State
- Dashboard page composes stats and project cards using local state and links to project pages.
- Write page demonstrates local editor state, auto-save timers, word counting, toolbar commands, and AI panel toggles.
- These patterns illustrate separation of concerns: UI state for ephemeral UX, and remote data for persisted content.

```mermaid
flowchart TD
Load["Page Mount"] --> InitState["Initialize Local State"]
InitState --> Render["Render UI"]
Render --> UserEdit["User Edits Content"]
UserEdit --> LocalCalc["Local Calculations (e.g., word count)"]
LocalCalc --> AutoSave["Auto-Save Timer"]
AutoSave --> Persist["Persist to API (future)"]
```

**Diagram sources**
- [dashboard/page.tsx](file://src/app/dashboard/page.tsx#L53-L260)
- [projects/[id]/write/page.tsx](file://src/app/projects/[id]/write/page.tsx#L100-L166)

**Section sources**
- [dashboard/page.tsx](file://src/app/dashboard/page.tsx#L53-L260)
- [projects/[id]/write/page.tsx](file://src/app/projects/[id]/write/page.tsx#L100-L166)

### Error Handling and User Feedback
- Toast hooks centralize notification delivery with limits and timeouts.
- Auth actions surface user-friendly messages for login/signup/logout failures.
- API errors propagate through interceptors and are surfaced to UI components.

```mermaid
flowchart TD
Action["User Action"] --> Try["Try Operation"]
Try --> Ok{"Success?"}
Ok --> |Yes| Notify["Show Success Toast"]
Ok --> |No| Error["Catch Error"]
Error --> MapMsg["Map to User-Friendly Message"]
MapMsg --> Toast["Show Error Toast"]
```

**Diagram sources**
- [use-toast.ts](file://packages/ui-components/src/hooks/use-toast.ts#L142-L191)
- [auth-provider.tsx](file://src/components/auth/auth-provider.tsx#L67-L113)

**Section sources**
- [use-toast.ts](file://packages/ui-components/src/hooks/use-toast.ts#L1-L191)
- [auth-provider.tsx](file://src/components/auth/auth-provider.tsx#L67-L113)

## Dependency Analysis
The following diagram shows how providers and components depend on each other and external libraries.

```mermaid
graph TB
A["layout.tsx"] --> B["components/providers.tsx"]
B --> C["app/providers.tsx"]
B --> D["auth-provider.tsx"]
B --> E["websocket-provider.tsx"]
D --> F["api.ts (Axios)"]
C --> G["React Query"]
E --> H["Socket.IO Client"]
F --> I["Backend Services"]
```

**Diagram sources**
- [layout.tsx](file://src/app/layout.tsx#L83-L101)
- [providers.tsx](file://src/components/providers.tsx#L10-L54)
- [providers.tsx](file://src/app/providers.tsx#L9-L36)
- [auth-provider.tsx](file://src/components/auth/auth-provider.tsx#L20-L165)
- [websocket-provider.tsx](file://src/components/websocket/websocket-provider.tsx#L17-L138)
- [api.ts](file://src/lib/api.ts#L1-L67)

**Section sources**
- [layout.tsx](file://src/app/layout.tsx#L83-L101)
- [providers.tsx](file://src/components/providers.tsx#L10-L54)
- [providers.tsx](file://src/app/providers.tsx#L9-L36)
- [auth-provider.tsx](file://src/components/auth/auth-provider.tsx#L20-L165)
- [websocket-provider.tsx](file://src/components/websocket/websocket-provider.tsx#L17-L138)
- [api.ts](file://src/lib/api.ts#L1-L67)

## Performance Considerations
- Debounce and throttle user input:
  - Auto-save triggers after a short idle period to reduce network calls.
  - Word count recalculations occur after input changes; consider debouncing heavy computations.
- Efficient re-rendering:
  - Keep UI state local (e.g., sidebar visibility, AI panel toggle) to minimize unnecessary re-renders.
  - Use stable references for callbacks and memoized values when integrating with APIs.
- Caching:
  - Configure staleTime appropriately to balance freshness and performance.
  - Invalidate caches on mutations and subscribe to real-time updates to keep data consistent.
- Network reliability:
  - Retry policies avoid retrying on client errors; adjust based on service SLAs.
  - WebSocket auto-reconnect prevents single-point failures in collaborative editing.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Authentication issues:
  - If a 401 occurs, the interceptor attempts a token refresh. If refresh fails, the app clears tokens and redirects to login.
  - Verify cookie presence and expiration; ensure the backend refresh endpoint returns valid tokens.
- WebSocket connectivity:
  - Check that the user is authenticated before connecting; the provider disconnects otherwise.
  - Inspect connection logs and auto-reconnect delays; confirm server-side auth_error handling.
- UI feedback:
  - Use toast notifications to surface actionable messages for users.
  - Validate that toasts are dismissed after their timeout or when closed.

**Section sources**
- [api.ts](file://src/lib/api.ts#L24-L65)
- [websocket-provider.tsx](file://src/components/websocket/websocket-provider.tsx#L24-L93)
- [use-toast.ts](file://packages/ui-components/src/hooks/use-toast.ts#L56-L127)

## Conclusion
WorldBest’s data flow combines robust authentication with resilient caching and real-time collaboration. The Axios interceptors, React Query defaults, and WebSocket provider collectively ensure reliable, responsive experiences. By applying debouncing, thoughtful caching, and optimistic updates, the system balances performance and correctness while enabling collaborative writing workflows.

[No sources needed since this section summarizes without analyzing specific files]