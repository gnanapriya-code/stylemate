import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import Wardrobe from "./pages/Wardrobe";
import Recommendations from "./pages/Recommendations";
import Seasons from "./pages/Seasons";
import Designs from "./pages/Designs";
import Planner from "./pages/Planner";
import Favorites from "./pages/Favorites";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/seasons" element={<Seasons />} />
        <Route path="/designs" element={<Designs />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/favorites" element={<Favorites />} />
      </Route>
    </Routes>
  );
}

export default App;