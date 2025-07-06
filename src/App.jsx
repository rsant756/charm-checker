// App.jsx
import React, { useState, useEffect } from "react";
import Layout from "./Layout";

export default function App() {
  const [charms, setCharms] = useState([]);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [filter, setFilter] = useState({ type: "all", rarity: "all", search: "" });
  const [showRarityStats, setShowRarityStats] = useState(false);

  useEffect(() => {
    fetch("/charms.json")
      .then((res) => res.json())
      .then((data) => setCharms(data));
  }, []);

  const toggleChecked = (id) => {
    const newSet = new Set(checkedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setCheckedIds(newSet);
  };

  const saveToFile = () => {
    if (!confirm("チェックリストを保存しますか？")) return;
    const content = JSON.stringify({ version: "1.0", checkedItems: Array.from(checkedIds) });
    const blob = new Blob([content], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-charms.mhws";
    a.click();
  };

  const loadFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = JSON.parse(event.target.result);
        setCheckedIds(new Set(result.checkedItems));
      } catch {
        alert("読み込み失敗: 正しいmhwsファイルではありません。");
      }
    };
    reader.readAsText(file);
  };

  const filteredCharms = charms.filter((charm) => {
    const isChecked = checkedIds.has(charm["data-id"]);
    const matchesType =
      filter.type === "all" ||
      (filter.type === "checked" && isChecked) ||
      (filter.type === "unchecked" && !isChecked);
    const matchesRarity =
      filter.rarity === "all" || String(charm["data-sort2"]) === filter.rarity;
    const matchesSearch = charm["data-name"]
      .toLowerCase()
      .includes(filter.search.toLowerCase());

    return matchesType && matchesRarity && matchesSearch;
  });

  const rarityOptions = Array.from(new Set(charms.map((c) => c["data-sort2"]))).sort((a, b) => a - b);
  const owned = checkedIds.size;
  const total = charms.length;
  const percentage = total > 0 ? ((owned / total) * 100).toFixed(1) : 0;

  const rarityStats = rarityOptions.map((rarity) => {
    const items = charms.filter((c) => String(c["data-sort2"]) === String(rarity));
    const ownedItems = items.filter((c) => checkedIds.has(c["data-id"]));
    return {
      rarity,
      owned: ownedItems.length,
      total: items.length,
      percent: items.length > 0 ? ((ownedItems.length / items.length) * 100).toFixed(1) : 0,
    };
  });

  const indicatorContent = (
    <div className="text-black">
      <h2 className="text-xl font-bold mb-4">インジケーター</h2>
      <p className="mb-2">取得状況: {owned} / {total}（{percentage}%）</p>
      <button
        onClick={() => setShowRarityStats(!showRarityStats)}
        className="mb-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
      >
        レア別統計 {showRarityStats ? "非表示" : "表示"}
      </button>
      {showRarityStats && (
        <table className="text-sm w-full border border-gray-300 mb-4">
          <thead>
            <tr className="bg-gray-200 text-black">
              <th className="py-1 px-2 border">レア</th>
              <th className="py-1 px-2 border">所持</th>
              <th className="py-1 px-2 border">総数</th>
              <th className="py-1 px-2 border">%</th>
            </tr>
          </thead>
          <tbody>
            {rarityStats.map((r) => (
              <tr key={r.rarity} className="text-center text-black">
                <td className="py-1 px-2 border">レア{r.rarity}</td>
                <td className="py-1 px-2 border">{r.owned}</td>
                <td className="py-1 px-2 border">{r.total}</td>
                <td className="py-1 px-2 border">{r.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <Layout showIndicator={true} indicatorContent={indicatorContent}>
      <div className="sticky top-0 z-50 bg-white shadow-md py-2 px-4 mb-4">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <img
            src="/images/wilds_ja.png"
            alt="ロゴ"
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">
            装飾品取得チェッカー
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 justify-center items-center">
          <select
            onChange={(e) => setFilter((prev) => ({ ...prev, type: e.target.value }))}
            value={filter.type}
            className="border border-gray-300 bg-white text-black px-3 py-2 rounded"
          >
            <option value="all">すべて</option>
            <option value="checked">所持のみ</option>
            <option value="unchecked">未所持のみ</option>
          </select>
          <select
            onChange={(e) => setFilter((prev) => ({ ...prev, rarity: e.target.value }))}
            value={filter.rarity}
            className="border border-gray-300 bg-white text-black px-3 py-2 rounded"
          >
            <option value="all">レア度すべて</option>
            {rarityOptions.map((r) => (
              <option key={r} value={String(r)}>
                レア{r}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="名前で検索"
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            className="border border-gray-300 bg-white text-black px-3 py-2 rounded"
          />
          <button
            onClick={saveToFile}
            className={`px-4 py-2 rounded text-white ${
              checkedIds.size === 0
                ? "bg-gray-400 cursor-not-allowed grayscale"
                : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={checkedIds.size === 0}
          >
            保存
          </button>
          <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded cursor-pointer">
            読み込み
            <input type="file" accept=".mhws" onChange={loadFromFile} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {filteredCharms.map((charm) => (
          <div
            key={charm["data-id"]}
            onClick={() => toggleChecked(charm["data-id"])}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div>
              <div className="font-semibold text-base text-black">{charm["data-name"]}</div>
              <div className="text-sm text-gray-500">レア{charm["data-sort2"]}</div>
            </div>
            <input
              type="checkbox"
              checked={checkedIds.has(charm["data-id"])}
              onChange={() => toggleChecked(charm["data-id"])}
              className="w-5 h-5"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ))}
      </div>
    </Layout>
  );
}
