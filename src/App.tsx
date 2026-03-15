import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import LiveMonitoring from "@/pages/LiveMonitoring";
import QualityTrends from "@/pages/QualityTrends";
import SupplierAnalytics from "@/pages/SupplierAnalytics";
import AlertsHealth from "@/pages/AlertsHealth";
import Reports from "@/pages/Reports";
import CaneQualityPredictor from "@/pages/CaneQualityPredictor";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<LiveMonitoring />} />
            <Route path="/trends" element={<QualityTrends />} />
            <Route path="/suppliers" element={<SupplierAnalytics />} />
            <Route path="/alerts" element={<AlertsHealth />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/predictor" element={<CaneQualityPredictor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
