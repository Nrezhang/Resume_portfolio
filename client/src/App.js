import Layout from "./components/Layout/Layout";
import About from './pages/About/About'
import Skills from './pages/Skills/Skills'
import Projects from './pages/Projects/Projects'
import Education from "./pages/Education/Education";
import Experience from "./pages/Experience/Experience";
import Contact from "./pages/Contact/Contact";
import ScrollToTop from "react-scroll-to-top";
import MobileNav from "./components/MobileNav/MobileNav";
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <>
    <ToastContainer />
    <MobileNav />
    <Layout />
    <div>
      <About />
      <Experience />
      <Skills />
      <Education />
      <Projects />
      <Contact />
    </div>
    <div>
      <ScrollToTop smooth color="white" style={{backgroundColor: "#36454F", borderRadius:'80px'}} />
    </div>
    </>
  );
}

export default App;
