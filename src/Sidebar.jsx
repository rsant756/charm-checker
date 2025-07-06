// Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ indicatorContent }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <aside className="w-full md:w-64 px-4 py-6 border-l bg-white text-black h-fit md:h-screen sticky top-0">
      <div className="space-y-6 text-sm">
        {isHome && (
          <div>
            {indicatorContent}
          </div>
        )}

        <div className="mt-6 border-t pt-4 space-y-2">
          <Link to="/" className="block text-blue-600 hover:underline">
            装飾品チェッカー
          </Link>
          <Link to="/privacy" className="block text-blue-600 hover:underline">
            プライバシーポリシー
          </Link>
          <Link to="/terms" className="block text-blue-600 hover:underline">
            利用規約
          </Link>
        </div>

        {isHome && (
          <div className="mt-4">
            <a
              href={`https://twitter.com/intent/tweet?hashtags=ワイルズチャームチェッカー`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded inline-flex items-center text-sm"
            >
              <svg
                className="w-4 h-4 mr-2 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M18.36 3H21L14.31 10.32L22 21H15.66L10.98 14.8L5.52 21H3L10.05 13.24L2.7 3h6.52l4.23 5.87L18.36 3Z" />
              </svg>
              取得率を共有！
            </a>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
