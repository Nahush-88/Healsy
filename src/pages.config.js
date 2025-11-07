import Mind from './pages/Mind';
import Sleep from './pages/Sleep';
import Dashboard from './pages/Dashboard';
import Body from './pages/Body';
import Face from './pages/Face';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Mood from './pages/Mood';
import Diet from './pages/Diet';
import Challenges from './pages/Challenges';
import Water from './pages/Water';
import Settings from './pages/Settings';
import PaymentStatus from './pages/PaymentStatus';
import Exercise from './pages/Exercise';
import Aura from './pages/Aura';
import Yoga from './pages/Yoga';
import Meditation from './pages/Meditation';
import ChallengeDetail from './pages/ChallengeDetail';
import Coach from './pages/Coach';
import AIHealthCoach from './pages/AIHealthCoach';
import Diagnostics from './pages/Diagnostics';
import Calories from './pages/Calories';
import Layout from './Layout.jsx';


export const PAGES = {
    "Mind": Mind,
    "Sleep": Sleep,
    "Dashboard": Dashboard,
    "Body": Body,
    "Face": Face,
    "Home": Home,
    "Onboarding": Onboarding,
    "Mood": Mood,
    "Diet": Diet,
    "Challenges": Challenges,
    "Water": Water,
    "Settings": Settings,
    "PaymentStatus": PaymentStatus,
    "Exercise": Exercise,
    "Aura": Aura,
    "Yoga": Yoga,
    "Meditation": Meditation,
    "ChallengeDetail": ChallengeDetail,
    "Coach": Coach,
    "AIHealthCoach": AIHealthCoach,
    "Diagnostics": Diagnostics,
    "Calories": Calories,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};