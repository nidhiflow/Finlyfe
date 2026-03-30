import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

// Desktop app — self-contained with BrowserRouter, AuthProvider, AppProvider
// @ts-ignore
import DesktopApp from '../desktop/DesktopApp';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile;
}

export default function App() {
  const isMobile = useIsMobile();

  // Mobile: Figma-designed screens with react-router
  if (isMobile) {
    return <RouterProvider router={router} />;
  }

  // Desktop: Full finly-frontend app (self-contained with its own BrowserRouter)
  return <DesktopApp />;
}