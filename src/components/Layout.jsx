import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWishlist } from '../store/wishlistSlice.js';

export default function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const first = useRef(true);
  const count = useSelector(selectWishlist).length;

  // Move focus to the page on route change so keyboard and screen reader users start at the top.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <NavLink to="/" className="brand">
          Kasavu
        </NavLink>
        <nav aria-label="Main">
          <ul>
            <li>
              <NavLink to="/shop">Shop</NavLink>
            </li>
            <li>
              <NavLink to="/wishlist">
                Wishlist <span className="count" aria-label={`${count} saved`}>{count}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile">Profile</NavLink>
            </li>
            <li>
              <NavLink to="/admin">Admin</NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Kasavu Ethnic Wear, Thiruvananthapuram. A fictional store used for a front-end project.</p>
      </footer>
    </>
  );
}
