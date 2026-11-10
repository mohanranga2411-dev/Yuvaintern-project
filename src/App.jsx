import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { Loading } from './components/StatusViews.jsx';
import Home from './pages/Home.jsx';

// Route-level code splitting keeps the first load small.
const Catalogue = lazy(() => import('./pages/Catalogue.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

function NotFound() {
  return (
    <div className="state">
      <title>Page not found | Kasavu</title>
      <h1>Page not found</h1>
      <p>That page does not exist. Use the menu to find your way.</p>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading label="Loading page" />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Catalogue />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
