import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Xocolate Coffee Co | Artisan Coffee & Chocolate | Eugene, Oregon",
  description: "Experience premium artisan coffee and handcrafted chocolate at Xocolate Coffee Co in Eugene, Oregon. Locally roasted organic coffee, delicious pastries, and warm atmosphere. Order online for pickup.",
  keywords: [
    'coffee shop Eugene Oregon',
    'artisan coffee Eugene',
    'Mexican coffee',
    'organic coffee Eugene',
    'locally roasted coffee',
    'chocolate coffee',
    'coffee roasting',
    'espresso bar',
    'Eugene coffee',
    'premium coffee',
    'handcrafted chocolate',
    'coffee and pastries',
    'local coffee shop',
    'fresh roasted coffee'
  ],
  authors: [{ name: 'Xocolate Coffee Co' }],
  creator: 'Xocolate Coffee Co',
  publisher: 'Xocolate Coffee Co',
  
  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://xocolatecoffee.com', // Replace with your actual domain
    siteName: 'Xocolate Coffee Co',
    title: 'Xocolate Coffee Co | Artisan Coffee & Chocolate | Eugene, Oregon',
    description: 'Experience premium artisan coffee and handcrafted chocolate at Xocolate Coffee Co in Eugene, Oregon. Locally roasted organic coffee, delicious pastries, and warm atmosphere.',
    images: [
      {
        url: '/og-image.jpg', // Add your actual image path
        width: 1200,
        height: 630,
        alt: 'Xocolate Coffee Co - Artisan Coffee and Chocolate in Eugene, Oregon',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Xocolate Coffee Co | Artisan Coffee & Chocolate | Eugene, Oregon',
    description: 'Experience premium artisan coffee and handcrafted chocolate at Xocolate Coffee Co in Eugene, Oregon.',
    images: ['/og-image.jpg'], // Add your actual image path
    creator: '@xocolatecoffeeco', // Replace with actual Twitter handle if available
    site: '@xocolatecoffeeco',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Geographic and business info
  other: {
    'geo.region': 'US-OR',
    'geo.placename': 'Eugene, Oregon',
    'geo.position': '44.0494548;-123.1363413',
    'ICBM': '44.0494548, -123.1363413',
    'business:contact_data:street_address': '995 Tyinn St, Ste 1',
    'business:contact_data:locality': 'Eugene',
    'business:contact_data:region': 'Oregon',
    'business:contact_data:postal_code': '97402',
    'business:contact_data:country_name': 'United States',
  },

  // Additional metadata
  category: 'food and drink',
  classification: 'Coffee Shop, Café',
  
  // Verification (add your actual verification codes)
  verification: {
    google: ['eoeusN5eNWdAyMtXTgGaoHo9BLuTELh8EcF9GSkODh8','nb-w6k9raJZprEjLRfmuTojwvu8dNMBjwVlMmWlUlDs' ]
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
};

// Structured data for local business
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'CafeOrCoffeeShop',
  name: 'Xocolate Coffee Co',
  image: 'https://xocolatecoffeeco.com/Xocolate_Coffee_Co_Logo.png', // Replace with actual image URL
  '@id': 'https://xocolatecoffeeco.com',
  url: 'https://xocolatecoffeeco.com',
  telephone: '+1-541-684-0066', 
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '995 Tyinn St, Ste 1',
    addressLocality: 'Eugene',
    addressRegion: 'OR',
    postalCode: '97402',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 44.0494548,
    longitude: -123.1363413,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '06:00',
      closes: '14:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '07:00',
      closes: '15:00',
    }
  ],
  servesCuisine: ['Coffee', 'Espresso', 'Mexican Coffee', 'Chocolate', 'Pastries', 'Light Meals'],
  paymentAccepted: 'Cash, Credit Card, Debit Card, Apple Pay, Google Pay',
  sameAs: [
    'https://www.facebook.com/61575288841658',
    'https://www.instagram.com/xocolatecoffeeco/',
    'https://www.yelp.com/biz/xocolate-coffee-eugene'
    // Add other social media URLs as needed
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data for Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}