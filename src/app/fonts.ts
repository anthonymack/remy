import { Source_Serif_4, Manrope } from 'next/font/google';

export const serif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700'],
  variable: '--font-serif',
});

export const sans = Manrope({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-sans',
}); 