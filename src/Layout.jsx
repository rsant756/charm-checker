// Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children, showIndicator = false, indicatorContent = null }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 justify-center">
      {/* コンテンツエリア */}
      <div className="flex flex-1 flex-col md:flex-row w-full max-w-6xl mx-auto">
        {/* メインコンテンツ */}
        <main className="flex-1 p-4 md:p-8 text-gray-900">
          {children}
        </main>

        {/* サイドバー */}
        <Sidebar showIndicator={showIndicator} indicatorContent={indicatorContent} />
      </div>

      {/* フッター（クレジット） */}
      <footer className="w-full text-xs text-gray-500 text-center py-4 border-t bg-white">
        © 2025–2025 gadget-darake
      </footer>
    </div>
  );
};

export default Layout;
