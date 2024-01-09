import Layout from "./components/Layout/Layout";
import About from './pages/About/About'
import Skills from './pages/Skills/Skills'
import Projects from './pages/Projects/Projects'
import Education from "./pages/Education/Education";
function App() {
  return (
    <div>
      <Layout />
      <About />
      <Skills />
      <Education />
      <Projects />
    </div>
  );
}

export default App;
