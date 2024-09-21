import { Toaster } from '@/base/components/shadcn/ui/sonner';
import HomePage from '@/pages';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

const MyApp = () => {
  return (
    <RecoilRoot>
      <Toaster position='top-center' />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
};

export default MyApp;
