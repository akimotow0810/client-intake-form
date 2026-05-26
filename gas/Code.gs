var NOTION_VERSION = "2022-06-28";
var NOTION_API_URL = "https://api.notion.com/v1/pages";

function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  try {
    var raw = e.parameter.data;
    if (!raw) throw new Error("data parameter is missing");
    var formData = JSON.parse(raw);
    var props = PropertiesService.getScriptProperties();
    var token = props.getProperty("NOTION_TOKEN");
    var databaseId = props.getProperty("DATABASE_ID");
    if (!token || !databaseId) throw new Error("Script Properties not configured");
    var result = postToNotion(token, buildNotionPayload(databaseId, formData));
    output.setContent(JSON.stringify({ success: true, id: result.id }));
  } catch (err) {
    output.setContent(JSON.stringify({ success: false, error: err.message }));
  }
  return output;
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "GAS is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildNotionPayload(databaseId, d) {
  function title(v)  { return { title:     [{ text: { content: v || "" } }] }; }
  function rt(v)     { return { rich_text: [{ text: { content: String(v || "").slice(0, 2000) } }] }; }
  function em(v)     { return { email:        v || null }; }
  function ph(v)     { return { phone_number: v || null }; }
  function ur(v)     { return { url:          v || null }; }
  function sel(v)    { return v ? { select: { name: v } } : { select: null }; }
  function ms(arr) {
    var a = Array.isArray(arr) ? arr : (arr ? [arr] : []);
    a = a.filter(function(n) { return n && n.trim() !== ""; });
    return { multi_select: a.map(function(n) { return { name: n }; }) };
  }
  function dt(v)     { return v ? { date: { start: v } } : { date: null }; }

  return {
    parent: { database_id: databaseId },
    properties: {
      "会社名":              title(d.company_name),
      "事業内容":            rt(d.business_description),
      "業種":                sel(d.industry),
      "担当者名":            rt(d.contact_name),
      "担当者の役職":        rt(d.contact_title),
      "担当者のメールアドレス": em(d.contact_email),
      "担当者の電話番号":    ph(d.contact_phone),
      "決裁者名":            rt(d.decision_maker_name),
      "決裁者の役職":        rt(d.decision_maker_title),
      "窓口担当者名":        rt(d.window_contact_name),
      "既存サイトのURL":     ur(d.existing_site_url),
      "SNS_Twitter":         ur(d.sns_twitter),
      "SNS_Instagram":       ur(d.sns_instagram),
      "SNS_Facebook":        ur(d.sns_facebook),
      "SNS_その他":          rt(d.sns_other),
      "制作背景":            rt(d.background),
      "サイトの目的":        ms(d.site_purpose),
      "現状の課題":          rt(d.challenges),
      "目標問い合わせ件数":  rt(d.kpi_contacts),
      "目標CVR":             rt(d.kpi_cvr),
      "目標PV数":            rt(d.kpi_pv),
      "その他KPI":           rt(d.kpi_other),
      "ターゲット年齢層":    sel(d.target_age),
      "ターゲット性別":      sel(d.target_gender),
      "ターゲット職業":      rt(d.target_occupation),
      "ターゲット地域":      rt(d.target_region),
      "サブターゲット":      rt(d.sub_target),
      "ターゲットのニーズ":  rt(d.target_needs),
      "サイト訪問動機":      rt(d.visit_motivation),
      "利用シーン":          rt(d.usage_scene),
      "競合①":              rt(d.competitor1),
      "競合②":              rt(d.competitor2),
      "競合③":              rt(d.competitor3),
      "参考サイト":          rt(d.reference_sites),
      "差別化ポイント":      rt(d.differentiation),
      "自社の強み":          rt(d.strengths),
      "必要なページ":        rt(d.required_pages),
      "機能_問い合わせフォーム": sel(d.feature_contact_form),
      "機能_予約":           sel(d.feature_booking),
      "機能_EC":             sel(d.feature_ec),
      "機能_会員機能":       sel(d.feature_member),
      "機能_ブログ":         sel(d.feature_blog),
      "機能_検索":           sel(d.feature_search),
      "機能_その他":         rt(d.feature_other),
      "多言語対応":          sel(d.multilingual),
      "対応言語":            rt(d.languages),
      "原稿提供":            sel(d.manuscript_provision),
      "写真画像提供":        sel(d.photo_provision),
      "動画提供":            sel(d.video_provision),
      "ロゴデータ":          sel(d.logo_exists),
      "ブランドガイドライン": sel(d.brand_guideline_exists),
      "デザインテイスト":    ms(d.design_taste),
      "キーカラー":          rt(d.key_color),
      "ブランドカラー":      rt(d.brand_color),
      "避けたい色":          rt(d.avoid_color),
      "避けたいデザイン":    rt(d.avoid_design),
      "参考サイト良い例①":  ur(d.ref_good1),
      "参考サイト良い例②":  ur(d.ref_good2),
      "参考サイト悪い例":    ur(d.ref_bad),
      "PC対応":              sel(d.device_pc),
      "スマートフォン対応":  sel(d.device_sp),
      "タブレット対応":      sel(d.device_tablet),
      "対応ブラウザ":        rt(d.browsers),
      "CMS希望":             sel(d.cms_preference),
      "希望CMS":             rt(d.cms_name),
      "既存サーバー":        sel(d.server_exists),
      "既存ドメイン":        sel(d.domain_exists),
      "サーバードメイン移管": sel(d.migration_needed),
      "SSL対応":             sel(d.ssl_preference),
      "アクセス解析ツール":  sel(d.analytics),
      "SEO対策":             sel(d.seo),
      "対策キーワード":      rt(d.seo_keywords),
      "公開後の更新体制":    sel(d.update_system),
      "更新頻度":            rt(d.update_frequency),
      "主な更新箇所":        rt(d.update_areas),
      "サーバー監視":        sel(d.server_monitoring),
      "バックアップ対応":    sel(d.backup),
      "修正対応":            sel(d.fix_support),
      "想定運用期間":        rt(d.operation_period),
      "プライバシーポリシー": sel(d.privacy_policy),
      "利用規約":            sel(d.terms_of_service),
      "個人情報取り扱い":    rt(d.personal_info_policy),
      "業界特有の規制":      rt(d.industry_regulations),
      "公開希望日":          dt(d.launch_date),
      "絶対的な締切":        rt(d.hard_deadline),
      "予算上限":            rt(d.budget),
      "社内承認フロー":      rt(d.approval_flow),
      "確認返答期間":        rt(d.response_time),
      "希望連絡手段":        ms(d.contact_method),
      "定例MTG":             sel(d.regular_meeting)
    }
  };
}

function postToNotion(token, payload) {
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Bearer " + token,
      "Notion-Version": NOTION_VERSION
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  var response = UrlFetchApp.fetch(NOTION_API_URL, options);
  var code = response.getResponseCode();
  var body = JSON.parse(response.getContentText());
  if (code !== 200) {
    throw new Error("Notion API error " + code + ": " + (body.message || JSON.stringify(body)));
  }
  return body;
}
