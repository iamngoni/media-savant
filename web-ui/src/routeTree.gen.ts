/* eslint-disable */
// Temporary route tree until TanStack Start generates one.
import { Route as RootRoute } from './routes/__root'
import { Route as IndexRoute } from './routes/index'
import { Route as SetupRoute } from './routes/setup'
import { Route as LibraryRoute } from './routes/library'
import { Route as LibraryDetailRoute } from './routes/library.$libraryId'
import { Route as ItemRoute } from './routes/item.$itemId'
import { Route as SearchRoute } from './routes/search'

export const routeTree = RootRoute.addChildren([
  IndexRoute,
  SetupRoute,
  LibraryRoute,
  LibraryDetailRoute,
  ItemRoute,
  SearchRoute,
])
