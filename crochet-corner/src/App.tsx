import { useEffect, useState } from 'react';
import Nav, { Route } from './components/Nav';
import StarField from './components/StarField';
import Footer from './components/Footer';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Create from './pages/Create';
import Blog from './pages/Blog';

const ROUTES: Route[] = ['home', 'learn', 'create', 'blog'];

function routeFromHash(): Route {
  const h = window.location.hash.replace('#/', '').replace('#', '') as Route;
  return ROUTES.includes(h) ? h : 'home';
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash());

  useEffect(() => {
    const onHash = () => { setRoute(routeFromHash()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (r: Route) => { window.location.hash = r === 'home' ? '/' : `/${r}`; };

  return (
    <>
      <StarField />
      <Nav route={route} go={go} />
      <main>
        {route === 'home' && <Home go={go} />}
        {route === 'learn' && <Learn />}
        {route === 'create' && <Create />}
        {route === 'blog' && <Blog />}
      </main>
      <Footer />
    </>
  );
}
