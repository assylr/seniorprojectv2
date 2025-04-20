# TECH DEBT / FUTURE REFACTOR NOTE: Rooms Page Scalability

**Date:** (Add Date Here)
**Status:** Postponed (Post-MVP / Performance Phase)

---

## CONTEXT:

The current implementation of the Rooms page (`RoomsPage.tsx`) fetches **ALL** room, tenant, and building data upfront. It then performs filtering, sorting (implicitly), and data derivations (like occupancy status, unique bedroom counts) entirely on the **CLIENT-SIDE**.

## PROBLEM:

This approach **will NOT scale** to potentially thousands of rooms in a production environment. It will lead to significant performance issues:

-   **Slow Initial Load Times:** Transferring large amounts of data over the network.
-   **High Memory Consumption:** Storing the entire dataset in the browser's memory.
-   **Sluggish UI Performance:** Filtering, sorting, and rendering large lists in the DOM is slow.
-   **Potential Browser Crashes:** With extremely large datasets.
-   **Inefficient Data Fetching:** Fetching all tenants just to determine room occupancy status is wasteful.

## PLANNED SOLUTION (To be implemented post-MVP or when addressing performance):

Refactor the `RoomsPage` and its related components to use a **SERVER-SIDE** data handling strategy. This involves coordinated changes between the backend API and the frontend React application.

---

## REQUIRED BACKEND API CHANGES:

1.  **Paginated `GET /api/rooms` Endpoint:**
    *   Must accept query parameters: `page` (number), `limit` (number, e.g., items per page).
    *   Must return a paginated response structure:
        ```json
        {
          "data": [
            // Room objects for the current page ONLY
          ],
          "totalItems": 1250,   // Total rooms matching filters
          "totalPages": 25,     // Total pages (totalItems / limit)
          "currentPage": 1      // The page number returned
        }
        ```

2.  **Server-Side Filtering for `GET /api/rooms`:**
    *   Must accept filter parameters: `buildingId` (string/number), `availability` ('available'/'occupied'), `bedrooms` (string/number), `search` (string for general text search).
    *   Backend logic must perform filtering at the **DATABASE level** (e.g., using `WHERE` clauses).
    *   The endpoint should return only the filtered results, respecting pagination.

3.  **Server-Side Sorting for `GET /api/rooms`:**
    *   Must accept sort parameters: `sortBy` (string, e.g., 'roomNumber', 'baseRent', 'buildingNumber'), `sortOrder` ('asc'/'desc').
    *   Backend logic must perform sorting at the **DATABASE level** (e.g., using `ORDER BY`).

4.  **Data Enhancement on Backend:**
    *   The `Room` object returned by `/api/rooms` **MUST** directly include necessary related data to minimize frontend lookups and processing. At minimum:
        *   `isOccupied`: `boolean`
        *   `occupantName`: `string | null`
        *   `occupantId`: `number | null`
        *   `buildingNumber`: `string` (Preferred over just `buildingId`)

5.  **`GET /api/filter-options` Endpoint (Optional but Recommended):**
    *   Create a dedicated endpoint to fetch static data needed for filter dropdowns.
        ```json
        {
          "buildings": [
            { "id": 7, "buildingNumber": "Block 7" },
            /* ... */
          ],
          "bedroomCounts": [1, 2, 3, 4]
        }
        ```
    *   This avoids calculating these options from the full dataset on the frontend during initial load.

---

## REQUIRED FRONTEND (React) CHANGES:

1.  **State Management (`RoomsPage.tsx`):**
    *   Add state variables for: `currentPage`, `totalItems`, `totalPages`, `sortBy`, `sortOrder`, `searchQuery`.
    *   Remove client-side derived state like `filteredRooms`, `activeTenantsMap`, `uniqueBedroomCounts` (these will come from or be handled via the API).

2.  **Data Fetching (`useEffect` / Data Fetching Library):**
    *   Refactor the main `fetchData` function (or preferably use **React Query/SWR**).
    *   Call the updated `getRooms` API service function, passing the current state parameters (page, limit, filters, sort, search).
    *   Update component state (`rooms`, `currentPage`, `totalItems`, `totalPages`) based on the API response.
    *   Fetch filter options (`getFilterOptions`) separately on initial load (if using that endpoint).
    *   **REMOVE** the initial `getTenants()` and potentially `getBuildings()` calls from the primary room data fetch.

3.  **Filtering (`RoomFilters.tsx` / `RoomsPage.tsx`):**
    *   Filter components will only update the `filters` state in `RoomsPage`.
    *   `handleFilterChange` in `RoomsPage` must trigger a **refetch** from the API, typically resetting `currentPage` to 1.
    *   **REMOVE** the client-side `useMemo` calculation for `filteredRooms`.

4.  **Sorting (`RoomTable.tsx` / `RoomsPage.tsx`):**
    *   Make table headers (`<th>`) clickable.
    *   Add visual sort indicators (e.g., ▲/▼ arrows) to headers.
    *   Clicking a header should call `handleSortChange` in `RoomsPage`.
    *   `handleSortChange` will update `sortBy`/`sortOrder` state and trigger an API **refetch**, typically resetting `currentPage` to 1.

5.  **Pagination (`RoomsPage.tsx`):**
    *   Implement or import a reusable `Pagination` UI component.
    *   Control the component using `currentPage` and `totalPages` state.
    *   Changing the page in the Pagination component must trigger an API **refetch** for the new page number.

6.  **Table Display (`RoomTable.tsx`, `RoomTableRow.tsx`):**
    *   Pass only the current page's `rooms` array (received from the API) to the `RoomTable`.
    *   Update `RoomTableRow` to expect `isOccupied`, `occupantName`, `buildingNumber`, etc., directly on the `room` prop.
    *   Add an "Actions" column (`<th>` and `<td>`) with buttons/links (e.g., View, Edit). Make occupant name/room number clickable links.

7.  **Search Implementation:**
    *   Add a search input component (`SearchInput`).
    *   Manage its value using the `searchQuery` state.
    *   Trigger an API **refetch** on search submission (e.g., button click or debounced input), passing the `search` param and resetting `currentPage` to 1.

---

## RECOMMENDED LIBRARIES:

-   **React Query (TanStack Query) or SWR:** Highly recommended for managing server state. They greatly simplify data fetching, caching, background updates, loading/error state management, and implementing pagination/infinite scrolling patterns.
-   **`react-window` / `react-virtualized`:** Consider virtualization **ONLY IF** rendering a large number of rows *per page* (e.g., >100) still causes noticeable scrolling lag *after* implementing server-side pagination. Usually not necessary with standard pagination limits (20-50 items per page).

---