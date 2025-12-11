import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MatchSetup from "@/pages/MatchSetup";
import LiveMatch from "@/pages/LiveMatch";
import EndSummary from "@/pages/EndSummary";
import AlarmList from "@/pages/AlarmList";
import WeatherDetail from "@/pages/WeatherDetail";
// import AdminDashboard from "@/pages/admin/Dashboard.tsx";
// import AdminLogin from "@/pages/admin/Login";
// import MatchesManagement from "@/pages/admin/Matches";
// import MatchDetail from "@/pages/admin/MatchDetail";
// import UserManagement from "@/pages/admin/Users";
// import UserEdit from "@/pages/admin/UserEdit";
// import SystemSettings from "@/pages/admin/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={MatchSetup} />
      <Route path="/live" component={LiveMatch} />
      <Route path="/summary" component={EndSummary} />
      <Route path="/alarms" component={AlarmList} />
      <Route path="/weather" component={WeatherDetail} />
      
      {/* Admin Routes - Temporarily Disabled
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/matches" component={MatchesManagement} />
      <Route path="/admin/matches/:id" component={MatchDetail} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/users/:id" component={UserEdit} />
      <Route path="/admin/settings" component={SystemSettings} />
      */}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
