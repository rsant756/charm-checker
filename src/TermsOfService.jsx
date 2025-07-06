// TermsOfService.jsx
import React from "react";
import Layout from "./Layout";

const TermsOfService = () => {
  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">利用規約</h2>

        <section className="mb-4">
          <h3 className="font-semibold">第一条 用語の定義</h3>
          <p>
            「本サービス」とは、製作者が提供する「装飾品取得チェッカー」を指します。
            本サービスに関する資料やプログラム一式も含みます。
          </p>
        </section>

        <section className="mb-4">
          <h3 className="font-semibold">第二条 使用権の許諾</h3>
          <p>
            製作者はユーザーに対し、本サービスの非独占的使用権を許諾します。
            著作権・その他の知的財産権は製作者に帰属します。
          </p>
        </section>

        <section className="mb-4">
          <h3 className="font-semibold">第三条 禁止事項</h3>
          <ul className="list-disc list-inside ml-4">
            <li>本サービスの無断複製・改変・公開</li>
            <li>不正アクセス・過度なアクセス</li>
            <li>その他、製作者が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="mb-4">
          <h3 className="font-semibold">第四条 免責事項</h3>
          <p>
            製作者は、本サービスの利用により生じた損害について、一切責任を負いません。
            また、サービスの内容は予告なく変更・終了することがあります。
          </p>
        </section>

        <section className="mb-4">
          <h3 className="font-semibold">第五条 利用停止</h3>
          <p>
            本規約に違反した場合、製作者はユーザーに対するサービスの提供を停止できます。
          </p>
        </section>

        <section>
          <h3 className="font-semibold">第六条 規約の変更</h3>
          <p>
            製作者は予告なく本規約を変更することがあります。変更後の内容はサイト上で告知されます。
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default TermsOfService;
