import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom';

import { Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from '../src/Components/Home/Home'
import Features from '../src/Components/Features/Features'
import UpComing from '../src/Components/UpComing/Upcoming'
import WhyToAttend from '../src/Components/WhyToAttend/WhyToAttend'
import Contact from '../src/Components/Contact/Contact'
import BookingPage from './Pages/BookingPage/BookingPage'
import LandingPage from './Pages/LandingPage/LandingPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
        <Routes>
          {/* Main components for the initial page */}
          <Route
            path="/"
            element={
              <>
                <Home />
                <Features />
                <UpComing />
                <WhyToAttend />
                <Contact />
              </>
            }
          />

          {/* Route for /booking */}
          <Route path="/booking" element={<LandingPage />} />

          {/* Route for /payment */}
          <Route path="/payment" element={<BookingPage />} />
        </Routes>
    </BrowserRouter>
    // <>
    //   <Home />
    //   <Features />
    //   <UpComing />
    //   <WhyToAttend />
    //   <Contact />
    //   <LandingPage />
    //   <BookingPage />
    //   </>
  );

}

export default App
