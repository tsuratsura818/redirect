import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  UnderlineType, convertInchesToTwip,
} from 'docx'
import { writeFileSync } from 'fs'

const GREEN  = '059669'
const DARK   = '0F172A'
const GRAY   = '64748B'
const LGRAY  = 'F8FAFC'
const WHITE  = 'FFFFFF'
const BORDER_COLOR = 'E2E8F0'

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, color: DARK, font: 'Hiragino Kaku Gothic ProN' })],
  })
}

function heading2(text) {
  return new Paragraph({
    spacing: { before: 360, after: 160 },
    border: { bottom: { color: GREEN, size: 6, style: BorderStyle.SINGLE } },
    children: [new TextRun({ text, bold: true, size: 24, color: GREEN, font: 'Hiragino Kaku Gothic ProN' })],
  })
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 100, after: 100, line: 340 },
    children: [new TextRun({
      text,
      size: 20,
      color: opts.gray ? GRAY : DARK,
      bold: opts.bold || false,
      font: 'Hiragino Kaku Gothic ProN',
    })],
  })
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60, line: 300 },
    children: [new TextRun({ text, size: 20, color: DARK, font: 'Hiragino Kaku Gothic ProN' })],
  })
}

function quote(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120, line: 340 },
    indent: { left: convertInchesToTwip(0.3), right: convertInchesToTwip(0.3) },
    shading: { type: ShadingType.SOLID, color: 'F0FDF4' },
    border: { left: { color: GREEN, size: 18, style: BorderStyle.SINGLE } },
    children: [new TextRun({
      text,
      size: 19,
      color: DARK,
      italics: true,
      font: 'Hiragino Kaku Gothic ProN',
    })],
  })
}

function spacer(lines = 1) {
  return Array.from({ length: lines }, () => new Paragraph({ children: [new TextRun('')], spacing: { before: 0, after: 0 } }))
}

function makeTable(headers, rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      shading: { type: ShadingType.SOLID, color: GREEN },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, size: 18, color: WHITE, font: 'Hiragino Kaku Gothic ProN' })],
      })],
    })),
  })
  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map(cell => new TableCell({
      shading: { type: ShadingType.SOLID, color: ri % 2 === 0 ? WHITE : LGRAY },
      margins: { top: 70, bottom: 70, left: 120, right: 120 },
      children: [new Paragraph({
        children: [new TextRun({ text: cell, size: 18, color: DARK, font: 'Hiragino Kaku Gothic ProN' })],
      })],
    })),
  }))
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      left:   { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      right:  { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      insideH:{ style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      insideV:{ style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
    },
  })
}

