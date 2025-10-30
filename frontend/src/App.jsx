import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import PrivateRoute from "./routes/PrivateRoute";
import ManageTasks from "./pages/Admin/ManageTasks";
import CreateTask from "./pages/Admin/CreateTask";
import ManageUser from "./pages/Admin/ManageUser";
import Reports from "./pages/Admin/Reports";
import UserDashboard from "./pages/User/UserDashboard";
import MyTask from "./pages/User/MyTask";
import ViewTaskDetails from "./pages/User/ViewTaskDetails";

const App = () => {
  const getDefaultRoute = () => {
    const userString = localStorage.getItem("user");
    if (!userString) return "/login";

    try {
      const user = JSON.parse(userString);
      return user.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
    } catch {
      return "/login";
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Admin routes */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/tasks" element={<ManageTasks />} />
          <Route path="/admin/create-task" element={<CreateTask />} />
          <Route path="/admin/users" element={<ManageUser />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>

        {/* User routes */}
        <Route element={<PrivateRoute allowedRoles={["member"]} />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/my-tasks" element={<MyTask />} />
          <Route path="/user/task/:id" element={<ViewTaskDetails />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
