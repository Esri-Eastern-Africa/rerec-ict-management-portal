import '@mantine/core/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';

import type { AppProps } from 'next/app';
import { MantineProvider, createTheme } from '@mantine/core';
import { ToastContainer } from 'react-toastify';

const theme = createTheme({
  primaryColor: 'orange',
  fontFamily: "'DM Sans', sans-serif",
  headings: { fontFamily: "'DM Sans', sans-serif" },
  defaultRadius: 'md',
  colors: {
    orange: [
      '#fff4e6', '#ffe8cc', '#ffd8a8', '#ffc078',
      '#ffa94d', '#ff922b', '#fd7e14', '#f76707',
      '#e8590c', '#d9480f',
    ],
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme}>
      <Component {...pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </MantineProvider>
  );
}
