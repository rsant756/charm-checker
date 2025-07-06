// PrivacyPolicy.jsx
import React from "react";
import Layout from "./Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="max-w-screen-lg mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">プライバシーポリシー</h2>

        <section className="mb-4">
          <h3 className="font-semibold">第一条 用語の定義</h3>
          <p>
            「個人情報」とは、個人情報保護法に定められる「個人情報」を指します。
            氏名、生年月日、住所、電話番号、連絡先、その他特定の個人を識別できる情報を含みます。
          </p>
        </section>

        <section className="mb-4">
          <h3 className="font-semibold">第二条 収集する情報</h3>
          <p>
            本サービスでは、個人を識別できる情報の収集は行っておりません。チェックリストのデータはローカル上でのみ保存されます。
          </p>
        </section>

        <section className="mb-4">
          <h3 className="font-semibold">第三条 取得した情報の利用目的</h3>
          <p>
            本サービスでは、利用者の個人情報を一切取得・利用しません。
          </p>
        </section>

        <section className="mb-4">
          <h3 className="font-semibold">第四条 利用目的の変更</h3>
          <p>
            本サービスでは、個人情報を収集していないため、利用目的の変更もありません。
          </p>
        </section>

        <section className="mb-4">
          <h3 className="font-semibold">第五条 第三者提供</h3>
          <p>
            本サービスは個人情報を保持しないため、第三者に提供することはありません。
          </p>
        </section>

        <section className="mb-4">
          <h3 className="font-semibold">第六条 グーグル・アドセンスに関して</h3>
          <p>
            本サービスでは、将来的にGoogle AdSenseを利用し、広告収益を得る可能性があります。Googleの広告配信に関しては、Googleのプライバシーポリシーをご参照ください。
          </p>
        </section>

        <section>
          <h3 className="font-semibold">第七条 プライバシーポリシーの変更</h3>
          <p>
            製作者は、本ポリシーを予告なく変更することがあります。変更内容は本サイトにて公表します。
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
