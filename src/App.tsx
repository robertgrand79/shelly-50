import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShellyBirthdayPage from "@/pages/shelly/ShellyBirthdayPage";
import ShellyCollagePage from "@/pages/shelly/ShellyCollagePage";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShellyBirthdayPage />} />
        <Route path="/collage" element={<ShellyCollagePage />} />
        <Route path="*" element={<ShellyBirthdayPage />} />
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
