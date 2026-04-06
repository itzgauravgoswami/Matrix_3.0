import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import GenerateNotes from './pages/GenerateNotes'
import GenerateQuiz from './pages/GenerateQuiz'
import GenerateQA from './pages/GenerateQA'
import SupremeLearning from './pages/SupremeLearning'
import AITutor from './pages/AITutor'
import Gamification from './pages/Gamification'
import Analytics from './pages/Analytics'
import LearningPath from './pages/LearningPath'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generate-notes" element={<GenerateNotes />} />
        <Route path="/generate-quiz" element={<GenerateQuiz />} />
        <Route path="/generate-qa" element={<GenerateQA />} />
        <Route path="/supreme-learning" element={<SupremeLearning />} />
        <Route path="/ai-tutor" element={<AITutor />} />
        <Route path="/gamification" element={<Gamification />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/learning-path" element={<LearningPath />} />
      </Routes>
    </Router>
  )
}

export default App
