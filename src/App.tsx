import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/theme-context';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import IncidentDetailPage from "@/pages/IncidentDetail";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route element={<Layout />}>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/incident/:id" element={<IncidentDetailPage />} />
                        </Route>
                    </Routes>
                </Router>
                <Toaster />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