const doc = new Document({
  creator: '株式会社TSURATSURA',
  title: 'プレスリリース — Pivolink ベータ版公開',
  description: 'QRコード・NFCタグのリダイレクト先を管理画面からいつでも変更できるSaaS',
  sections: [{
    properties: {
      page: {
        margin: {
          top:    convertInchesToTwip(1.0),
          bottom: convertInchesToTwip(1.0),
          left:   convertInchesToTwip(1.1),
          right:  convertInchesToTwip(1.1),
        },
      },
    },
    children: [

      // ─── ヘッダー情報 ───────────────────────────────────────────
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 60 },
        children: [new TextRun({ text: '報道関係者各位', size: 18, color: GRAY, font: 'Hiragino Kaku Gothic ProN' })],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 60 },
        children: [new TextRun({ text: '2026年3月18日', size: 18, color: GRAY, font: 'Hiragino Kaku Gothic ProN' })],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 320 },
        children: [new TextRun({ text: '株式会社TSURATSURA', size: 18, color: GRAY, font: 'Hiragino Kaku Gothic ProN' })],
      }),

      // ─── メインタイトル ──────────────────────────────────────────
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [new TextRun({
          text: '「印刷したQRコードのURLは、後から変えられる。」',
          bold: true, size: 36, color: GREEN, font: 'Hiragino Kaku Gothic ProN',
        })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 400 },
        children: [new TextRun({
          text: 'QRコード・NFCタグのリダイレクト先を管理画面からいつでも変更できるSaaS\n「Pivolink（ピボリンク）」、ベータ版を本日一般公開',
          bold: true, size: 24, color: DARK, font: 'Hiragino Kaku Gothic ProN',
        })],
      }),

      // ─── リード ─────────────────────────────────────────────────
      heading2('リード'),
      body('株式会社TSURATSURA（所在地：大阪府大阪市天王寺区、代表取締役：西川）は、印刷済みQRコードおよび設置済みNFCタグのリダイレクト先URLを管理画面からいつでも変更できるSaaS「Pivolink（ピボリンク）」のベータ版を、本日2026年3月18日より一般公開します。'),
      body('Pivolinkを導入することで、企業や店舗はチラシ・名刺・パッケージ・商品タグに印刷したQRコードや、店頭・施設に設置したNFCタグを再印刷・再設置することなく、リンク先を自由に変更することができます。'),
      body('サービスURL：https://redirect.tsuratsura.com', { bold: true }),

      // ─── 背景・課題 ──────────────────────────────────────────────
      ...spacer(1),
      heading2('背景・課題'),
      body('QRコードとNFCタグは、実店舗とデジタルをつなぐ接点として多くの企業・店舗に普及しています。一方で現場では「一度印刷・設置したものは変更できない」という前提のもと、以下のような課題が繰り返し発生しています。'),
      ...spacer(1),
      bullet('キャンペーン終了のたびにQRチラシを刷り直すコストと手間'),
      bullet('商品リニューアル・EC移行時に名刺や同梱物のQRがリンク切れになる'),
      bullet('リコール発生時にパッケージのQRコードを緊急切替できない'),
      bullet('売り切れ商品のNFCタグが404エラーへ誘導し続ける'),
      bullet('季節ごとにNFCタグを全台書き換える作業コスト'),
      ...spacer(1),
      body('これらの課題に共通するのは「QRコード・NFCタグは一度作ったら終わり」という発想です。Pivolinkはこの前提を根本から変え、配布後も管理・運用し続けられる資産に変えます。'),

      // ─── サービス概要 ────────────────────────────────────────────
      ...spacer(1),
      heading2('サービス概要'),
      body('PivolinkはQRコード・NFCタグのリダイレクト先URLを動的に管理するSaaSサービスです。'),
      ...spacer(1),
      body('利用の流れはシンプルです。'),
      new Paragraph({
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { before: 60, after: 60, line: 300 },
        children: [new TextRun({ text: 'Pivolinkでリンクを発行（例：redirect.tsuratsura.com/r/summer）', size: 20, color: DARK, font: 'Hiragino Kaku Gothic ProN' })],
      }),
      new Paragraph({
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { before: 60, after: 60, line: 300 },
        children: [new TextRun({ text: 'そのURLをQRコードにして印刷 / NFCタグに書き込む', size: 20, color: DARK, font: 'Hiragino Kaku Gothic ProN' })],
      }),
      new Paragraph({
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { before: 60, after: 60, line: 300 },
        children: [new TextRun({ text: 'キャンペーンや掲載先が変わったら、管理画面でリンク先を変えるだけ', size: 20, color: DARK, font: 'Hiragino Kaku Gothic ProN' })],
      }),
      ...spacer(1),
      body('QRコード・NFCタグ自体は変わりません。リンク先だけが変わります。再印刷も再設置も不要です。'),

      // ─── 主な機能 ────────────────────────────────────────────────
      ...spacer(1),
      heading2('主な機能'),
      ...spacer(1),
      makeTable(
        ['機能', '概要'],
        [
          ['リダイレクト先の変更', '管理画面からワンクリック、即時反映'],
          ['QRコード自動生成', 'PNG / SVGで高品質なQRコードを自動生成'],
          ['スケジュール切替', '指定日時にリダイレクト先を自動切替'],
          ['デバイス別振分', 'iOS / Android / PCで異なるURLへ振り分け'],
          ['A / Bテスト', 'トラフィックを分割し2つのURLの効果を比較'],
          ['クッションページ', 'リダイレクト前にお知らせやクーポンを表示'],
          ['アクセス解析', 'スキャン数・デバイス・地域別をリアルタイム可視化'],
          ['変更履歴', 'いつ・誰が・どのURLに変更したかを完全ログ管理'],
          ['有効期限設定', '期限切れ後は指定のフォールバックページへ自動転送'],
        ]
      ),

      // ─── 活用事例 ────────────────────────────────────────────────
      ...spacer(1),
      heading2('活用事例'),
      body('飲食店 / ホテル・旅館', { bold: true }),
      body('テーブルや客室のNFCタグを、スケジュール機能で春は花見、夏は海、冬はスキー場ガイドへ自動切替。季節のたびにタグを書き換える作業が不要になります。'),
      ...spacer(1),
      body('不動産', { bold: true }),
      body('成約済み物件のQRチラシを廃棄せず、リンク先を次の物件情報に差し替えて再利用。印刷コストと廃棄物を同時に削減できます。'),
      ...spacer(1),
      body('製造業・メーカー', { bold: true }),
      body('パッケージのQRコードをリコール告知ページに緊急切替。管理画面からワンクリックで対応できます。'),
      ...spacer(1),
      body('ECショップ', { bold: true }),
      body('商品同梱のQRで「レビュー誘導」と「クーポン配布」をA/Bテスト。どちらの施策が効果的かをデータで検証できます。'),
      ...spacer(1),
      body('観光・インバウンド', { bold: true }),
      body('デバイス別振分機能でiOSユーザーには英語ページ、Androidユーザーには中国語ページへ自動転送。外国人観光客対応が即日実現します。'),

      // ─── 多言語対応 ──────────────────────────────────────────────
      ...spacer(1),
      heading2('多言語対応'),
      body('ベータ版公開と同時に日本語・英語・中国語の3言語でのサービス提供を開始します。インバウンド需要の高い観光・小売・ホテル・飲食業での活用に対応しています。'),

      // ─── 料金プラン ──────────────────────────────────────────────
      ...spacer(1),
      heading2('料金プラン'),
      ...spacer(1),
      makeTable(
        ['プラン', 'ベータ価格', '通常価格（正式リリース後）', '主な上限'],
        [
          ['Free',     '¥0 / 月',      '¥0 / 月',      'リダイレクト3件、月間1,000アクセス'],
          ['Pro',      '¥780 / 月',    '¥980 / 月',    '50件、月間50,000アクセス、全ルール機能'],
          ['Business', '¥3,980 / 月',  '¥4,980 / 月',  '無制限、優先サポート'],
        ]
      ),
      ...spacer(1),
      body('ベータ期間中は全有料プランを20%OFFの特別価格で提供します。Freeプランはクレジットカード登録不要で即日開始可能です。年額プランは月額換算でさらに約17%お得になります。'),

      // ─── 代表者コメント ──────────────────────────────────────────
      ...spacer(1),
      heading2('代表者コメント'),
      ...spacer(1),
      quote('「きっかけは自分自身の体験でした。キャンペーンが変わるたびにQRコードを刷り直す、NFCタグを毎月書き換える——そのコストと手間に疑問を感じていました。QRコードを『使い捨て』ではなく『運用し続けられる資産』にしたい、という思いからPivolinkを開発しました。ベータ版ということでご不便をおかけする場面もあるかと思いますが、ユーザーの皆様の声を反映しながら、日本発のスタンダードなサービスに育てていきます。」'),
      ...spacer(1),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: '株式会社TSURATSURA 代表取締役　西川', size: 18, color: GRAY, font: 'Hiragino Kaku Gothic ProN' })],
      }),

      // ─── 今後の展開 ──────────────────────────────────────────────
      ...spacer(1),
      heading2('今後の展開'),
      body('ベータ版公開後は、ユーザーからのフィードバックをもとに機能改善を行いながら、以下の機能追加を予定しています。'),
      bullet('カスタムドメイン（独自ドメインでのリダイレクト管理）'),
      bullet('チーム・複数メンバー管理'),
      bullet('API提供（外部システムとの連携）'),
      bullet('Slack / メール通知連携'),

      // ─── 会社概要 ────────────────────────────────────────────────
      ...spacer(1),
      heading2('会社概要'),
      ...spacer(1),
      makeTable(
        ['項目', '内容'],
        [
          ['会社名',   '株式会社TSURATSURA'],
          ['代表者',   '代表取締役　西川'],
          ['所在地',   '〒543-0075 大阪府大阪市天王寺区夕陽丘町4-2 MetoroPorte四天王寺前夕陽丘Ⅲ 7号室'],
          ['電話番号', '080-6224-1704'],
          ['事業内容', 'SaaSプロダクト開発・運営'],
          ['サービスURL', 'https://redirect.tsuratsura.com'],
        ]
      ),

      // ─── お問い合わせ ────────────────────────────────────────────
      ...spacer(1),
      heading2('本件に関するお問い合わせ'),
      body('株式会社TSURATSURA'),
      body('お問い合わせフォーム：https://redirect.tsuratsura.com/contact'),
      ...spacer(2),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: '以上', size: 20, color: GRAY, font: 'Hiragino Kaku Gothic ProN' })],
      }),
    ],
  }],
  numbering: {
    config: [{
      reference: 'default-numbering',
      levels: [{
        level: 0,
        format: 'decimal',
        text: '%1.',
        alignment: AlignmentType.START,
        style: { paragraph: { indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) } } },
      }],
    }],
  },
})

const buf = await Packer.toBuffer(doc)
writeFileSync('PRESS_RELEASE.docx', buf)
console.log('✅ PRESS_RELEASE.docx を生成しました')
