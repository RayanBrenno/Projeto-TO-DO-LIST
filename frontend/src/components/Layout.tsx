import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { type Page } from "../types";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = location.pathname.replace("/", "") as Page;

  function handlePageChange(page: Page) {
    navigate(`/${page}`);
  }

  return (
    <div className="flex">
      <Sidebar
        activePage={currentPage || "home"}
        onPageChange={handlePageChange}
      />

      <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}