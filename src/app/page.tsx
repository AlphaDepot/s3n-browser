import S3Browser from '@/components/s3/directory/s3-browser';
import S3BrowserContextMenu from '@/components/s3/directory/s3-browser-context-menu';
import Footer from '@/components/s3/footer/footer';
import S3BrowserHeader from '@/components/s3/header/s3-browser-header';
import S3BrowserLayoutPanelGroup from '@/components/s3/layout/s3-browser-layout-panel-group';
import { ModalsContainer } from '@/components/s3/modals/modal-container';
import { Suspense } from 'react';

export default async function Home() {
  return (
    <div className='flex min-h-screen flex-col antialiased'>
      <S3BrowserHeader />

      <S3BrowserLayoutPanelGroup>
        <S3BrowserContextMenu>
          <div className='main-page-content h-full'>
            <Suspense fallback={<div>Loading...</div>}>
              <S3Browser />
            </Suspense>
          </div>
        </S3BrowserContextMenu>
      </S3BrowserLayoutPanelGroup>

      <Footer />
      <ModalsContainer />
    </div>
  );
}
